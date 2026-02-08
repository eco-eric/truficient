import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Shield, Crown, Trash2, ArrowRight, Zap, CheckCircle, AlertCircle, XCircle, FileText } from 'lucide-react';
import { SystemDocumentation } from '@/components/admin/settings/SystemDocumentation';
interface GhlVerificationResult {
  success: boolean;
  configured: string[];
  missing: string[];
  total: number;
  configuredCount: number;
  missingCount: number;
}

const Settings = () => {
  const { user } = useAuth();
  const { role, isAdmin, isSuperAdmin, loading: roleLoading } = useUserRole();
  const { toast } = useToast();
  const [claiming, setClaiming] = useState(false);
  const [verifyingGhl, setVerifyingGhl] = useState(false);
  const [ghlVerification, setGhlVerification] = useState<GhlVerificationResult | null>(null);
  const [ghlError, setGhlError] = useState<string | null>(null);

  const verifyGhlFields = async () => {
    setVerifyingGhl(true);
    setGhlError(null);
    setGhlVerification(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setGhlError('You must be logged in to verify GHL fields');
        return;
      }

      const { data, error } = await supabase.functions.invoke('verify-ghl-custom-fields', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('GHL verification error:', error);
        setGhlError(error.message || 'Failed to verify GHL custom fields');
        return;
      }

      if (data?.error) {
        setGhlError(data.error);
        return;
      }

      setGhlVerification(data as GhlVerificationResult);
      
      if (data.success) {
        toast({
          title: 'GHL Verification Complete',
          description: `All ${data.configuredCount} custom fields are configured correctly.`,
        });
      } else {
        toast({
          title: 'GHL Fields Missing',
          description: `${data.missingCount} custom field(s) need to be configured in GHL.`,
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('Error verifying GHL:', err);
      setGhlError('Failed to connect to verification service');
    } finally {
      setVerifyingGhl(false);
    }
  };

  const claimAdminRole = async () => {
    if (!user) return;
    
    setClaiming(true);
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          role: 'admin',
        });

      if (error) {
        if (error.message.includes('duplicate')) {
          toast({
            title: 'Already assigned',
            description: 'You already have a role assigned.',
            variant: 'destructive',
          });
        } else if (error.message.includes('policy')) {
          toast({
            title: 'Cannot claim admin',
            description: 'An admin already exists. Ask them to grant you access.',
            variant: 'destructive',
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: 'Success!',
          description: 'You are now an admin. Please refresh the page.',
        });
        // Refresh to update role
        window.location.reload();
      }
    } catch (error) {
      console.error('Error claiming admin:', error);
      toast({
        title: 'Error',
        description: 'Failed to claim admin role',
        variant: 'destructive',
      });
    } finally {
      setClaiming(false);
    }
  };

  return (
    <AdminLayout title="Settings">
      <div className="space-y-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              Your account information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-foreground">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">User ID</p>
              <p className="text-foreground font-mono text-sm">{user?.id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Role</p>
              {roleLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : role ? (
                <Badge variant={isAdmin ? 'default' : 'secondary'} className="flex items-center gap-1 w-fit">
                  {isAdmin ? <Crown className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </Badge>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">No role assigned</p>
                  <Button 
                    onClick={claimAdminRole} 
                    disabled={claiming}
                    size="sm"
                    className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90"
                  >
                    {claiming && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Claim Admin Role
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    First user to claim becomes admin. Otherwise, ask an existing admin.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>Admin Permissions</CardTitle>
              <CardDescription>
                As an admin, you have full access to:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Manage user roles and permissions</li>
                <li>SEO settings per page</li>
                <li>Calculator configuration</li>
                <li>All submissions and blog posts</li>
              </ul>
            </CardContent>
          </Card>
        )}

        {isAdmin && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Trash Bin</CardTitle>
              </div>
              <CardDescription>
                View and restore deleted items. Items are automatically removed after 30 days.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/admin/trash-bin">
                <Button variant="outline" className="gap-2">
                  View Trash Bin
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {isAdmin && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-muted-foreground" />
                <CardTitle>GoHighLevel Integration</CardTitle>
              </div>
              <CardDescription>
                Verify your GHL custom fields are configured correctly for estimator quote syncing.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={verifyGhlFields} 
                disabled={verifyingGhl}
                variant="outline"
                className="gap-2"
              >
                {verifyingGhl && <Loader2 className="h-4 w-4 animate-spin" />}
                Verify Custom Fields
              </Button>

              {ghlError && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                  <div className="flex items-center gap-2 text-destructive">
                    <XCircle className="h-4 w-4" />
                    <span className="font-medium">Error</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{ghlError}</p>
                </div>
              )}

              {ghlVerification && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {ghlVerification.success ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-amber-500" />
                    )}
                    <span className="font-medium">
                      {ghlVerification.configuredCount} of {ghlVerification.total} fields configured
                    </span>
                  </div>

                  {ghlVerification.missing.length > 0 && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/30">
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-2">
                        Missing Custom Fields ({ghlVerification.missingCount}):
                      </p>
                      <ul className="text-xs text-amber-700 dark:text-amber-300 space-y-1">
                        {ghlVerification.missing.map((field) => (
                          <li key={field} className="font-mono">• {field}</li>
                        ))}
                      </ul>
                      <p className="text-xs text-muted-foreground mt-3">
                        Add these custom fields in your GHL Location Settings → Custom Fields to enable full quote syncing.
                      </p>
                    </div>
                  )}

                  {ghlVerification.success && (
                    <p className="text-sm text-green-600 dark:text-green-400">
                      All required custom fields are configured. Estimator quotes will sync correctly.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {isSuperAdmin && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <CardTitle>System Documentation</CardTitle>
              </div>
              <CardDescription>
                Export technical documentation for external AI assistants like Claude
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SystemDocumentation />
            </CardContent>
          </Card>
        )}

        {role === 'manager' && (
          <Card>
            <CardHeader>
              <CardTitle>Manager Permissions</CardTitle>
              <CardDescription>
                As a manager, you have access to:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>View dashboard and analytics</li>
                <li>Manage contact submissions</li>
                <li>Create and edit blog posts</li>
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default Settings;
