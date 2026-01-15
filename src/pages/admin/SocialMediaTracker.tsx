import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { Loader2, ExternalLink, Facebook, Instagram, Linkedin, MapPin, Home, Save } from 'lucide-react';

interface SocialLink {
  id: string;
  platform: string;
  url: string | null;
  display_name: string;
  icon_name: string | null;
  is_active: boolean;
}

const platformIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
  google_maps: MapPin,
  houzz: Home,
};

// Custom Yelp icon component
const YelpIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.16 12.594l-4.995 1.433c-.96.276-1.74-.8-1.176-1.63l2.905-4.308a1.072 1.072 0 0 1 1.596-.206 9.194 9.194 0 0 1 1.813 3.03c.32.9-.143 1.68-1.143 1.68zM13.397 14.6l4.732 2.073c.913.4 1.06 1.533.387 2.213a9.24 9.24 0 0 1-2.885 1.673c-.88.34-1.66-.12-1.86-.96l-1.2-4.84c-.24-.96.826-1.76 1.826-1.16zM11.693 8.62V3.6c0-1 .76-1.47 1.62-1.073a9.22 9.22 0 0 1 2.88 2.3c.56.7.4 1.6-.36 2.12l-3.54 2.36c-.8.54-1.6.12-1.6-.687zM10.24 13.167l-2.4 4.533c-.48.91-1.593.953-2.2.12a9.22 9.22 0 0 1-1.26-3.16c-.2-.9.3-1.6 1.2-1.73l4.5-.6c.96-.13 1.48.927 1.16 1.837zM9.293 10.873l-4.88-.667c-.96-.133-1.38-.987-1.027-1.853a9.24 9.24 0 0 1 1.967-2.9c.64-.62 1.54-.54 2.08.18l3.113 3.78c.6.727.067 1.64-.853 1.46z"/>
  </svg>
);

const SocialMediaTracker = () => {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { isAdmin, loading: roleLoading } = useUserRole();

  useEffect(() => {
    fetchSocialLinks();
  }, []);

  const fetchSocialLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('social_links')
        .select('*')
        .order('display_name');

      if (error) throw error;
      setSocialLinks(data || []);
    } catch (error) {
      console.error('Error fetching social links:', error);
      toast({
        title: 'Error',
        description: 'Failed to load social links',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUrlChange = (id: string, url: string) => {
    setSocialLinks(prev =>
      prev.map(link => (link.id === id ? { ...link, url } : link))
    );
  };

  const handleActiveChange = (id: string, is_active: boolean) => {
    setSocialLinks(prev =>
      prev.map(link => (link.id === id ? { ...link, is_active } : link))
    );
  };

  const saveAllChanges = async () => {
    setSaving(true);
    try {
      for (const link of socialLinks) {
        const { error } = await supabase
          .from('social_links')
          .update({ url: link.url, is_active: link.is_active })
          .eq('id', link.id);

        if (error) throw error;
      }

      toast({
        title: 'Success',
        description: 'Social media links updated successfully',
      });
    } catch (error) {
      console.error('Error saving social links:', error);
      toast({
        title: 'Error',
        description: 'Failed to save changes',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const getIcon = (platform: string) => {
    if (platform === 'yelp') {
      return YelpIcon;
    }
    return platformIcons[platform] || MapPin;
  };

  if (roleLoading || loading) {
    return (
      <AdminLayout title="Social Media Tracker">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-[#1e3a5f]" />
        </div>
      </AdminLayout>
    );
  }

  if (!isAdmin) {
    return (
      <AdminLayout title="Social Media Tracker">
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              Access denied. Only administrators can manage social media links.
            </p>
          </CardContent>
        </Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Social Media Tracker">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1e3a5f]">Social Media Tracker</h1>
            <p className="text-muted-foreground">
              Manage your social media links across the website
            </p>
          </div>
          <Button onClick={saveAllChanges} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save All Changes
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Social Media Platforms</CardTitle>
            <CardDescription>
              Update URLs and toggle visibility for each platform. Changes will reflect in the footer and testimonials section.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {socialLinks.map(link => {
                const IconComponent = getIcon(link.platform);
                return (
                  <div
                    key={link.id}
                    className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30"
                  >
                    <div className="flex items-center gap-3 w-40">
                      <IconComponent className="h-6 w-6 text-[#1e3a5f]" />
                      <span className="font-medium">{link.display_name}</span>
                    </div>

                    <div className="flex-1">
                      <Input
                        value={link.url || ''}
                        onChange={e => handleUrlChange(link.id, e.target.value)}
                        placeholder={`Enter ${link.display_name} URL`}
                        className="w-full"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        id={`active-${link.id}`}
                        checked={link.is_active}
                        onCheckedChange={checked => handleActiveChange(link.id, checked)}
                      />
                      <Label htmlFor={`active-${link.id}`} className="text-sm">
                        {link.is_active ? 'Active' : 'Hidden'}
                      </Label>
                    </div>

                    {link.url && (
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                      >
                        <a href={link.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default SocialMediaTracker;
