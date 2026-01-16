import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Users } from 'lucide-react';
import { format } from 'date-fns';

type LaborRateType = 'hourly' | 'daily' | 'flat';

interface LaborRate {
  id: string;
  name: string;
  rate_type: LaborRateType;
  rate: number;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const RATE_TYPES: { value: LaborRateType; label: string; suffix: string }[] = [
  { value: 'hourly', label: 'Hourly', suffix: '/hr' },
  { value: 'daily', label: 'Daily', suffix: '/day' },
  { value: 'flat', label: 'Flat Rate', suffix: '' },
];

const LaborRates = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<LaborRate | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    rate_type: 'hourly' as LaborRateType,
    rate: '',
    description: '',
    is_active: true,
  });

  // Fetch labor rates
  const { data: laborRates = [], isLoading } = useQuery({
    queryKey: ['labor-rates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('labor_rates')
        .select('*')
        .order('rate_type')
        .order('name');
      
      if (error) throw error;
      return data as LaborRate[];
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: Omit<LaborRate, 'id' | 'created_at' | 'updated_at'>) => {
      const { error } = await supabase
        .from('labor_rates')
        .insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labor-rates'] });
      toast.success('Labor rate added successfully');
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error('Failed to add labor rate: ' + error.message);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<LaborRate> & { id: string }) => {
      const { error } = await supabase
        .from('labor_rates')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labor-rates'] });
      toast.success('Labor rate updated successfully');
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error('Failed to update labor rate: ' + error.message);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('labor_rates')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labor-rates'] });
      toast.success('Labor rate deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete labor rate: ' + error.message);
    },
  });

  const handleOpenDialog = (rate?: LaborRate) => {
    if (rate) {
      setEditingRate(rate);
      setFormData({
        name: rate.name,
        rate_type: rate.rate_type,
        rate: rate.rate.toString(),
        description: rate.description || '',
        is_active: rate.is_active,
      });
    } else {
      setEditingRate(null);
      setFormData({
        name: '',
        rate_type: 'hourly',
        rate: '',
        description: '',
        is_active: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingRate(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      name: formData.name,
      rate_type: formData.rate_type,
      rate: parseFloat(formData.rate) || 0,
      description: formData.description || null,
      is_active: formData.is_active,
    };

    if (editingRate) {
      updateMutation.mutate({ id: editingRate.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const getRateSuffix = (type: LaborRateType) => {
    return RATE_TYPES.find(t => t.value === type)?.suffix || '';
  };

  const formatRate = (rate: number, type: LaborRateType) => {
    return `$${rate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${getRateSuffix(type)}`;
  };

  // Group by rate type
  const groupedRates = laborRates.reduce((acc, rate) => {
    if (!acc[rate.rate_type]) {
      acc[rate.rate_type] = [];
    }
    acc[rate.rate_type].push(rate);
    return acc;
  }, {} as Record<LaborRateType, LaborRate[]>);

  return (
    <AdminLayout title="Labor Rates">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Labor Rates</h1>
              <p className="text-muted-foreground">Manage labor rates for estimates</p>
            </div>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Labor Rate
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : laborRates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No labor rates configured. Click "Add Labor Rate" to get started.
          </div>
        ) : (
          <div className="space-y-6">
            {RATE_TYPES.map((rateType) => {
              const rates = groupedRates[rateType.value] || [];
              if (rates.length === 0) return null;

              return (
                <div key={rateType.value} className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground capitalize">
                    {rateType.label} Rates
                  </h3>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead className="text-right">Rate</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Updated</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rates.map((rate) => (
                          <TableRow key={rate.id}>
                            <TableCell className="font-medium">{rate.name}</TableCell>
                            <TableCell className="text-right font-mono text-lg">
                              {formatRate(rate.rate, rate.rate_type)}
                            </TableCell>
                            <TableCell className="text-muted-foreground max-w-xs truncate">
                              {rate.description || '—'}
                            </TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                rate.is_active 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {rate.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {format(new Date(rate.updated_at), 'MMM d, yyyy')}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleOpenDialog(rate)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(rate.id, rate.name)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle>
                {editingRate ? 'Edit Labor Rate' : 'Add New Labor Rate'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Lead Technician"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rate_type">Rate Type *</Label>
                    <Select
                      value={formData.rate_type}
                      onValueChange={(v) => setFormData({ ...formData, rate_type: v as LaborRateType })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {RATE_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rate">
                      Rate ($){getRateSuffix(formData.rate_type)} *
                    </Label>
                    <Input
                      id="rate"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.rate}
                      onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional description..."
                    rows={2}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="is_active">Active</Label>
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending 
                    ? 'Saving...' 
                    : editingRate ? 'Save Changes' : 'Add Rate'
                  }
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default LaborRates;
