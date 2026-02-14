import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  GripVertical, 
  DollarSign, 
  Calendar, 
  MoreHorizontal,
  Phone,
  Mail,
  Pencil,
  Trash2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

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

interface PipelineCardProps {
  entry: PipelineEntry;
  onEdit: (entry: PipelineEntry) => void;
  onDelete: (entryId: string) => void;
}

export const PipelineCard = ({ entry, onEdit, onDelete }: PipelineCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: entry.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const customerName = entry.customer.company_name || 
    `${entry.customer.first_name || ''} ${entry.customer.last_name || ''}`.trim() || 
    'Unknown';

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-card border rounded-lg shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing group"
    >
      <div className="p-3">
        {/* Header: name + actions */}
        <div className="flex items-start justify-between gap-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <div
              {...attributes}
              {...listeners}
              className="text-muted-foreground/40 group-hover:text-muted-foreground transition-colors shrink-0"
            >
              <GripVertical className="h-3.5 w-3.5" />
            </div>
            <Link 
              to={`/admin/customers/${entry.customer_id}`}
              className="font-semibold text-sm hover:text-primary truncate block transition-colors"
            >
              {customerName}
            </Link>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(entry)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(entry.id)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Type badge + probability */}
        <div className="flex items-center gap-2 mt-1.5">
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 capitalize">
            {entry.customer.customer_type}
          </Badge>
          {entry.probability != null && (
            <span className="text-[10px] text-muted-foreground">
              {entry.probability}% likely
            </span>
          )}
        </div>

        {/* Value */}
        {entry.estimated_value != null && (
          <div className="flex items-center gap-1 mt-2 text-sm font-bold text-primary">
            <DollarSign className="h-3.5 w-3.5" />
            {formatCurrency(entry.estimated_value)}
          </div>
        )}

        {/* Close date + contact icons row */}
        <div className="flex items-center justify-between mt-2">
          {entry.expected_close_date ? (
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {format(new Date(entry.expected_close_date), 'MMM d, yyyy')}
            </div>
          ) : <div />}
          
          <div className="flex items-center gap-1.5">
            {entry.customer.phone && (
              <a 
                href={`tel:${entry.customer.phone}`}
                className="text-muted-foreground hover:text-primary transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <Phone className="h-3.5 w-3.5" />
              </a>
            )}
            {entry.customer.email && (
              <a 
                href={`mailto:${entry.customer.email}`}
                className="text-muted-foreground hover:text-primary transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <Mail className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Notes preview */}
        {entry.notes && (
          <p className="text-[11px] text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
            {entry.notes}
          </p>
        )}
      </div>
    </div>
  );
};
