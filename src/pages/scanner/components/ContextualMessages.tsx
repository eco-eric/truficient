import { Card } from '@/components/ui/card';
import { AlertTriangle, Clock, TrendingUp } from 'lucide-react';
import { useScanner } from '../context/ScannerContext';

interface MessageCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  variant: 'warning' | 'info' | 'tip';
}

function MessageCard({ icon, title, description, variant }: MessageCardProps) {
  const bgColors = {
    warning: 'bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-800',
    info: 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800',
    tip: 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800',
  };

  const iconColors = {
    warning: 'text-orange-600 dark:text-orange-400',
    info: 'text-blue-600 dark:text-blue-400',
    tip: 'text-green-600 dark:text-green-400',
  };

  return (
    <Card className={`p-4 ${bgColors[variant]} border`}>
      <div className="flex gap-3">
        <div className={iconColors[variant]}>{icon}</div>
        <div className="space-y-1">
          <h4 className="font-semibold text-foreground">{title}</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </Card>
  );
}

export function ContextualMessages() {
  const { state } = useScanner();
  const { result } = state;

  if (!result?.specs) {
    return null;
  }

  const { specs } = result;
  const currentYear = new Date().getFullYear();
  const age = specs.manufactured_year
    ? currentYear - specs.manufactured_year
    : null;

  const messages: MessageCardProps[] = [];

  // R-22 refrigerant warning (fully phased out in 2020)
  if (specs.refrigerant?.toUpperCase().includes('R-22') || specs.refrigerant?.toUpperCase().includes('R22')) {
    messages.push({
      icon: <AlertTriangle className="w-5 h-5" />,
      title: 'R-22 Refrigerant (Legacy)',
      description:
        'This system uses R-22 refrigerant, which was fully phased out in 2020. Repairs requiring refrigerant are extremely costly. Consider upgrading to a system using R-454B or R-32.',
      variant: 'warning',
    });
  }

  // Age warning (12+ years)
  if (age && age >= 12) {
    messages.push({
      icon: <Clock className="w-5 h-5" />,
      title: 'System Age Consideration',
      description: `Your system is approximately ${age} years old. HVAC systems typically last 15-20 years. Consider planning for replacement to avoid unexpected breakdowns.`,
      variant: 'info',
    });
  }

  // Low SEER warning
  if (specs.seer_rating && specs.seer_rating < 14) {
    messages.push({
      icon: <TrendingUp className="w-5 h-5" />,
      title: 'Efficiency Opportunity',
      description: `Your system has a SEER rating of ${specs.seer_rating}. Newer systems with SEER ratings of 16+ can reduce energy costs by 20-40% compared to older units.`,
      variant: 'tip',
    });
  }

  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-foreground">Things to Know</h3>
      {messages.map((message, index) => (
        <MessageCard key={index} {...message} />
      ))}
    </div>
  );
}
