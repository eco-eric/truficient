import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { GitBranch, ArrowRight } from 'lucide-react';

interface PipelineStage {
  name: string;
  count: number;
  value: number;
  color: string;
  bgColor: string;
}

interface PipelineData {
  stages: PipelineStage[];
  total: number;
}

export const PipelineStatus = () => {
  const { data: pipeline, isLoading } = useQuery({
    queryKey: ['pipeline-status'],
    queryFn: async (): Promise<PipelineData> => {
      // Fetch all submissions from both estimators
      const [ductedResult, ductlessResult] = await Promise.all([
        supabase
          .from('ducted_estimate_submissions')
          .select('status, final_total'),
        supabase
          .from('ductless_estimate_submissions')
          .select('status, final_total'),
      ]);

      const allSubmissions = [
        ...(ductedResult.data || []),
        ...(ductlessResult.data || []),
      ];

      // Count by status
      const statusCounts: Record<string, { count: number; value: number }> = {
        partial: { count: 0, value: 0 },
        new: { count: 0, value: 0 },
        reviewed: { count: 0, value: 0 },
        contacted: { count: 0, value: 0 },
        closed: { count: 0, value: 0 },
      };

      allSubmissions.forEach((submission) => {
        const status = submission.status || 'new';
        if (statusCounts[status]) {
          statusCounts[status].count += 1;
          statusCounts[status].value += submission.final_total || 0;
        }
      });

      const stages: PipelineStage[] = [
        {
          name: 'Abandoned',
          count: statusCounts.partial.count,
          value: statusCounts.partial.value,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
        },
        {
          name: 'New',
          count: statusCounts.new.count,
          value: statusCounts.new.value,
          color: 'text-amber-600',
          bgColor: 'bg-amber-100',
        },
        {
          name: 'Reviewed',
          count: statusCounts.reviewed.count,
          value: statusCounts.reviewed.value,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
        },
        {
          name: 'Contacted',
          count: statusCounts.contacted.count,
          value: statusCounts.contacted.value,
          color: 'text-purple-600',
          bgColor: 'bg-purple-100',
        },
        {
          name: 'Closed',
          count: statusCounts.closed.count,
          value: statusCounts.closed.value,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
        },
      ];

      const total = allSubmissions.length;

      return { stages, total };
    },
    staleTime: 60000,
  });

  const formatCurrency = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}k`;
    }
    return `$${value.toFixed(0)}`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-primary" />
            Pipeline Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex-1">
                <Skeleton className="h-16 w-full rounded-lg" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxCount = Math.max(...(pipeline?.stages.map(s => s.count) || [1]));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-primary" />
          Pipeline Status
          <span className="text-sm font-normal text-muted-foreground ml-auto">
            {pipeline?.total || 0} total leads
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Funnel visualization */}
        <div className="flex items-stretch gap-1">
          {pipeline?.stages.map((stage, index) => {
            const heightPercent = maxCount > 0 ? (stage.count / maxCount) * 100 : 0;
            const minHeight = stage.count > 0 ? 30 : 20;
            
            return (
              <div key={stage.name} className="flex-1 flex flex-col items-center gap-2">
                {/* Stage bar */}
                <div className="w-full flex flex-col items-center justify-end h-[80px]">
                  <div
                    className={`w-full rounded-t-lg transition-all ${stage.bgColor}`}
                    style={{ 
                      height: `${Math.max(heightPercent, minHeight)}%`,
                      minHeight: `${minHeight}px`
                    }}
                  >
                    <div className="flex flex-col items-center justify-center h-full p-1">
                      <span className={`text-lg font-bold ${stage.color}`}>
                        {stage.count}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Stage label */}
                <div className="text-center">
                  <p className="text-xs font-medium truncate">{stage.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(stage.value)}
                  </p>
                </div>

                {/* Arrow to next stage (except last) */}
                {index < (pipeline?.stages.length || 0) - 1 && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 hidden md:block">
                    <ArrowRight className="h-3 w-3 text-muted-foreground/50" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Conversion rate summary */}
        <div className="mt-4 pt-3 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Conversion Rate</span>
            <span className="font-medium">
              {pipeline && pipeline.total > 0
                ? `${(((pipeline.stages.find(s => s.name === 'Closed')?.count || 0) / 
                    (pipeline.total - (pipeline.stages.find(s => s.name === 'Abandoned')?.count || 0))) * 100).toFixed(1)}%`
                : '0%'}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Based on submitted quotes (excludes abandoned)
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
