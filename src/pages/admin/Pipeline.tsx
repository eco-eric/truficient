import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Kanban, Users } from 'lucide-react';

const Pipeline = () => {
  const stages = [
    { name: 'New Lead', color: 'bg-blue-500', count: 0 },
    { name: 'Contacted', color: 'bg-purple-500', count: 0 },
    { name: 'Estimate Scheduled', color: 'bg-amber-500', count: 0 },
    { name: 'Proposal Sent', color: 'bg-orange-500', count: 0 },
    { name: 'Negotiating', color: 'bg-cyan-500', count: 0 },
    { name: 'Won', color: 'bg-green-500', count: 0 },
    { name: 'Lost', color: 'bg-red-500', count: 0 },
  ];

  return (
    <AdminLayout title="Sales Pipeline">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sales Pipeline</h1>
          <p className="text-muted-foreground">
            Track leads through your sales process
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {stages.map((stage) => (
            <Card key={stage.name} className="min-h-[400px]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                  {stage.name}
                </CardTitle>
                <p className="text-xs text-muted-foreground">{stage.count} leads</p>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed rounded-lg">
                  <Users className="h-6 w-6 text-muted-foreground mb-2" />
                  <p className="text-xs text-muted-foreground">
                    Drop leads here
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Kanban className="h-5 w-5" />
              Pipeline Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Kanban className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No leads in pipeline</h3>
              <p className="text-muted-foreground mt-1 max-w-sm">
                Convert submissions to customers to add them to your sales pipeline.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Pipeline;
