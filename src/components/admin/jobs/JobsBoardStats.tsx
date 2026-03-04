import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Home, Building2, Wrench, HardHat } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Job {
  id: string;
  job_type: {
    id: string;
    name: string;
    category: string;
    color: string;
    slug: string;
  };
  current_stage: {
    id: string;
    name: string;
    stage_type: string;
    color: string;
  } | null;
}

interface JobsBoardStatsProps {
  jobs: Job[];
}

export function JobsBoardStats({ jobs }: JobsBoardStatsProps) {
  const stats = useMemo(() => {
    const total = jobs.length;
    const residential = jobs.filter(j => j.job_type?.category === 'residential').length;
    const commercial = jobs.filter(j => j.job_type?.category === 'commercial').length;
    const serviceCalls = jobs.filter(j => j.job_type?.slug?.includes('service-call')).length;
    const installs = jobs.filter(j => j.job_type?.slug?.includes('installation')).length;
    const other = total - serviceCalls - installs;

    // Stage breakdown (active stages only)
    const stageMap = new Map<string, { name: string; count: number; color: string }>();
    for (const job of jobs) {
      if (job.current_stage && job.current_stage.stage_type !== 'cancelled' && job.current_stage.stage_type !== 'closed_won') {
        const key = job.current_stage.name;
        const existing = stageMap.get(key);
        if (existing) {
          existing.count++;
        } else {
          stageMap.set(key, { name: key, count: 1, color: job.current_stage.color });
        }
      }
    }
    const stages = Array.from(stageMap.values()).sort((a, b) => b.count - a.count).slice(0, 6);

    return { total, residential, commercial, serviceCalls, installs, other, stages };
  }, [jobs]);

  const statItems = [
    { label: 'All Jobs', value: stats.total, icon: Briefcase, className: 'text-foreground' },
    { label: 'Residential', value: stats.residential, icon: Home, className: 'text-blue-600' },
    { label: 'Commercial', value: stats.commercial, icon: Building2, className: 'text-cyan-600' },
    { label: 'Service', value: stats.serviceCalls, icon: Wrench, className: 'text-amber-600' },
    { label: 'Install', value: stats.installs, icon: HardHat, className: 'text-emerald-600' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {statItems.map(item => {
        const Icon = item.icon;
        return (
          <Card key={item.label} className="border">
            <CardContent className="p-3 flex items-center gap-3">
              <div className={cn("p-2 rounded-md bg-muted", item.className)}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-2xl font-bold leading-none">{item.value}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{item.label}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
