import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolsUsed?: { tool: string; input: any; summary: string }[];
  timestamp: Date;
  isLoading?: boolean;
  isError?: boolean;
  hasConfirmation?: boolean;
  confirmationState?: 'pending' | 'confirmed' | 'cancelled';
}

interface AssistantContextType {
  isOpen: boolean;
  messages: ChatMessage[];
  isLoading: boolean;
  togglePanel: () => void;
  openPanel: () => void;
  closePanel: () => void;
  sendMessage: (content: string) => Promise<void>;
  clearConversation: () => void;
  confirmAction: (messageId: string, action: 'confirmed' | 'cancelled') => void;
}

const AssistantContext = createContext<AssistantContextType | null>(null);

export const useAssistant = () => {
  const ctx = useContext(AssistantContext);
  if (!ctx) throw new Error('useAssistant must be used within AssistantProvider');
  return ctx;
};

// Detection: message has "?" and 2+ bold markers
function detectConfirmation(content: string): boolean {
  if (!content) return false;
  const hasBold = (content.match(/\*\*/g) || []).length >= 2;
  const hasQuestion = content.includes('?');
  return hasBold && hasQuestion;
}

export const AssistantProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const togglePanel = useCallback(() => setIsOpen(p => !p), []);
  const openPanel = useCallback(() => setIsOpen(true), []);
  const closePanel = useCallback(() => setIsOpen(false), []);
  const clearConversation = useCallback(() => setMessages([]), []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    const loadingMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true,
    };

    setMessages(prev => [...prev, userMsg, loadingMsg]);
    setIsLoading(true);

    try {
      const conversationHistory = messages.slice(-20).map(m => ({
        role: m.role,
        content: m.content,
      }));

      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          message: content.trim(),
          conversationHistory,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const responseContent = data?.message || "Sorry, I couldn't generate a response.";
      const isConfirmation = detectConfirmation(responseContent);

      setMessages(prev =>
        prev.map(m =>
          m.id === loadingMsg.id
            ? {
                ...m,
                content: responseContent,
                toolsUsed: data?.toolsUsed,
                isLoading: false,
                hasConfirmation: isConfirmation,
                confirmationState: isConfirmation ? 'pending' : undefined,
              }
            : m
        )
      );
    } catch (err: any) {
      console.error('AI Assistant error:', err);
      setMessages(prev =>
        prev.map(m =>
          m.id === loadingMsg.id
            ? {
                ...m,
                content: err.message || 'Failed to get response. Please try again.',
                isLoading: false,
                isError: true,
              }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading]);

  const confirmAction = useCallback((messageId: string, action: 'confirmed' | 'cancelled') => {
    setMessages(prev =>
      prev.map(m =>
        m.id === messageId ? { ...m, confirmationState: action } : m
      )
    );
    // Send the follow-up message
    const followUp = action === 'confirmed' ? 'Yes, confirmed' : 'Cancel that';
    sendMessage(followUp);
  }, [sendMessage]);

  return (
    <AssistantContext.Provider
      value={{ isOpen, messages, isLoading, togglePanel, openPanel, closePanel, sendMessage, clearConversation, confirmAction }}
    >
      {children}
    </AssistantContext.Provider>
  );
};
