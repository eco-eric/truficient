import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Wind, DollarSign, ShoppingCart, RefreshCw, CheckCircle, Clock, AlertCircle, Layers } from 'lucide-react';

interface DuctlessMetrics {
  totalQuotes: number;
  totalValue: number;
  avgQuoteValue: number;
  abandonedCarts: number;
  syncedCount: number;
  pendingCount: number;
  failedCount: number;
  newCount: number;
  closedCount: number;
  avgZoneCount: number;
}

export const DuctlessMetricsCard = () => {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['ductless-metrics'],
    queryFn: async (): Promise<DuctlessMetrics> => {
      const { data, error } = await supabase
        .from('ductless_estimate_submissions')
        .select('status, final_total, ghl_sync_status, zone_count');
      
      if (error) throw error;

      const submissions = data || [];
      
      // Filter out partial (abandoned) for quote metrics
      const completedSubmissions = submissions.filter(s => s.status !== 'partial');
      const abandonedSubmissions = submissions.filter(s => s.status === 'partial');

      const totalValue = completedSubmissions.reduce((sum, s) => sum + (s.final_total || 0), 0);
      const avgQuoteValue = completedSubmissions.length > 0 
        ? totalValue / completedSubmissions.length 
        : 0;

      // Average zone count
      const totalZones = completedSubmissions.reduce((sum, s) => sum + (s.zone_count || 0), 0);
      const avgZoneCount = completedSubmissions.length > 0 
        ? totalZones / completedSubmissions.length 
        : 0;

      // GHL sync status counts (only for completed submissions)
      const syncedCount = completedSubmissions.filter(s => s.ghl_sync_status === 'synced').length;
      const pendingCount = completedSubmissions.filter(s => s.ghl_sync_status === 'pending').length;
      const failedCount = completedSubmissions.filter(s => s.ghl_sync_status === 'failed').length;

      // Status counts
      const newCount = submissions.filter(s => s.status === 'new').length;
      const closedCount = submissions.filter(s => s.status === 'closed').length;

      return {
        totalQuotes: completedSubmissions.length,
        totalValue,
        avgQuoteValue,
        abandonedCarts: abandonedSubmissions.length,
        syncedCount,
        pendingCount,
        failedCount,
        newCount,
        closedCount,
        avgZoneCount,
      };
    },
    staleTime: 60000,
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Wind className="h-5 w-5" />
            Ductless Estimator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-l-4 border-l-emerald-500">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Wind className="h-5 w-5 text-emerald-600" />
            Ductless Estimator
          </CardTitle>
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
            Mini-Split
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quote Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <DollarSign className="h-4 w-4" />
              <span className="text-xs">Total Quotes</span>
            </div>
            <p className="text-2xl font-bold">{metrics?.totalQuotes || 0}</p>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(metrics?.totalValue || 0)} total
            </p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <DollarSign className="h-4 w-4" />
              <span className="text-xs">Avg Quote</span>
            </div>
            <p className="text-2xl font-bold">
              {formatCurrency(metrics?.avgQuoteValue || 0)}
            </p>
          </div>
        </div>

        {/* Status Row */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-muted-foreground">New:</span>
              <span className="font-medium">{metrics?.newCount || 0}</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-muted-foreground">Closed:</span>
              <span className="font-medium">{metrics?.closedCount || 0}</span>
            </span>
          </div>
          <span className="flex items-center gap-1 text-muted-foreground">
            <Layers className="h-3 w-3" />
            <span className="text-xs">Avg {metrics?.avgZoneCount?.toFixed(1) || 0} zones</span>
          </span>
        </div>

        {/* GHL Sync Status */}
        <div className="pt-3 border-t">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <RefreshCw className="h-3 w-3" />
              GHL Sync Status
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="font-medium">{metrics?.syncedCount || 0}</span>
            </span>
            <span className="flex items-center gap-1 text-sm">
              <Clock className="h-4 w-4 text-amber-500" />
              <span className="font-medium">{metrics?.pendingCount || 0}</span>
            </span>
            {(metrics?.failedCount || 0) > 0 && (
              <span className="flex items-center gap-1 text-sm">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="font-medium text-red-600">{metrics?.failedCount}</span>
              </span>
            )}
          </div>
        </div>

        {/* Abandoned Carts */}
        <div className="flex items-center justify-between pt-3 border-t">
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShoppingCart className="h-4 w-4" />
            Abandoned Carts
          </span>
          <Badge variant={metrics?.abandonedCarts ? "destructive" : "secondary"}>
            {metrics?.abandonedCarts || 0}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};
