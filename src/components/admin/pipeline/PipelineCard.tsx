import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
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
    <Card
      ref={setNodeRef}
      style={style}
      className="bg-card border shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          <div
            {...attributes}
            {...listeners}
            className="mt-1 text-muted-foreground hover:text-foreground"
          >
            <GripVertical className="h-4 w-4" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <Link 
                to={`/admin/customers/${entry.customer_id}`}
                className="font-medium text-sm hover:underline truncate block"
              >
                {customerName}
              </Link>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
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

            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {entry.customer.customer_type}
              </Badge>
              {entry.probability && (
                <span className="text-xs text-muted-foreground">
                  {entry.probability}%
                </span>
              )}
            </div>

            {entry.estimated_value && (
              <div className="flex items-center gap-1 mt-2 text-sm font-medium text-primary">
                <DollarSign className="h-3.5 w-3.5" />
                {formatCurrency(entry.estimated_value)}
              </div>
            )}

            {entry.expected_close_date && (
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {format(new Date(entry.expected_close_date), 'MMM d, yyyy')}
              </div>
            )}

            <div className="flex items-center gap-2 mt-2">
              {entry.customer.phone && (
                <a 
                  href={`tel:${entry.customer.phone}`}
                  className="text-muted-foreground hover:text-foreground"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Phone className="h-3.5 w-3.5" />
                </a>
              )}
              {entry.customer.email && (
                <a 
                  href={`mailto:${entry.customer.email}`}
                  className="text-muted-foreground hover:text-foreground"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Mail className="h-3.5 w-3.5" />
                </a>
              )}
            </div>

            {entry.notes && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                {entry.notes}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
