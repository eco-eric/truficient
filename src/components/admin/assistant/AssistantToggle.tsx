import { MessageSquare, X } from 'lucide-react';
import { useAssistant } from './AssistantContext';
import { useIsMobile } from '@/hooks/use-mobile';

export const AssistantToggle = () => {
  const { isOpen, togglePanel } = useAssistant();
  const isMobile = useIsMobile();

  return (
    <button
      onClick={togglePanel}
      className={`fixed z-50 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center
        ${isMobile ? 'w-12 h-12 bottom-5 right-5' : 'w-14 h-14 bottom-6 right-6'}
        bg-[#1B2A4A] hover:scale-105 hover:shadow-xl`}
      aria-label={isOpen ? 'Close AI Assistant' : 'Open AI Assistant'}
    >
      {isOpen ? (
        <X className="h-6 w-6 text-[#C4A962]" />
      ) : (
        <MessageSquare className="h-6 w-6 text-[#C4A962]" />
      )}
    </button>
  );
};
