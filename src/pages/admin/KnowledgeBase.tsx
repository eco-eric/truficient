import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, BookOpen, Loader2, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface KbCategory {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
}

interface KbArticle {
  id: string;
  category_id: string | null;
  title_en: string;
  title_es: string | null;
  content_en: string | null;
  content_es: string | null;
  tag_type: string | null;
  model_number: string | null;
  tags: string[] | null;
  updated_at: string;
}

export default function KnowledgeBase() {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<KbCategory[]>([]);
  const [articles, setArticles] = useState<KbArticle[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | 'all'>('all');

  const [catOpen, setCatOpen] = useState(false);
  const [catForm, setCatForm] = useState({ name: '', slug: '', icon: '' });

  const [artOpen, setArtOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<KbArticle | null>(null);
  const [artForm, setArtForm] = useState({
    category_id: '',
    title_en: '',
    title_es: '',
    content_en: '',
    content_es: '',
    tag_type: 'general',
    model_number: '',
    tags: '',
  });

  const load = async () => {
    setLoading(true);
    const [{ data: cats }, { data: arts }] = await Promise.all([
      (supabase as any).from('kb_categories').select('*').order('sort_order'),
      (supabase as any).from('kb_articles').select('*').order('updated_at', { ascending: false }),
    ]);
    setCategories(cats || []);
    setArticles(arts || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const saveCategory = async () => {
    if (!catForm.name) return;
    const slug = catForm.slug || slugify(catForm.name);
    const { error } = await (supabase as any).from('kb_categories').insert({
      name: catForm.name,
      slug,
      icon: catForm.icon || null,
    });
    if (error) return toast.error(error.message);
    toast.success('Category created');
    setCatOpen(false);
    setCatForm({ name: '', slug: '', icon: '' });
    load();
  };

  const openArticleDialog = (article?: KbArticle) => {
    if (article) {
      setEditingArticle(article);
      setArtForm({
        category_id: article.category_id || '',
        title_en: article.title_en,
        title_es: article.title_es || '',
        content_en: article.content_en || '',
        content_es: article.content_es || '',
        tag_type: article.tag_type || 'general',
        model_number: article.model_number || '',
        tags: (article.tags || []).join(', '),
      });
    } else {
      setEditingArticle(null);
      setArtForm({
        category_id: activeCategory !== 'all' ? activeCategory : '',
        title_en: '',
        title_es: '',
        content_en: '',
        content_es: '',
        tag_type: 'general',
        model_number: '',
        tags: '',
      });
    }
    setArtOpen(true);
  };

  const saveArticle = async () => {
    if (!artForm.title_en || !artForm.category_id) {
      return toast.error('Title and category are required');
    }
    const payload = {
      category_id: artForm.category_id,
      title_en: artForm.title_en,
      title_es: artForm.title_es || null,
      content_en: artForm.content_en || null,
      content_es: artForm.content_es || null,
      tag_type: artForm.tag_type,
      model_number: artForm.model_number || null,
      tags: artForm.tags ? artForm.tags.split(',').map(t => t.trim()).filter(Boolean) : null,
    };
    const { error } = editingArticle
      ? await (supabase as any).from('kb_articles').update(payload).eq('id', editingArticle.id)
      : await (supabase as any).from('kb_articles').insert(payload);
    if (error) return toast.error(error.message);
    toast.success(editingArticle ? 'Article updated' : 'Article created');
    setArtOpen(false);
    load();
  };

  const deleteArticle = async (id: string) => {
    if (!confirm('Delete this article?')) return;
    const { error } = await (supabase as any).from('kb_articles').delete().eq('id', id);
    if (error) return toast.error(error.message);
    toast.success('Deleted');
    load();
  };

  const filtered = activeCategory === 'all'
    ? articles
    : articles.filter(a => a.category_id === activeCategory);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6" /> Knowledge Base
          </h1>
          <p className="text-muted-foreground text-sm">Bilingual install &amp; service articles for technicians.</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={catOpen} onOpenChange={setCatOpen}>
            <DialogTrigger asChild>
              <Button variant="outline"><Plus className="h-4 w-4 mr-2" />Category</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New Category</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Name" value={catForm.name} onChange={e => setCatForm({ ...catForm, name: e.target.value })} />
                <Input placeholder="Slug (auto)" value={catForm.slug} onChange={e => setCatForm({ ...catForm, slug: e.target.value })} />
                <Input placeholder="Lucide icon name (optional)" value={catForm.icon} onChange={e => setCatForm({ ...catForm, icon: e.target.value })} />
              </div>
              <DialogFooter><Button onClick={saveCategory}>Create</Button></DialogFooter>
            </DialogContent>
          </Dialog>
          <Button onClick={() => openArticleDialog()}><Plus className="h-4 w-4 mr-2" />Article</Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant={activeCategory === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setActiveCategory('all')}>
          All ({articles.length})
        </Button>
        {categories.map(c => (
          <Button key={c.id} variant={activeCategory === c.id ? 'default' : 'outline'} size="sm" onClick={() => setActiveCategory(c.id)}>
            {c.name} ({articles.filter(a => a.category_id === c.id).length})
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No articles yet.</CardContent></Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map(a => {
            const cat = categories.find(c => c.id === a.category_id);
            return (
              <Card key={a.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-base">{a.title_en}</CardTitle>
                      {a.title_es && <p className="text-xs text-muted-foreground mt-1">ES: {a.title_es}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      {cat && <Badge variant="secondary">{cat.name}</Badge>}
                      {a.tag_type && <Badge variant="outline">{a.tag_type}</Badge>}
                      {a.model_number && <Badge variant="outline">{a.model_number}</Badge>}
                      <Button size="icon" variant="ghost" onClick={() => openArticleDialog(a)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => deleteArticle(a.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </CardHeader>
                {(a.content_en || a.tags?.length) && (
                  <CardContent className="pt-0">
                    {a.content_en && <p className="text-sm text-muted-foreground line-clamp-2">{a.content_en}</p>}
                    {a.tags && a.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {a.tags.map(t => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={artOpen} onOpenChange={setArtOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingArticle ? 'Edit Article' : 'New Article'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium">Category *</label>
                <Select value={artForm.category_id} onValueChange={v => setArtForm({ ...artForm, category_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium">Type</label>
                <Select value={artForm.tag_type} onValueChange={v => setArtForm({ ...artForm, tag_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="install">Install</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium">Title (English) *</label>
              <Input value={artForm.title_en} onChange={e => setArtForm({ ...artForm, title_en: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium">Title (Spanish)</label>
              <Input value={artForm.title_es} onChange={e => setArtForm({ ...artForm, title_es: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium">Content (English)</label>
              <Textarea rows={6} value={artForm.content_en} onChange={e => setArtForm({ ...artForm, content_en: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium">Content (Spanish)</label>
              <Textarea rows={6} value={artForm.content_es} onChange={e => setArtForm({ ...artForm, content_es: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium">Model Number</label>
                <Input value={artForm.model_number} onChange={e => setArtForm({ ...artForm, model_number: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium">Tags (comma-separated)</label>
                <Input value={artForm.tags} onChange={e => setArtForm({ ...artForm, tags: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter><Button onClick={saveArticle}>{editingArticle ? 'Save' : 'Create'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
