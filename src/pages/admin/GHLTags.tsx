import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Tag, Loader2 } from 'lucide-react';

interface GHLTag {
  id: string;
  name: string;
  tag_value: string;
  description: string | null;
  color: string | null;
  is_active: boolean;
  created_at: string;
}

const defaultFormData = {
  name: '',
  tag_value: '',
  description: '',
  color: '#3b82f6',
  is_active: true,
};

export default function GHLTags() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<GHLTag | null>(null);
  const [formData, setFormData] = useState(defaultFormData);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tags, isLoading } = useQuery({
    queryKey: ['ghl-tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ghl_tags')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as GHLTag[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from('ghl_tags').insert({
        name: data.name,
        tag_value: data.tag_value,
        description: data.description || null,
        color: data.color,
        is_active: data.is_active,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ghl-tags'] });
      toast({ title: 'Tag created successfully' });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: 'Error creating tag', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from('ghl_tags')
        .update({
          name: data.name,
          tag_value: data.tag_value,
          description: data.description || null,
          color: data.color,
          is_active: data.is_active,
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ghl-tags'] });
      toast({ title: 'Tag updated successfully' });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: 'Error updating tag', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('ghl_tags').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ghl-tags'] });
      toast({ title: 'Tag deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error deleting tag', description: error.message, variant: 'destructive' });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('ghl_tags')
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ghl-tags'] });
    },
    onError: (error: Error) => {
      toast({ title: 'Error updating tag', description: error.message, variant: 'destructive' });
    },
  });

  const resetForm = () => {
    setFormData(defaultFormData);
    setEditingTag(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (tag: GHLTag) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name,
      tag_value: tag.tag_value,
      description: tag.description || '',
      color: tag.color || '#3b82f6',
      is_active: tag.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTag) {
      updateMutation.mutate({ id: editingTag.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const generateTagValue = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  };

  return (
    <AdminLayout title="GHL Tags">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">GHL Tags</h1>
            <p className="text-muted-foreground">
              Manage GoHighLevel tags for form submissions
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            if (!open) resetForm();
            setIsDialogOpen(open);
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Tag
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingTag ? 'Edit Tag' : 'Create New Tag'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Tag Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setFormData({
                        ...formData,
                        name,
                        tag_value: editingTag ? formData.tag_value : generateTagValue(name),
                      });
                    }}
                    placeholder="e.g., AC Repair Lead"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tag_value">Tag Value (for GHL)</Label>
                  <Input
                    id="tag_value"
                    value={formData.tag_value}
                    onChange={(e) => setFormData({ ...formData, tag_value: e.target.value })}
                    placeholder="e.g., ac-repair-lead"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional description for reference"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="color"
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-16 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      placeholder="#3b82f6"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {(createMutation.isPending || updateMutation.isPending) && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    {editingTag ? 'Update' : 'Create'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              All Tags
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : tags && tags.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tag</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tags.map((tag) => (
                    <TableRow key={tag.id}>
                      <TableCell>
                        <Badge
                          style={{ backgroundColor: tag.color || '#3b82f6' }}
                          className="text-white"
                        >
                          {tag.name}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{tag.tag_value}</TableCell>
                      <TableCell className="text-muted-foreground max-w-xs truncate">
                        {tag.description || '-'}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={tag.is_active}
                          onCheckedChange={(checked) =>
                            toggleActiveMutation.mutate({ id: tag.id, is_active: checked })
                          }
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(tag)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this tag?')) {
                                deleteMutation.mutate(tag.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Tag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No tags created yet</p>
                <p className="text-sm">Create your first GHL tag to get started</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
