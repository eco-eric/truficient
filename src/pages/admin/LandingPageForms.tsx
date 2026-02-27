import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
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
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, FileText, Loader2, Eye, Copy, Globe, ExternalLink, StickyNote, Save, RefreshCw } from 'lucide-react';

interface LandingPageForm {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  form_type: string;
  is_active: boolean;
  created_at: string;
}

interface CampaignPage {
  id: string;
  name: string;
  slug: string;
  url: string;
  platform: string;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function LandingPageForms() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingCampaign, setEditingCampaign] = useState<CampaignPage | null>(null);
  const [showCampaignDialog, setShowCampaignDialog] = useState(false);
  const [campaignForm, setCampaignForm] = useState({ name: '', slug: '', url: '', platform: 'facebook', notes: '' });

  const { data: forms, isLoading, error: formsError, refetch: refetchForms } = useQuery({
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

  const { data: campaignPages, isLoading: campaignLoading } = useQuery({
    queryKey: ['campaign-landing-pages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaign_landing_pages')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as CampaignPage[];
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

  const saveCampaignMutation = useMutation({
    mutationFn: async (data: typeof campaignForm & { id?: string }) => {
      if (data.id) {
        const { error } = await supabase.from('campaign_landing_pages').update({
          name: data.name, slug: data.slug, url: data.url, platform: data.platform, notes: data.notes || null,
        }).eq('id', data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('campaign_landing_pages').insert({
          name: data.name, slug: data.slug, url: data.url, platform: data.platform, notes: data.notes || null,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign-landing-pages'] });
      setShowCampaignDialog(false);
      setEditingCampaign(null);
      toast({ title: editingCampaign ? 'Campaign page updated' : 'Campaign page added' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error saving campaign page', description: error.message, variant: 'destructive' });
    },
  });

  const deleteCampaignMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('campaign_landing_pages').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign-landing-pages'] });
      toast({ title: 'Campaign page removed' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error deleting', description: error.message, variant: 'destructive' });
    },
  });

  const copySlug = (slug: string) => {
    navigator.clipboard.writeText(slug);
    toast({ title: 'Slug copied to clipboard' });
  };

  const copyFullUrl = (url: string) => {
    const full = url.startsWith('http') ? url : `https://go.truficient.com${url}`;
    navigator.clipboard.writeText(full);
    toast({ title: 'URL copied to clipboard' });
  };

  const openCampaignDialog = (campaign?: CampaignPage) => {
    if (campaign) {
      setEditingCampaign(campaign);
      setCampaignForm({ name: campaign.name, slug: campaign.slug, url: campaign.url, platform: campaign.platform, notes: campaign.notes || '' });
    } else {
      setEditingCampaign(null);
      setCampaignForm({ name: '', slug: '', url: '/', platform: 'facebook', notes: '' });
    }
    setShowCampaignDialog(true);
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

  const getPlatformBadge = (platform: string) => {
    switch (platform) {
      case 'facebook':
        return <Badge variant="outline" className="border-blue-500 text-blue-600">Facebook</Badge>;
      case 'google':
        return <Badge variant="outline" className="border-green-500 text-green-600">Google</Badge>;
      default:
        return <Badge variant="outline">Other</Badge>;
    }
  };

  return (
    <AdminLayout title="Landing Page Forms">
      <div className="space-y-6">
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Landing Pages</h1>
            <p className="text-muted-foreground">
              Manage campaign landing pages and lead capture forms
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
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

        {/* Campaign Landing Pages Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Campaign Landing Pages
            </CardTitle>
            <Button size="sm" onClick={() => openCampaignDialog()}>
              <Plus className="h-4 w-4 mr-1" />
              Add Page
            </Button>
          </CardHeader>
          <CardContent>
            {campaignLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : campaignPages && campaignPages.length > 0 ? (
              <div className="grid gap-4">
                {campaignPages.map((page) => (
                  <div key={page.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-foreground">{page.name}</h3>
                          {getPlatformBadge(page.platform)}
                          {!page.is_active && <Badge variant="secondary">Inactive</Badge>}
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <code className="text-sm bg-muted px-2 py-0.5 rounded text-muted-foreground truncate">
                            go.truficient.com{page.url}
                          </code>
                          <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => copyFullUrl(page.url)}>
                            <Copy className="h-3 w-3" />
                          </Button>
                          <a href={page.url} target="_blank" rel="noopener noreferrer" className="shrink-0">
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </a>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openCampaignDialog(page)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                          if (confirm('Remove this campaign page?')) deleteCampaignMutation.mutate(page.id);
                        }}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    {page.notes && (
                      <div className="flex items-start gap-2 bg-muted/50 rounded-md p-3">
                        <StickyNote className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{page.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Globe className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p>No campaign pages tracked yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Forms Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Lead Capture Forms
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={() => refetchForms()} title="Refresh forms">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {formsError ? (
              <div className="text-center py-8 text-destructive">
                <p className="font-medium">Failed to load forms</p>
                <p className="text-sm text-muted-foreground mt-1">{formsError.message}</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={() => refetchForms()}>
                  <RefreshCw className="h-4 w-4 mr-1" /> Retry
                </Button>
              </div>
            ) : isLoading ? (
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

      {/* Add/Edit Campaign Page Dialog */}
      <Dialog open={showCampaignDialog} onOpenChange={setShowCampaignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCampaign ? 'Edit Campaign Page' : 'Add Campaign Page'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input value={campaignForm.name} onChange={(e) => setCampaignForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Spring Sale Landing" />
            </div>
            <div>
              <label className="text-sm font-medium">Route / URL Path</label>
              <Input value={campaignForm.url} onChange={(e) => setCampaignForm(f => ({ ...f, url: e.target.value, slug: e.target.value.replace(/^\//, '') }))} placeholder="/my-campaign-page" />
              <p className="text-xs text-muted-foreground mt-1">Path on go.truficient.com (e.g. /smart-group-march)</p>
            </div>
            <div>
              <label className="text-sm font-medium">Platform</label>
              <select
                className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={campaignForm.platform}
                onChange={(e) => setCampaignForm(f => ({ ...f, platform: e.target.value }))}
              >
                <option value="facebook">Facebook</option>
                <option value="google">Google</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                value={campaignForm.notes}
                onChange={(e) => setCampaignForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Campaign details, audience targeting, budget, dates..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCampaignDialog(false)}>Cancel</Button>
            <Button
              onClick={() => saveCampaignMutation.mutate({ ...campaignForm, id: editingCampaign?.id })}
              disabled={!campaignForm.name || !campaignForm.url || saveCampaignMutation.isPending}
            >
              {saveCampaignMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
              {editingCampaign ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
