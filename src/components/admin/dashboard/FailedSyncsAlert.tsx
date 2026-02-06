import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, RefreshCw, Clock, ExternalLink, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface FailedSync {
  id: string;
  source: 'ducted' | 'ductless' | 'scanner' | 'landing';
  name: string;
  email: string;
  status: string;
  created_at: string;
  isStale: boolean;
}

export const FailedSyncsAlert = () => {
  const queryClient = useQueryClient();
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const { data: failedSyncs, isLoading } = useQuery({
    queryKey: ['failed-syncs'],
    queryFn: async (): Promise<FailedSync[]> => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

      // Fetch failed and stale pending from all sources
      const [ductedResult, ductlessResult, scannerResult, landingResult] = await Promise.all([
        supabase
          .from('ducted_estimate_submissions')
          .select('id, customer_name, customer_email, ghl_sync_status, created_at')
          .neq('status', 'partial')
          .or('ghl_sync_status.eq.failed,ghl_sync_status.eq.pending')
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('ductless_estimate_submissions')
          .select('id, customer_name, customer_email, ghl_sync_status, created_at')
          .neq('status', 'partial')
          .or('ghl_sync_status.eq.failed,ghl_sync_status.eq.pending')
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('equipment_scans')
          .select('id, customer_name, email, ghl_sync_status, created_at')
          .not('email', 'is', null)
          .or('ghl_sync_status.eq.failed,ghl_sync_status.eq.pending')
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('landing_page_submissions')
          .select('id, first_name, last_name, email, ghl_sync_status, created_at')
          .or('ghl_sync_status.eq.failed,ghl_sync_status.eq.pending')
          .order('created_at', { ascending: false })
          .limit(10),
      ]);

      const syncs: FailedSync[] = [];

      // Process ducted
      (ductedResult.data || []).forEach(r => {
        const isStale = r.ghl_sync_status === 'pending' && r.created_at < oneHourAgo;
        if (r.ghl_sync_status === 'failed' || isStale) {
          syncs.push({
            id: r.id,
            source: 'ducted',
            name: r.customer_name || 'Unknown',
            email: r.customer_email || '',
            status: r.ghl_sync_status || 'pending',
            created_at: r.created_at,
            isStale,
          });
        }
      });

      // Process ductless
      (ductlessResult.data || []).forEach(r => {
        const isStale = r.ghl_sync_status === 'pending' && r.created_at < oneHourAgo;
        if (r.ghl_sync_status === 'failed' || isStale) {
          syncs.push({
            id: r.id,
            source: 'ductless',
            name: r.customer_name || 'Unknown',
            email: r.customer_email || '',
            status: r.ghl_sync_status || 'pending',
            created_at: r.created_at,
            isStale,
          });
        }
      });

      // Process scanner
      (scannerResult.data || []).forEach(r => {
        const isStale = r.ghl_sync_status === 'pending' && r.created_at < oneHourAgo;
        if (r.ghl_sync_status === 'failed' || isStale) {
          syncs.push({
            id: r.id,
            source: 'scanner',
            name: r.customer_name || 'Unknown',
            email: r.email || '',
            status: r.ghl_sync_status || 'pending',
            created_at: r.created_at!,
            isStale,
          });
        }
      });

      // Process landing page
      (landingResult.data || []).forEach(r => {
        const isStale = r.ghl_sync_status === 'pending' && r.created_at < oneHourAgo;
        if (r.ghl_sync_status === 'failed' || isStale) {
          syncs.push({
            id: r.id,
            source: 'landing',
            name: `${r.first_name} ${r.last_name}`.trim() || 'Unknown',
            email: r.email || '',
            status: r.ghl_sync_status || 'pending',
            created_at: r.created_at,
            isStale,
          });
        }
      });

      // Sort by created_at descending
      return syncs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    },
    refetchInterval: 30000,
  });

  const retryMutation = useMutation({
    mutationFn: async (sync: FailedSync) => {
      // Get the full record to retry sync
      let record: Record<string, unknown> | null = null;
      
      if (sync.source === 'ducted') {
        const { data } = await supabase
          .from('ducted_estimate_submissions')
          .select('*')
          .eq('id', sync.id)
          .single();
        record = data;
      } else if (sync.source === 'ductless') {
        const { data } = await supabase
          .from('ductless_estimate_submissions')
          .select('*')
          .eq('id', sync.id)
          .single();
        record = data;
      } else if (sync.source === 'scanner') {
        const { data } = await supabase
          .from('equipment_scans')
          .select('*')
          .eq('id', sync.id)
          .single();
        record = data;
      } else if (sync.source === 'landing') {
        const { data } = await supabase
          .from('landing_page_submissions')
          .select('*')
          .eq('id', sync.id)
          .single();
        record = data;
      }

      if (!record) {
        throw new Error('Record not found');
      }

      // Prepare GHL sync payload based on source
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      let payload: Record<string, unknown>;

      if (sync.source === 'ducted') {
        const nameParts = ((record.customer_name as string) || '').split(' ');
        payload = {
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          email: record.customer_email,
          phone: record.customer_phone,
          address: record.customer_address,
          source: 'Ducted HVAC Estimator (Retry)',
          tags: ['ducted-estimator', 'retry-sync'],
        };
      } else if (sync.source === 'ductless') {
        const nameParts = ((record.customer_name as string) || '').split(' ');
        payload = {
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          email: record.customer_email,
          phone: record.customer_phone,
          address: record.customer_address,
          source: 'Ductless Estimator (Retry)',
          tags: ['ductless-estimator', 'retry-sync'],
        };
      } else if (sync.source === 'scanner') {
        const nameParts = ((record.customer_name as string) || '').split(' ');
        payload = {
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          email: record.email,
          phone: record.customer_phone,
          source: 'Equipment Scanner (Retry)',
          tags: ['scanner', 'retry-sync'],
        };
      } else {
        payload = {
          firstName: record.first_name,
          lastName: record.last_name,
          email: record.email,
          phone: record.phone,
          source: 'Landing Page (Retry)',
          tags: ['landing-page', 'retry-sync'],
        };
      }

      // Call GHL sync function
      const response = await fetch(`${supabaseUrl}/functions/v1/sync-ghl-contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Sync failed');
      }

      const result = await response.json();

      // Update the record with new sync status
      const table = sync.source === 'ducted' 
        ? 'ducted_estimate_submissions'
        : sync.source === 'ductless'
        ? 'ductless_estimate_submissions'
        : sync.source === 'scanner'
        ? 'equipment_scans'
        : 'landing_page_submissions';

      await supabase
        .from(table)
        .update({
          ghl_sync_status: 'synced',
          ghl_contact_id: result.contactId,
        })
        .eq('id', sync.id);

      return result;
    },
    onSuccess: () => {
      toast.success('Contact synced to GHL successfully');
      queryClient.invalidateQueries({ queryKey: ['failed-syncs'] });
      queryClient.invalidateQueries({ queryKey: ['ghl-sync-health'] });
      queryClient.invalidateQueries({ queryKey: ['ducted-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['ductless-metrics'] });
      setRetryingId(null);
    },
    onError: (error) => {
      console.error('Retry sync error:', error);
      toast.error('Failed to sync contact. Please try again.');
      setRetryingId(null);
    },
  });

  const handleRetry = (sync: FailedSync) => {
    setRetryingId(sync.id);
    retryMutation.mutate(sync);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!failedSyncs || failedSyncs.length === 0) {
    return (
      <Card className="border-green-500/30 bg-green-500/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-green-500" />
            Sync Issues
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-green-600 font-medium">All contacts synced successfully!</p>
            <p className="text-xs text-muted-foreground mt-1">No failed or stale syncs detected</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'ducted': return 'Ducted';
      case 'ductless': return 'Ductless';
      case 'scanner': return 'Scanner';
      case 'landing': return 'Landing';
      default: return source;
    }
  };

  return (
    <Card className="border-red-500/30">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            Sync Issues
          </CardTitle>
          <Badge variant="destructive" className="text-xs">
            {failedSyncs.length} issue{failedSyncs.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[280px] overflow-y-auto">
          {failedSyncs.map((sync) => (
            <div
              key={`${sync.source}-${sync.id}`}
              className={`flex items-center justify-between p-2 rounded-lg text-sm ${
                sync.status === 'failed' ? 'bg-red-500/10' : 'bg-yellow-500/10'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {sync.status === 'failed' ? (
                    <AlertTriangle className="h-3 w-3 text-red-500 shrink-0" />
                  ) : (
                    <Clock className="h-3 w-3 text-yellow-500 shrink-0" />
                  )}
                  <span className="font-medium truncate">{sync.name}</span>
                  <Badge variant="outline" className="text-[10px] px-1 py-0 shrink-0">
                    {getSourceLabel(sync.source)}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                  <span className="truncate">{sync.email}</span>
                  <span>•</span>
                  <span className="shrink-0">
                    {formatDistanceToNow(new Date(sync.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 shrink-0 ml-2"
                onClick={() => handleRetry(sync)}
                disabled={retryingId === sync.id}
              >
                {retryingId === sync.id ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3" />
                )}
                <span className="ml-1 text-xs">Retry</span>
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
