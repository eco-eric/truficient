import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Loader2, Sparkles, Save, Trash2, Megaphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const PROVIDERS = [
  { value: 'lovable', label: 'Lovable AI (Built-in)' },
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic' },
  { value: 'xai', label: 'xAI' },
  { value: 'google', label: 'Google AI' },
];

const MODELS_BY_PROVIDER: Record<string, { value: string; label: string }[]> = {
  lovable: [
    { value: 'google/gemini-2.5-flash', label: 'Gemini 2.5 Flash (Fast)' },
    { value: 'google/gemini-2.5-pro', label: 'Gemini 2.5 Pro (Powerful)' },
    { value: 'openai/gpt-5', label: 'GPT-5 (Powerful)' },
    { value: 'openai/gpt-5-mini', label: 'GPT-5 Mini (Balanced)' },
  ],
  openai: [
    { value: 'gpt-4o', label: 'GPT-4o' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
  ],
  anthropic: [
    { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
  ],
  xai: [
    { value: 'grok-4-1-fast-reasoning', label: 'Grok 4.1 Fast Reasoning' },
    { value: 'grok-3', label: 'Grok 3' },
  ],
  google: [
    { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
    { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
  ],
};

const PILLARS = [
  { value: 'comfort', label: 'Comfort' },
  { value: 'energy_costs', label: 'Energy Costs' },
  { value: 'equipment_education', label: 'Equipment Education' },
  { value: 'how_we_think', label: 'How We Think' },
  { value: 'proof', label: 'Proof' },
];

const PLATFORMS = [
  { value: 'google_business', label: 'Google Business' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
];

interface SocialPost {
  id: string;
  title: string | null;
  body: string;
  pillar: string | null;
  status: string;
  scheduled_for: string | null;
  created_at: string;
  ai_model: string | null;
  crm_social_post_targets?: { platform: string }[];
}

export default function SocialStudio() {
  const { toast } = useToast();
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // Composer state
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [pillar, setPillar] = useState<string>('comfort');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['google_business']);
  const [provider, setProvider] = useState('lovable');
  const [model, setModel] = useState('google/gemini-2.5-flash');
  const [scheduledFor, setScheduledFor] = useState('');
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const loadPosts = async () => {
    setLoadingPosts(true);
    const { data, error } = await supabase
      .from('crm_social_posts')
      .select('id, title, body, pillar, status, scheduled_for, created_at, ai_model, crm_social_post_targets(platform)')
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) {
      toast({ title: 'Failed to load posts', description: error.message, variant: 'destructive' });
    } else {
      setPosts((data as SocialPost[]) || []);
    }
    setLoadingPosts(false);
  };

  useEffect(() => { loadPosts(); }, []);

  const togglePlatform = (p: string) => {
    setSelectedPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  const handleProviderChange = (p: string) => {
    setProvider(p);
    const first = MODELS_BY_PROVIDER[p]?.[0]?.value;
    if (first) setModel(first);
  };

  const handleGenerate = async () => {
    if (selectedPlatforms.length === 0) {
      toast({ title: 'Pick at least one platform', variant: 'destructive' });
      return;
    }
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('social-generate', {
        body: { pillar, platforms: selectedPlatforms, provider, model, seedText: body },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data?.content) setBody(data.content);
      toast({ title: 'Draft generated', description: `Model: ${data?.model || model}` });
    } catch (e) {
      toast({ title: 'Generation failed', description: e instanceof Error ? e.message : String(e), variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveClick = () => {
    if (!body.trim()) {
      toast({ title: 'Body is required', variant: 'destructive' });
      return;
    }
    if (selectedPlatforms.length === 0) {
      toast({ title: 'Pick at least one platform', variant: 'destructive' });
      return;
    }
    setConfirmOpen(true);
  };

  const handleConfirmSave = async () => {
    setConfirmOpen(false);
    setSaving(true);
    try {
      const status = scheduledFor ? 'scheduled' : 'draft';
      const { data: { user } } = await supabase.auth.getUser();
      const { data: post, error } = await supabase
        .from('crm_social_posts')
        .insert({
          title: title || null,
          body,
          pillar,
          status,
          ai_provider: provider,
          ai_model: model,
          scheduled_for: scheduledFor || null,
          created_by: user?.id || null,
        })
        .select('id')
        .single();
      if (error) throw error;

      const targets = selectedPlatforms.map(platform => ({
        post_id: post.id,
        platform,
        status: 'draft_only' as const,
      }));
      const { error: targetsErr } = await supabase.from('crm_social_post_targets').insert(targets);
      if (targetsErr) throw targetsErr;

      toast({ title: 'Post saved', description: `${selectedPlatforms.length} platform target(s) created.` });
      setTitle(''); setBody(''); setScheduledFor('');
      await loadPosts();
    } catch (e) {
      toast({ title: 'Save failed', description: e instanceof Error ? e.message : String(e), variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this post?')) return;
    const { error } = await supabase.from('crm_social_posts').delete().eq('id', id);
    if (error) {
      toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Deleted' });
      loadPosts();
    }
  };

  const availableModels = MODELS_BY_PROVIDER[provider] || [];

  return (
    <AdminLayout title="Social Studio">
      <Tabs defaultValue="composer" className="w-full">
        <TabsList>
          <TabsTrigger value="composer">Composer</TabsTrigger>
          <TabsTrigger value="ideas">Ideas</TabsTrigger>
          <TabsTrigger value="queue">Queue</TabsTrigger>
          <TabsTrigger value="connections">Connections</TabsTrigger>
        </TabsList>

        <TabsContent value="composer" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Megaphone className="h-5 w-5" /> Compose a Post</CardTitle>
              <CardDescription>Draft a post Bach can help write — anchored to the Truficient social strategy doc.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Internal title</Label>
                  <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Variable-speed explainer" />
                </div>
                <div>
                  <Label htmlFor="pillar">Pillar</Label>
                  <Select value={pillar} onValueChange={setPillar}>
                    <SelectTrigger id="pillar"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PILLARS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Platforms</Label>
                <div className="flex flex-wrap gap-4 mt-2">
                  {PLATFORMS.map(p => (
                    <label key={p.value} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox checked={selectedPlatforms.includes(p.value)} onCheckedChange={() => togglePlatform(p.value)} />
                      <span className="text-sm">{p.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="provider">AI Provider</Label>
                  <Select value={provider} onValueChange={handleProviderChange}>
                    <SelectTrigger id="provider"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PROVIDERS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="model">Model</Label>
                  <Select value={model} onValueChange={setModel}>
                    <SelectTrigger id="model"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {availableModels.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="body">Body</Label>
                  <Button type="button" variant="outline" size="sm" onClick={handleGenerate} disabled={generating}>
                    {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                    Generate with Bach
                  </Button>
                </div>
                <Textarea id="body" value={body} onChange={e => setBody(e.target.value)} rows={14} placeholder="Write your post here, or hit Generate with Bach to draft from the pillar + platforms above." className="font-mono text-sm" />
              </div>

              <div className="grid md:grid-cols-2 gap-4 items-end">
                <div>
                  <Label htmlFor="scheduled">Schedule for (optional)</Label>
                  <Input id="scheduled" type="datetime-local" value={scheduledFor} onChange={e => setScheduledFor(e.target.value)} />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" disabled title="Live publishing coming in a later update.">Publish</Button>
                  <Button onClick={handleSaveClick} disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Post
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Existing Posts</CardTitle>
              <CardDescription>Drafts and scheduled posts. Live publishing is not enabled yet.</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingPosts ? (
                <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
              ) : posts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No posts yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Pillar</TableHead>
                      <TableHead>Platforms</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Scheduled</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {posts.map(p => (
                      <TableRow key={p.id}>
                        <TableCell className="max-w-[260px] truncate">{p.title || <span className="text-muted-foreground italic">untitled</span>}</TableCell>
                        <TableCell>{p.pillar || '—'}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {(p.crm_social_post_targets || []).map(t => (
                              <Badge key={t.platform} variant="secondary">{t.platform.replace('_', ' ')}</Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell><Badge>{p.status}</Badge></TableCell>
                        <TableCell>{p.scheduled_for ? format(new Date(p.scheduled_for), 'PP p') : '—'}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ideas" className="mt-6">
          <Card><CardContent className="py-12 text-center text-muted-foreground">Bach-suggested ideas coming soon.</CardContent></Card>
        </TabsContent>
        <TabsContent value="queue" className="mt-6">
          <Card><CardContent className="py-12 text-center text-muted-foreground">Scheduled queue + live publishing coming soon.</CardContent></Card>
        </TabsContent>
        <TabsContent value="connections" className="mt-6">
          <Card><CardContent className="py-12 text-center text-muted-foreground">Platform OAuth connections coming soon.</CardContent></Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save this post?</AlertDialogTitle>
            <AlertDialogDescription>
              This will create a draft post and {selectedPlatforms.length} platform target row(s). No live publishing happens — Eric stays in control of the final post.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSave}>Confirm Save</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
