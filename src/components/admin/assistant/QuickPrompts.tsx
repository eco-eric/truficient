import { Sparkles } from 'lucide-react';

const PROMPTS = [
  'Find a customer',
  "What's on the schedule tomorrow?",
  'How many leads this week?',
  'Show me the pipeline',
  'Recent submissions',
  'Team & crew info',
];

interface QuickPromptsProps {
  onSelect: (prompt: string) => void;
}

export const QuickPrompts = ({ onSelect }: QuickPromptsProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-8 text-center">
      <Sparkles className="h-8 w-8 text-[#C4A962] mb-3" />
      <h3 className="text-lg font-semibold text-gray-800 mb-1">Hi! I'm Tru</h3>
      <p className="text-sm text-gray-500 mb-6 max-w-[280px]">
        Your AI operations assistant. I can help you search customers, check schedules, and more.
      </p>
      <div className="grid grid-cols-2 gap-2 w-full max-w-[320px]">
        {PROMPTS.map(prompt => (
          <button
            key={prompt}
            onClick={() => onSelect(prompt)}
            className="text-left text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 hover:border-[#1B2A4A]/30 transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
};
