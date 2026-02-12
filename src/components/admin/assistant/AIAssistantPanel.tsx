import { useRef, useEffect, useState, useCallback } from 'react';
import { Minus, Trash2, Send, Mic, MicOff, Zap } from 'lucide-react';
import { useAssistant } from './AssistantContext';
import { ChatMessage } from './ChatMessage';
import { QuickPrompts } from './QuickPrompts';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';

export const AIAssistantPanel = () => {
  const { isOpen, messages, isLoading, closePanel, sendMessage, clearConversation, confirmAction } = useAssistant();
  const [input, setInput] = useState('');
  const [sendCooldown, setSendCooldown] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  const isMobile = useIsMobile();
  const { toast } = useToast();

  // Speech recognition setup
  const initRecognition = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({ title: 'Not supported', description: 'Speech recognition is not supported in this browser.', variant: 'destructive' });
      return null;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const latestResult = event.results[event.results.length - 1];
      if (latestResult.isFinal) {
        const transcript = latestResult[0].transcript;
        setInput(prev => (prev ? prev + ' ' : '') + transcript.trim());
      }
    };

    recognition.onend = () => {
      if (isListeningRef.current) {
        try { recognition.start(); } catch {}
      } else {
        setIsListening(false);
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'not-allowed') {
        toast({ title: 'Mic blocked', description: 'Please allow microphone access.', variant: 'destructive' });
        isListeningRef.current = false;
        setIsListening(false);
      }
    };

    return recognition;
  }, [toast]);

  const handleMicToggle = useCallback(() => {
    if (isListeningRef.current) {
      isListeningRef.current = false;
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (!recognitionRef.current) {
        recognitionRef.current = initRecognition();
      }
      if (recognitionRef.current) {
        isListeningRef.current = true;
        setIsListening(true);
        recognitionRef.current.start();
      }
    }
  }, [initRecognition]);

  useEffect(() => {
    return () => {
      isListeningRef.current = false;
      recognitionRef.current?.stop();
    };
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 350);
    }
  }, [isOpen]);

  // Escape to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) closePanel();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, closePanel]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading || sendCooldown) return;
    if (isListeningRef.current) {
      isListeningRef.current = false;
      recognitionRef.current?.stop();
      setIsListening(false);
    }
    const text = input;
    setInput('');
    if (inputRef.current) inputRef.current.style.height = 'auto';
    setSendCooldown(true);
    setTimeout(() => setSendCooldown(false), 1000);
    await sendMessage(text);
  }, [input, isLoading, sendCooldown, sendMessage]);

  const handleClear = () => {
    toast({ title: 'Chat cleared', description: 'Conversation history has been reset.' });
    clearConversation();
  };

  const handleQuickPrompt = (prompt: string) => {
    sendMessage(prompt);
  };

  // Find last assistant message index
  const lastAssistantIdx = messages.reduceRight((found, m, i) => {
    if (found >= 0) return found;
    return m.role === 'assistant' && !m.isLoading ? i : -1;
  }, -1);

  // Check if there's a pending confirmation
  const hasPendingConfirmation = lastAssistantIdx >= 0 && messages[lastAssistantIdx]?.confirmationState === 'pending';

  return (
    <div
      className={`fixed z-[45] flex flex-col bg-white transition-transform duration-300 ease-out
        ${isMobile ? 'inset-0' : 'top-12 right-0 w-[400px] h-[calc(100vh-48px)] border-l border-gray-200'}
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        shadow-[-4px_0_12px_rgba(0,0,0,0.1)]`}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-12 px-4 bg-[#1B2A4A] shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-base">🎵</span>
          <span className="text-white font-semibold text-sm">Bach Assistant</span>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <button onClick={handleClear} className="p-1.5 rounded hover:bg-white/10 transition-colors" title="Clear chat">
              <Trash2 className="h-4 w-4 text-[#C4A962]" />
            </button>
          )}
          <button onClick={closePanel} className="p-1.5 rounded hover:bg-white/10 transition-colors" title="Minimize">
            <Minus className="h-4 w-4 text-[#C4A962]" />
          </button>
        </div>
      </div>

      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <QuickPrompts onSelect={handleQuickPrompt} />
        ) : (
          <div className="space-y-3">
            {messages.map((msg, idx) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                isLatestAssistant={idx === lastAssistantIdx}
                onConfirm={() => confirmAction(msg.id, 'confirmed')}
                onCancel={() => confirmAction(msg.id, 'cancelled')}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pending confirmation bar */}
      {hasPendingConfirmation && (
        <div className="shrink-0 bg-amber-50 border-b border-amber-200 px-4 py-1.5 flex items-center gap-1.5">
          <Zap className="h-3 w-3 text-amber-700" />
          <span className="text-xs text-amber-700 font-medium">Awaiting your confirmation above...</span>
        </div>
      )}

      {/* Input area */}
      <div className="shrink-0 border-t border-gray-200 bg-gray-50 p-3">
        <div className="flex items-end gap-2">
          <button
            onClick={handleMicToggle}
            className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
              isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-200 hover:bg-gray-300'
            }`}
            title={isListening ? 'Stop listening' : 'Voice input'}
          >
            {isListening ? (
              <MicOff className="h-4 w-4 text-white" />
            ) : (
              <Mic className="h-4 w-4 text-gray-600" />
            )}
          </button>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask me anything..."
            rows={3}
            className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]/30 focus:border-[#1B2A4A] max-h-[280px] min-h-[60px]"
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            onInput={e => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = Math.min(target.scrollHeight, 280) + 'px';
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading || sendCooldown}
            className="shrink-0 w-9 h-9 rounded-full bg-[#1B2A4A] flex items-center justify-center disabled:opacity-40 transition-opacity hover:opacity-90"
          >
            <Send className="h-4 w-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};
