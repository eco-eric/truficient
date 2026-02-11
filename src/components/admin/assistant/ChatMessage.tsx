import { useState } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, RotateCcw } from 'lucide-react';
import type { ChatMessage as ChatMessageType } from './AssistantContext';

interface ChatMessageProps {
  message: ChatMessageType;
  onRetry?: () => void;
}

export const ChatMessage = ({ message, onRetry }: ChatMessageProps) => {
  const [showTools, setShowTools] = useState(false);

  // Loading state
  if (message.isLoading) {
    return (
      <div className="flex justify-start">
        <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-3.5 py-2.5 max-w-[85%]">
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="inline-block w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="inline-block w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (message.isError) {
    return (
      <div className="flex justify-start">
        <div className="bg-red-50 border border-red-200 rounded-2xl rounded-bl-sm px-3.5 py-2.5 max-w-[85%]">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm text-red-700">{message.content}</p>
              {onRetry && (
                <button onClick={onRetry} className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800 mt-1.5 font-medium">
                  <RotateCcw className="h-3 w-3" /> Retry
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isUser = message.role === 'user';

  // Format assistant content
  const formatContent = (text: string) => {
    return text.split('\n').map((line, i) => {
      // Bold text
      let formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Info rows
      if (/^[📞📧📍🏠📅💰🔧]/.test(line)) {
        return <p key={i} className="text-sm my-0.5" dangerouslySetInnerHTML={{ __html: formatted }} />;
      }
      // Bullets
      if (line.startsWith('• ') || line.startsWith('- ')) {
        return <p key={i} className="text-sm pl-3 my-0.5" dangerouslySetInnerHTML={{ __html: `• ${formatted.slice(2)}` }} />;
      }
      if (line.trim() === '') return <br key={i} />;
      return <p key={i} className="text-sm my-0.5" dangerouslySetInnerHTML={{ __html: formatted }} />;
    });
  };

  const timeStr = message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className="max-w-[85%]">
        <div
          className={`px-3.5 py-2.5 ${
            isUser
              ? 'bg-[#1B2A4A] text-white rounded-2xl rounded-br-sm'
              : 'bg-gray-100 text-gray-800 rounded-2xl rounded-bl-sm'
          }`}
        >
          {isUser ? (
            <p className="text-sm">{message.content}</p>
          ) : (
            <div>{formatContent(message.content)}</div>
          )}
        </div>

        <div className={`flex items-center gap-2 mt-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
          <span className="text-xs text-gray-400">{timeStr}</span>
          {!isUser && message.toolsUsed && message.toolsUsed.length > 0 && (
            <button
              onClick={() => setShowTools(p => !p)}
              className="flex items-center gap-0.5 text-xs text-gray-400 hover:text-gray-600"
            >
              {message.toolsUsed.length} tool{message.toolsUsed.length > 1 ? 's' : ''} used
              {showTools ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
          )}
        </div>

        {showTools && message.toolsUsed && (
          <div className="mt-1 px-2 py-1.5 bg-gray-50 rounded text-xs text-gray-500 space-y-0.5">
            {message.toolsUsed.map((t, i) => (
              <div key={i}>🔧 {t.summary}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
