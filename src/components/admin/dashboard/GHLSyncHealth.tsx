import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, Clock, AlertTriangle, RefreshCw, Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface SyncStats {
  synced: number;
  pending: number;
  failed: number;
  total: number;
  recentActivity: {
    id: string;
    source: string;
    status: string;
    created_at: string;
  }[];
  stalePending: number;
}

export const GHLSyncHealth = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['ghl-sync-health'],
    queryFn: async (): Promise<SyncStats> => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

      // Fetch from all sources in parallel
      const [ductedResult, ductlessResult, scannerResult, landingResult] = await Promise.all([
        supabase
          .from('ducted_estimate_submissions')
          .select('id, ghl_sync_status, created_at')
          .neq('status', 'partial'),
        supabase
          .from('ductless_estimate_submissions')
          .select('id, ghl_sync_status, created_at')
          .neq('status', 'partial'),
        supabase
          .from('equipment_scans')
          .select('id, ghl_sync_status, created_at')
          .not('email', 'is', null),
        supabase
          .from('landing_page_submissions')
          .select('id, ghl_sync_status, created_at'),
      ]);

      const allRecords = [
        ...(ductedResult.data || []).map(r => ({ ...r, source: 'Ducted' })),
        ...(ductlessResult.data || []).map(r => ({ ...r, source: 'Ductless' })),
        ...(scannerResult.data || []).map(r => ({ ...r, source: 'Scanner' })),
        ...(landingResult.data || []).map(r => ({ ...r, source: 'Landing Page' })),
      ];

      const synced = allRecords.filter(r => r.ghl_sync_status === 'synced').length;
      const pending = allRecords.filter(r => r.ghl_sync_status === 'pending').length;
      const failed = allRecords.filter(r => r.ghl_sync_status === 'failed').length;

      // Count stale pending (pending for more than 1 hour)
      const stalePending = allRecords.filter(
        r => r.ghl_sync_status === 'pending' && r.created_at && r.created_at < oneHourAgo
      ).length;

      // Get recent activity (last 5 records)
      const recentActivity = allRecords
        .filter(r => r.created_at)
        .sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime())
        .slice(0, 5)
        .map(r => ({
          id: r.id,
          source: r.source,
          status: r.ghl_sync_status || 'pending',
          created_at: r.created_at!,
        }));

      return {
        synced,
        pending,
        failed,
        total: allRecords.length,
        recentActivity,
        stalePending,
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const syncRate = stats?.total ? Math.round((stats.synced / stats.total) * 100) : 0;
  const hasIssues = (stats?.failed || 0) > 0 || (stats?.stalePending || 0) > 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'synced':
        return <CheckCircle2 className="h-3 w-3 text-green-500" />;
      case 'pending':
        return <Clock className="h-3 w-3 text-yellow-500" />;
      case 'failed':
        return <AlertTriangle className="h-3 w-3 text-red-500" />;
      default:
        return <Clock className="h-3 w-3 text-muted-foreground" />;
    }
  };

  return (
    <Card className={hasIssues ? 'border-yellow-500/50' : ''}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-primary" />
            GHL Sync Health
          </CardTitle>
          {hasIssues && (
            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30">
              Needs Attention
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sync Status Summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-green-500/10 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-xs font-medium text-green-600">Synced</span>
            </div>
            <p className="text-2xl font-bold text-green-700">{stats?.synced || 0}</p>
          </div>
          <div className={`rounded-lg p-3 text-center ${(stats?.stalePending || 0) > 0 ? 'bg-yellow-500/20' : 'bg-yellow-500/10'}`}>
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="h-4 w-4 text-yellow-500" />
              <span className="text-xs font-medium text-yellow-600">Pending</span>
            </div>
            <p className="text-2xl font-bold text-yellow-700">{stats?.pending || 0}</p>
            {(stats?.stalePending || 0) > 0 && (
              <p className="text-[10px] text-yellow-600 mt-1">
                {stats?.stalePending} stale (&gt;1hr)
              </p>
            )}
          </div>
          <div className={`rounded-lg p-3 text-center ${(stats?.failed || 0) > 0 ? 'bg-red-500/20' : 'bg-red-500/10'}`}>
            <div className="flex items-center justify-center gap-1 mb-1">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-xs font-medium text-red-600">Failed</span>
            </div>
            <p className="text-2xl font-bold text-red-700">{stats?.failed || 0}</p>
          </div>
        </div>

        {/* Sync Rate Bar */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Sync Rate</span>
            <span className="font-medium">{syncRate}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500"
              style={{ width: `${syncRate}%` }}
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <div className="flex items-center gap-1 mb-2">
            <Activity className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Recent Activity</span>
          </div>
          <div className="space-y-1.5">
            {stats?.recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between text-xs bg-muted/50 rounded px-2 py-1.5"
              >
                <div className="flex items-center gap-2">
                  {getStatusIcon(activity.status)}
                  <span className="font-medium">{activity.source}</span>
                </div>
                <span className="text-muted-foreground">
                  {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                </span>
              </div>
            ))}
            {(!stats?.recentActivity || stats.recentActivity.length === 0) && (
              <p className="text-xs text-muted-foreground text-center py-2">No recent activity</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
