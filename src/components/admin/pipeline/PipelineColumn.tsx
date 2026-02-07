import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PipelineCard } from './PipelineCard';
import { cn } from '@/lib/utils';

interface PipelineStage {
  id: string;
  name: string;
  display_name: string;
  color: string;
  sort_order: number;
  is_won_stage: boolean | null;
  is_lost_stage: boolean | null;
}

interface PipelineEntry {
  id: string;
  customer_id: string;
  stage_id: string;
  estimated_value: number | null;
  probability: number | null;
  expected_close_date: string | null;
  notes: string | null;
  customer: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    company_name: string | null;
    email: string | null;
    phone: string | null;
    customer_type: string;
  };
}

interface PipelineColumnProps {
  stage: PipelineStage;
  entries: PipelineEntry[];
  onEditEntry: (entry: PipelineEntry) => void;
  onDeleteEntry: (entryId: string) => void;
}

export const PipelineColumn = ({ 
  stage, 
  entries, 
  onEditEntry, 
  onDeleteEntry 
}: PipelineColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  });

  const totalValue = entries.reduce((sum, e) => sum + (e.estimated_value || 0), 0);
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card 
      className={cn(
        "min-h-[500px] flex flex-col bg-muted/30",
        isOver && "ring-2 ring-primary ring-offset-2"
      )}
    >
      <CardHeader className="pb-2 space-y-1">
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full shrink-0" 
            style={{ backgroundColor: stage.color }}
          />
          <CardTitle className="text-sm font-medium truncate">
            {stage.display_name}
          </CardTitle>
          <span className="text-xs text-muted-foreground ml-auto">
            {entries.length}
          </span>
        </div>
        {totalValue > 0 && (
          <p className="text-xs text-muted-foreground font-medium">
            {formatCurrency(totalValue)}
          </p>
        )}
      </CardHeader>
      
      <CardContent 
        ref={setNodeRef}
        className="flex-1 pt-2 space-y-2 overflow-y-auto"
      >
        <SortableContext 
          items={entries.map(e => e.id)} 
          strategy={verticalListSortingStrategy}
        >
          {entries.map((entry) => (
            <PipelineCard
              key={entry.id}
              entry={entry}
              onEdit={onEditEntry}
              onDelete={onDeleteEntry}
            />
          ))}
        </SortableContext>
        
        {entries.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed rounded-lg bg-background/50">
            <p className="text-xs text-muted-foreground">
              Drop leads here
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
