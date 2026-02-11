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
}

const AssistantContext = createContext<AssistantContextType | null>(null);

export const useAssistant = () => {
  const ctx = useContext(AssistantContext);
  if (!ctx) throw new Error('useAssistant must be used within AssistantProvider');
  return ctx;
};

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

      setMessages(prev =>
        prev.map(m =>
          m.id === loadingMsg.id
            ? {
                ...m,
                content: data?.message || "Sorry, I couldn't generate a response.",
                toolsUsed: data?.toolsUsed,
                isLoading: false,
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

  return (
    <AssistantContext.Provider
      value={{ isOpen, messages, isLoading, togglePanel, openPanel, closePanel, sendMessage, clearConversation }}
    >
      {children}
    </AssistantContext.Provider>
  );
};
