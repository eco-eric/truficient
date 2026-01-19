import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, TrendingDown, Users, Target, Clock, BarChart3 } from 'lucide-react';
import { startOfWeek, subWeeks } from 'date-fns';

interface MetricCard {
  label: string;
  value: string | number;
  change?: number;
  icon: React.ComponentType<{ className?: string }>;
}

export const LeadMetrics = () => {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['lead-metrics'],
    queryFn: async () => {
      const thisWeekStart = startOfWeek(new Date());
      const lastWeekStart = startOfWeek(subWeeks(new Date(), 1));

      // Fetch all submissions for metrics
      const [contactResult, ductlessResult, scannerResult, landingResult] = await Promise.all([
        supabase.from('contact_submissions').select('id, status, created_at'),
        supabase.from('ductless_estimate_submissions').select('id, status, created_at'),
        supabase.from('equipment_scans').select('id, status, created_at').not('email', 'is', null),
        supabase.from('landing_page_submissions').select('id, status, created_at'),
      ]);

      const allSubmissions = [
        ...(contactResult.data || []).map(s => ({ ...s, source: 'Contact' })),
        ...(ductlessResult.data || []).map(s => ({ ...s, source: 'Ductless' })),
        ...(scannerResult.data || []).map(s => ({ ...s, source: 'Scanner' })),
        ...(landingResult.data || []).map(s => ({ ...s, source: 'Landing Page' })),
      ];

      const total = allSubmissions.length;
      
      // Calculate conversion (contacted or closed / total)
      const converted = allSubmissions.filter(
        s => s.status === 'contacted' || s.status === 'closed'
      ).length;
      const conversionRate = total > 0 ? Math.round((converted / total) * 100) : 0;

      // This week vs last week
      const thisWeekLeads = allSubmissions.filter(
        s => new Date(s.created_at) >= thisWeekStart
      ).length;
      const lastWeekLeads = allSubmissions.filter(
        s => new Date(s.created_at) >= lastWeekStart && new Date(s.created_at) < thisWeekStart
      ).length;
      const weekGrowth = lastWeekLeads > 0 
        ? Math.round(((thisWeekLeads - lastWeekLeads) / lastWeekLeads) * 100)
        : thisWeekLeads > 0 ? 100 : 0;

      // Top source
      const sourceCounts: Record<string, number> = {};
      allSubmissions.forEach(s => {
        sourceCounts[s.source] = (sourceCounts[s.source] || 0) + 1;
      });
      const topSource = Object.entries(sourceCounts)
        .sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';

      return {
        total,
        conversionRate,
        weekGrowth,
        thisWeekLeads,
        topSource,
      };
    },
    staleTime: 60000,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Lead Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const metricCards: MetricCard[] = [
    {
      label: 'Total Leads',
      value: metrics?.total || 0,
      icon: Users,
    },
    {
      label: 'Conversion Rate',
      value: `${metrics?.conversionRate || 0}%`,
      icon: Target,
    },
    {
      label: 'This Week',
      value: metrics?.thisWeekLeads || 0,
      change: metrics?.weekGrowth,
      icon: Clock,
    },
    {
      label: 'Top Source',
      value: metrics?.topSource || 'N/A',
      icon: BarChart3,
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Lead Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metricCards.map((metric) => (
            <div key={metric.label} className="space-y-1">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <metric.icon className="h-4 w-4" />
                <span className="text-xs font-medium">{metric.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{metric.value}</span>
                {metric.change !== undefined && (
                  <span className={`flex items-center text-xs font-medium ${
                    metric.change >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metric.change >= 0 ? (
                      <TrendingUp className="h-3 w-3 mr-0.5" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-0.5" />
                    )}
                    {Math.abs(metric.change)}%
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
