import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

interface AuthorProfile {
  id: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
}

interface AuthorProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile?: AuthorProfile | null;
  onSave: (profile: AuthorProfile) => void;
}

const AuthorProfileDialog = ({
  open,
  onOpenChange,
  profile,
  onSave,
}: AuthorProfileDialogProps) => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name);
      setBio(profile.bio || '');
      setAvatarUrl(profile.avatar_url || '');
    } else {
      setDisplayName('');
      setBio('');
      setAvatarUrl('');
    }
  }, [profile, open]);

  const handleSave = async () => {
    if (!displayName.trim()) {
      toast({
        title: 'Error',
        description: 'Display name is required.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);

    try {
      const profileData = {
        display_name: displayName.trim(),
        bio: bio.trim() || null,
        avatar_url: avatarUrl.trim() || null,
      };

      if (profile?.id) {
        // Update existing profile
        const { data, error } = await supabase
          .from('author_profiles' as any)
          .update(profileData)
          .eq('id', profile.id)
          .select()
          .single();

        if (error) throw error;

        toast({
          title: 'Profile updated',
          description: 'Author profile has been updated.',
        });

        onSave(data as unknown as AuthorProfile);
      } else {
        // Create new profile
        const { data, error } = await supabase
          .from('author_profiles' as any)
          .insert(profileData)
          .select()
          .single();

        if (error) throw error;

        toast({
          title: 'Profile created',
          description: 'New author profile has been created.',
        });

        onSave(data as unknown as AuthorProfile);
      }

      onOpenChange(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to save author profile.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {profile ? 'Edit Author Profile' : 'Create Author Profile'}
          </DialogTitle>
          <DialogDescription>
            Author profiles are reused across all blog posts.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name *</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g., John Smith"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Brief author bio for E-E-A-T signals..."
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Include expertise and credentials to build trust
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatarUrl">Avatar URL</Label>
            <Input
              id="avatarUrl"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
            />
            {avatarUrl && (
              <img
                src={avatarUrl}
                alt="Avatar preview"
                className="w-16 h-16 rounded-full object-cover mt-2"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {profile ? 'Save Changes' : 'Create Profile'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AuthorProfileDialog;
