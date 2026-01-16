import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Package, Copy, X, GripVertical } from 'lucide-react';
import { format } from 'date-fns';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
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

type MaterialCategory = 'refrigerant' | 'copper' | 'electrical' | 'ductwork' | 'controls' | 'supports' | 'misc';

interface Material {
  id: string;
  name: string;
  category: MaterialCategory;
  unit: string;
  unit_cost: number;
  description: string | null;
  supplier: string | null;
  part_number: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

const CATEGORIES: { value: MaterialCategory; label: string }[] = [
  { value: 'refrigerant', label: 'Refrigerant' },
  { value: 'copper', label: 'Copper' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'ductwork', label: 'Ductwork' },
  { value: 'controls', label: 'Controls' },
  { value: 'supports', label: 'Supports' },
  { value: 'misc', label: 'Misc' },
];

const COMMON_UNITS = ['each', 'ft', 'lb', 'set', 'roll', 'gallon', 'box'];

// Sortable row component
interface SortableRowProps {
  material: Material;
  selectedIds: Set<string>;
  toggleSelect: (id: string) => void;
  onClone: (material: Material) => void;
  onEdit: (material: Material) => void;
  onDelete: (id: string, name: string) => void;
}

const SortableRow = ({ material, selectedIds, toggleSelect, onClone, onEdit, onDelete }: SortableRowProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: material.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={`${selectedIds.has(material.id) ? 'bg-muted/50' : ''} ${isDragging ? 'bg-muted' : ''}`}
    >
      <TableCell className="w-10">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
      </TableCell>
      <TableCell>
        <Checkbox
          checked={selectedIds.has(material.id)}
          onCheckedChange={() => toggleSelect(material.id)}
          aria-label={`Select ${material.name}`}
        />
      </TableCell>
      <TableCell className="font-medium">{material.name}</TableCell>
      <TableCell>{material.unit}</TableCell>
      <TableCell className="text-right font-mono">
        ${material.unit_cost.toFixed(2)}
      </TableCell>
      <TableCell className="text-muted-foreground">
        {material.supplier || '—'}
      </TableCell>
      <TableCell className="text-muted-foreground">
        {material.part_number || '—'}
      </TableCell>
      <TableCell>
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          material.is_active 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {material.is_active ? 'Active' : 'Inactive'}
        </span>
      </TableCell>
      <TableCell className="text-muted-foreground text-sm">
        {format(new Date(material.updated_at), 'MMM d, yyyy')}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onClone(material)}
            title="Clone material"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(material)}
            title="Edit material"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(material.id, material.name)}
            className="text-destructive hover:text-destructive"
            title="Delete material"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

