import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ClipboardList, Plus, Trash2, GripVertical, Loader2, FileDown, Copy, Mail } from 'lucide-react';
import { downloadJobListPDF } from '@/utils/generateJobListPDF';
import { toast } from 'sonner';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';


interface JobListPanelProps {
  estimateId: string;
}

interface JobList {
  id: string;
  estimate_id: string;
  status: string;
  supplier_name: string | null;
  notes: string | null;
  estimate_synced_at: string | null;
}

interface JobListItem {
  id: string;
  job_list_id: string;
  source_line_item_id: string | null;
  name: string;
  description: string | null;
  quantity: number;
  unit: string;
  is_manually_edited: boolean;
  manually_added: boolean;
  sort_order: number;
}

const INCLUDED_SECTIONS = ['equipment_controls', 'miscellaneous_inside', 'ducting'];

export const JobListPanel = ({ estimateId }: JobListPanelProps) => {
  const qc = useQueryClient();
  const [emailOpen, setEmailOpen] = useState(false);


  const { data: jobList, isLoading } = useQuery({
    queryKey: ['job-list', estimateId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_job_lists')
        .select('*')
        .eq('estimate_id', estimateId)
        .maybeSingle();
      if (error) throw error;
      return data as JobList | null;
    },
  });

  const { data: estimateMeta } = useQuery({
    queryKey: ['estimate-meta-for-joblist', estimateId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('estimates')
        .select('estimate_number')
        .eq('id', estimateId)
        .maybeSingle();
      if (error) throw error;
      return data as { estimate_number: string } | null;
    },
  });

  const { data: items = [] } = useQuery({
    queryKey: ['job-list-items', jobList?.id],
    enabled: !!jobList?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_job_list_items')
        .select('*')
        .eq('job_list_id', jobList!.id)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data as JobListItem[];
    },
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      // Get estimate updated_at & line items
      const { data: est, error: estErr } = await supabase
        .from('estimates')
        .select('id, updated_at')
        .eq('id', estimateId)
        .single();
      if (estErr) throw estErr;

      const { data: lineItems, error: liErr } = await supabase
        .from('estimate_line_items')
        .select('*')
        .eq('estimate_id', estimateId)
        .order('sort_order', { ascending: true });
      if (liErr) throw liErr;

      const userRes = await supabase.auth.getUser();

      const { data: newList, error: listErr } = await supabase
        .from('crm_job_lists')
        .insert({
          estimate_id: estimateId,
          status: 'draft',
          estimate_synced_at: est.updated_at,
          created_by: userRes.data.user?.id ?? null,
        })
        .select()
        .single();
      if (listErr) throw listErr;

      const eligible = (lineItems || []).filter((li: any) =>
        INCLUDED_SECTIONS.includes(li.section)
      );

      if (eligible.length > 0) {
        const rows = eligible.map((li: any, idx: number) => ({
          job_list_id: newList.id,
          source_line_item_id: li.id,
          name: li.name,
          description: li.description,
          quantity: li.quantity,
          unit: li.unit || 'each',
          sort_order: idx,
        }));
        const { error: itemsErr } = await supabase.from('crm_job_list_items').insert(rows);
        if (itemsErr) throw itemsErr;
      }
      return newList;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['job-list', estimateId] });
      toast.success('Job list generated');
    },
    onError: (e: any) => toast.error(e.message || 'Failed to generate job list'),
  });

  const updateListMutation = useMutation({
    mutationFn: async (patch: Partial<JobList>) => {
      const { error } = await supabase
        .from('crm_job_lists')
        .update(patch)
        .eq('id', jobList!.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['job-list', estimateId] }),
    onError: (e: any) => toast.error(e.message || 'Save failed'),
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, patch, markEdited }: { id: string; patch: Partial<JobListItem>; markEdited: boolean }) => {
      const item = items.find((i) => i.id === id);
      const finalPatch: any = { ...patch };
      if (markEdited && item && !item.manually_added && !item.is_manually_edited) {
        finalPatch.is_manually_edited = true;
      }
      const { error } = await supabase
        .from('crm_job_list_items')
        .update(finalPatch)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['job-list-items', jobList?.id] }),
    onError: (e: any) => toast.error(e.message || 'Save failed'),
  });

  const addRowMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('crm_job_list_items').insert({
        job_list_id: jobList!.id,
        name: 'New item',
        quantity: 1,
        unit: 'each',
        manually_added: true,
        sort_order: items.length,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['job-list-items', jobList?.id] }),
    onError: (e: any) => toast.error(e.message || 'Add failed'),
  });

  const deleteRowMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('crm_job_list_items').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['job-list-items', jobList?.id] }),
    onError: (e: any) => toast.error(e.message || 'Delete failed'),
  });

  const reorderMutation = useMutation({
    mutationFn: async (ordered: JobListItem[]) => {
      const updates = ordered.map((it, idx) =>
        supabase.from('crm_job_list_items').update({ sort_order: idx }).eq('id', it.id)
      );
      await Promise.all(updates);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['job-list-items', jobList?.id] }),
    onError: (e: any) => toast.error(e.message || 'Reorder failed'),
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = items.findIndex((i) => i.id === active.id);
    const newIdx = items.findIndex((i) => i.id === over.id);
    if (oldIdx === -1 || newIdx === -1) return;
    const next = arrayMove(items, oldIdx, newIdx);
    qc.setQueryData(['job-list-items', jobList?.id], next);
    reorderMutation.mutate(next);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!jobList) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Job List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Generate a parts &amp; materials list from this estimate to send to a supply house.
            Equipment/controls, miscellaneous inside, and ducting line items will be included.
          </p>
          <Button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
          >
            {generateMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Generate Job List
          </Button>
        </CardContent>
      </Card>
    );
  }

  const handleExportPDF = () => {
    downloadJobListPDF(
      {
        estimate_number: estimateMeta?.estimate_number ?? '—',
        supplier_name: jobList.supplier_name,
        notes: jobList.notes,
      },
      items.map((i) => ({
        name: i.name,
        description: i.description,
        quantity: i.quantity,
        unit: i.unit,
      }))
    );
  };

  const handleCopyText = async () => {
    const header = `Job List — Estimate ${estimateMeta?.estimate_number ?? '—'}${
      jobList.supplier_name ? ` — Supplier: ${jobList.supplier_name}` : ''
    }`;
    const lines = items.map(
      (i) =>
        `${i.quantity} ${i.unit || 'each'} — ${i.name}${
          i.description ? ` (${i.description})` : ''
        }`
    );
    const text = [header, '', ...lines].join('\n');
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    } catch {
      toast.error('Copy failed');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Job List
            <Badge variant={jobList.status === 'sent' ? 'default' : 'secondary'} className="capitalize">
              {jobList.status}
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCopyText} disabled={items.length === 0}>
              <Copy className="h-4 w-4" /> Copy as text
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPDF} disabled={items.length === 0}>
              <FileDown className="h-4 w-4" /> Export PDF
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="supplier_name">Supplier</Label>
            <Input
              id="supplier_name"
              defaultValue={jobList.supplier_name ?? ''}
              onBlur={(e) => {
                const v = e.target.value;
                if (v !== (jobList.supplier_name ?? '')) {
                  updateListMutation.mutate({ supplier_name: v || null });
                }
              }}
              placeholder="e.g. Carrier Enterprise"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="jl_notes">Notes</Label>
            <Textarea
              id="jl_notes"
              defaultValue={jobList.notes ?? ''}
              onBlur={(e) => {
                const v = e.target.value;
                if (v !== (jobList.notes ?? '')) {
                  updateListMutation.mutate({ notes: v || null });
                }
              }}
              rows={2}
              placeholder="Pickup time, PO #, etc."
            />
          </div>
        </div>

        <div className="border rounded-md">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-24">Qty</TableHead>
                  <TableHead className="w-28">Unit</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                  {items.map((item) => (
                    <SortableItemRow
                      key={item.id}
                      item={item}
                      onUpdate={(patch) =>
                        updateItemMutation.mutate({ id: item.id, patch, markEdited: true })
                      }
                      onDelete={() => deleteRowMutation.mutate(item.id)}
                    />
                  ))}
                </SortableContext>
                {items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-6">
                      No items yet. Click "Add Row" to begin.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>

        <div>
          <Button variant="outline" size="sm" onClick={() => addRowMutation.mutate()} disabled={addRowMutation.isPending}>
            <Plus className="h-4 w-4" /> Add Row
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

interface RowProps {
  item: JobListItem;
  onUpdate: (patch: Partial<JobListItem>) => void;
  onDelete: () => void;
}

const SortableItemRow = ({ item, onUpdate, onDelete }: RowProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell>
        <button
          type="button"
          className="cursor-grab text-muted-foreground hover:text-foreground"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Input
            defaultValue={item.name}
            onBlur={(e) => {
              if (e.target.value !== item.name) onUpdate({ name: e.target.value });
            }}
            className="h-8"
          />
          {item.manually_added ? (
            <Badge variant="outline" className="text-[10px]">Added</Badge>
          ) : item.is_manually_edited ? (
            <Badge variant="outline" className="text-[10px]">Edited</Badge>
          ) : null}
        </div>
      </TableCell>
      <TableCell>
        <Input
          defaultValue={item.description ?? ''}
          onBlur={(e) => {
            const v = e.target.value;
            if (v !== (item.description ?? '')) onUpdate({ description: v || null });
          }}
          className="h-8"
        />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          step="0.01"
          defaultValue={item.quantity}
          onBlur={(e) => {
            const v = parseFloat(e.target.value);
            if (!isNaN(v) && v !== item.quantity) onUpdate({ quantity: v });
          }}
          className="h-8"
        />
      </TableCell>
      <TableCell>
        <Input
          defaultValue={item.unit}
          onBlur={(e) => {
            if (e.target.value !== item.unit) onUpdate({ unit: e.target.value || 'each' });
          }}
          className="h-8"
        />
      </TableCell>
      <TableCell>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onDelete}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </TableCell>
    </TableRow>
  );
};
