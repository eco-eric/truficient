import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, FileText, Loader2, Eye, Copy } from 'lucide-react';

interface LandingPageForm {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  form_type: string;
  is_active: boolean;
  created_at: string;
}

export default function LandingPageForms() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: forms, isLoading } = useQuery({
    queryKey: ['landing-page-forms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('landing_page_forms')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as LandingPageForm[];
    },
  });

  const { data: submissionCounts } = useQuery({
    queryKey: ['landing-page-submission-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('landing_page_submissions')
        .select('form_id');
      if (error) throw error;
      
      const counts: Record<string, number> = {};
      data.forEach((sub) => {
        if (sub.form_id) {
          counts[sub.form_id] = (counts[sub.form_id] || 0) + 1;
        }
      });
      return counts;
    },
  });

  const { data: tagCounts } = useQuery({
    queryKey: ['landing-page-form-tag-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('landing_page_form_tags')
        .select('form_id');
      if (error) throw error;
      
      const counts: Record<string, number> = {};
      data.forEach((tag) => {
        counts[tag.form_id] = (counts[tag.form_id] || 0) + 1;
      });
      return counts;
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('landing_page_forms')
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landing-page-forms'] });
    },
    onError: (error: Error) => {
      toast({ title: 'Error updating form', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('landing_page_forms').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landing-page-forms'] });
      toast({ title: 'Form deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error deleting form', description: error.message, variant: 'destructive' });
    },
  });

  const copySlug = (slug: string) => {
    navigator.clipboard.writeText(slug);
    toast({ title: 'Slug copied to clipboard' });
  };

  const getFormTypeColor = (type: string) => {
    switch (type) {
      case 'contact':
        return 'bg-blue-500';
      case 'estimate':
        return 'bg-green-500';
      case 'callback':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <AdminLayout title="Landing Page Forms">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Landing Page Forms</h1>
            <p className="text-muted-foreground">
              Create and manage forms for your landing pages
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/admin/landing-pages/submissions">
                <Eye className="h-4 w-4 mr-2" />
                View Submissions
              </Link>
            </Button>
            <Button asChild>
              <Link to="/admin/landing-pages/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Form
              </Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              All Forms
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : forms && forms.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Submissions</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {forms.map((form) => (
                    <TableRow key={form.id}>
                      <TableCell className="font-medium">{form.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="text-sm bg-muted px-2 py-1 rounded">{form.slug}</code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => copySlug(form.slug)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getFormTypeColor(form.form_type)} text-white`}>
                          {form.form_type}
                        </Badge>
                      </TableCell>
                      <TableCell>{tagCounts?.[form.id] || 0}</TableCell>
                      <TableCell>{submissionCounts?.[form.id] || 0}</TableCell>
                      <TableCell>
                        <Switch
                          checked={form.is_active}
                          onCheckedChange={(checked) =>
                            toggleActiveMutation.mutate({ id: form.id, is_active: checked })
                          }
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/admin/landing-pages/${form.id}`}>
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this form?')) {
                                deleteMutation.mutate(form.id);
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
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No forms created yet</p>
                <p className="text-sm">Create your first landing page form to get started</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