const Materials = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<MaterialCategory>('refrigerant');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    name: '',
    category: 'refrigerant' as MaterialCategory,
    unit: 'each',
    unit_cost: '',
    description: '',
    supplier: '',
    part_number: '',
    is_active: true,
  });

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Clear selection when changing tabs
  useEffect(() => {
    setSelectedIds(new Set());
  }, [activeTab]);

  // Fetch materials
  const { data: materials = [], isLoading } = useQuery({
    queryKey: ['materials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('materials_catalog')
        .select('*')
        .order('sort_order');
      
      if (error) throw error;
      return data as Material[];
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: Omit<Material, 'id' | 'created_at' | 'updated_at' | 'sort_order'>) => {
      // Get max sort_order for the category
      const maxOrder = materials
        .filter(m => m.category === data.category)
        .reduce((max, m) => Math.max(max, m.sort_order || 0), 0);
      
      const { error } = await supabase
        .from('materials_catalog')
        .insert({ ...data, sort_order: maxOrder + 1 });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      toast.success('Material added successfully');
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error('Failed to add material: ' + error.message);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Material> & { id: string }) => {
      const { error } = await supabase
        .from('materials_catalog')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      toast.success('Material updated successfully');
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error('Failed to update material: ' + error.message);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('materials_catalog')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      toast.success('Material deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete material: ' + error.message);
    },
  });

  // Clone mutation
  const cloneMutation = useMutation({
    mutationFn: async (material: Material) => {
      const maxOrder = materials
        .filter(m => m.category === material.category)
        .reduce((max, m) => Math.max(max, m.sort_order || 0), 0);
      
      const { error } = await supabase
        .from('materials_catalog')
        .insert({
          name: `${material.name} (Copy)`,
          category: material.category,
          unit: material.unit,
          unit_cost: material.unit_cost,
          description: material.description,
          supplier: material.supplier,
          part_number: material.part_number,
          is_active: material.is_active,
          sort_order: maxOrder + 1,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      toast.success('Material cloned successfully');
    },
    onError: (error) => {
      toast.error('Failed to clone material: ' + error.message);
    },
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from('materials_catalog')
        .delete()
        .in('id', ids);
      if (error) throw error;
    },
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      toast.success(`${ids.length} material(s) deleted successfully`);
      setSelectedIds(new Set());
    },
    onError: (error) => {
      toast.error('Failed to delete materials: ' + error.message);
    },
  });

  // Bulk clone mutation
  const bulkCloneMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const materialsToClone = materials.filter(m => ids.includes(m.id));
      const categoryMaxOrders: Record<string, number> = {};
      
      materials.forEach(m => {
        categoryMaxOrders[m.category] = Math.max(categoryMaxOrders[m.category] || 0, m.sort_order || 0);
      });
      
      const clones = materialsToClone.map((m, index) => {
        const baseOrder = categoryMaxOrders[m.category] || 0;
        return {
          name: `${m.name} (Copy)`,
          category: m.category,
          unit: m.unit,
          unit_cost: m.unit_cost,
          description: m.description,
          supplier: m.supplier,
          part_number: m.part_number,
          is_active: m.is_active,
          sort_order: baseOrder + index + 1,
        };
      });
      const { error } = await supabase
        .from('materials_catalog')
        .insert(clones);
      if (error) throw error;
    },
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      toast.success(`${ids.length} material(s) cloned successfully`);
      setSelectedIds(new Set());
    },
    onError: (error) => {
      toast.error('Failed to clone materials: ' + error.message);
    },
  });

  // Reorder mutation
  const reorderMutation = useMutation({
    mutationFn: async (updates: { id: string; sort_order: number }[]) => {
      // Update each item's sort_order
      for (const update of updates) {
        const { error } = await supabase
          .from('materials_catalog')
          .update({ sort_order: update.sort_order })
          .eq('id', update.id);
        if (error) throw error;
      }
    },
    onError: (error) => {
      toast.error('Failed to reorder materials: ' + error.message);
      queryClient.invalidateQueries({ queryKey: ['materials'] });
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = filteredMaterials.findIndex(m => m.id === active.id);
      const newIndex = filteredMaterials.findIndex(m => m.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(filteredMaterials, oldIndex, newIndex);
        
        // Optimistically update the cache
        const updatedMaterials = materials.map(m => {
          const newPosition = newOrder.findIndex(nm => nm.id === m.id);
          if (newPosition !== -1) {
            return { ...m, sort_order: newPosition + 1 };
          }
          return m;
        });
        
        queryClient.setQueryData(['materials'], updatedMaterials);

        // Persist to database
        const updates = newOrder.map((m, index) => ({
          id: m.id,
          sort_order: index + 1,
        }));
        reorderMutation.mutate(updates);
      }
    }
  };

  const handleOpenDialog = (material?: Material) => {
    if (material) {
      setEditingMaterial(material);
      setFormData({
        name: material.name,
        category: material.category,
        unit: material.unit,
        unit_cost: material.unit_cost.toString(),
        description: material.description || '',
        supplier: material.supplier || '',
        part_number: material.part_number || '',
        is_active: material.is_active,
      });
    } else {
      setEditingMaterial(null);
      setFormData({
        name: '',
        category: activeTab,
        unit: 'each',
        unit_cost: '',
        description: '',
        supplier: '',
        part_number: '',
        is_active: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingMaterial(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      name: formData.name,
      category: formData.category,
      unit: formData.unit,
      unit_cost: parseFloat(formData.unit_cost) || 0,
      description: formData.description || null,
      supplier: formData.supplier || null,
      part_number: formData.part_number || null,
      is_active: formData.is_active,
    };

    if (editingMaterial) {
      updateMutation.mutate({ id: editingMaterial.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const filteredMaterials = materials
    .filter(m => m.category === activeTab)
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  // Selection handlers
  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredMaterials.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredMaterials.map(m => m.id)));
    }
  };

  const handleBulkDelete = () => {
    const count = selectedIds.size;
    if (confirm(`Are you sure you want to delete ${count} material(s)?`)) {
      bulkDeleteMutation.mutate(Array.from(selectedIds));
    }
  };

  const handleBulkClone = () => {
    bulkCloneMutation.mutate(Array.from(selectedIds));
  };

  const isAllSelected = filteredMaterials.length > 0 && selectedIds.size === filteredMaterials.length;
  const isSomeSelected = selectedIds.size > 0;

  return (
    <AdminLayout title="Materials Catalog">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Materials Catalog</h1>
              <p className="text-muted-foreground">Manage materials and pricing for estimates</p>
            </div>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Material
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as MaterialCategory)}>
          <TabsList className="grid w-full grid-cols-7">
            {CATEGORIES.map((cat) => (
              <TabsTrigger key={cat.value} value={cat.value} className="text-xs sm:text-sm">
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {CATEGORIES.map((cat) => (
            <TabsContent key={cat.value} value={cat.value} className="mt-4">
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : filteredMaterials.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No materials in this category. Click "Add Material" to get started.
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Bulk Actions Bar */}
                  {isSomeSelected && (
                    <div className="flex items-center gap-4 p-3 bg-muted rounded-lg border">
                      <span className="text-sm font-medium">
                        {selectedIds.size} selected
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleBulkClone}
                          disabled={bulkCloneMutation.isPending}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Clone
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleBulkDelete}
                          disabled={bulkDeleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedIds(new Set())}
                        className="ml-auto"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Clear
                      </Button>
                    </div>
                  )}

                  <div className="rounded-md border">
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-10"></TableHead>
                            <TableHead className="w-12">
                              <Checkbox
                                checked={isAllSelected}
                                onCheckedChange={toggleSelectAll}
                                aria-label="Select all"
                              />
                            </TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Unit</TableHead>
                            <TableHead className="text-right">Unit Cost</TableHead>
                            <TableHead>Supplier</TableHead>
                            <TableHead>Part #</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Updated</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <SortableContext
                            items={filteredMaterials.map(m => m.id)}
                            strategy={verticalListSortingStrategy}
                          >
                            {filteredMaterials.map((material) => (
                              <SortableRow
                                key={material.id}
                                material={material}
                                selectedIds={selectedIds}
                                toggleSelect={toggleSelect}
                                onClone={(m) => cloneMutation.mutate(m)}
                                onEdit={handleOpenDialog}
                                onDelete={handleDelete}
                              />
                            ))}
                          </SortableContext>
                        </TableBody>
                      </Table>
                    </DndContext>
                  </div>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingMaterial ? 'Edit Material' : 'Add New Material'}
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
                    placeholder="e.g., 1/2&quot; Copper Line"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(v) => setFormData({ ...formData, category: v as MaterialCategory })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit *</Label>
                    <Select
                      value={formData.unit}
                      onValueChange={(v) => setFormData({ ...formData, unit: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COMMON_UNITS.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit_cost">Unit Cost ($) *</Label>
                  <Input
                    id="unit_cost"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.unit_cost}
                    onChange={(e) => setFormData({ ...formData, unit_cost: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="supplier">Supplier</Label>
                    <Input
                      id="supplier"
                      value={formData.supplier}
                      onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                      placeholder="e.g., Ferguson"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="part_number">Part Number</Label>
                    <Input
                      id="part_number"
                      value={formData.part_number}
                      onChange={(e) => setFormData({ ...formData, part_number: e.target.value })}
                      placeholder="e.g., CU-050-L"
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
                    : editingMaterial ? 'Save Changes' : 'Add Material'
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

export default Materials;
