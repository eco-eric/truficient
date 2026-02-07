import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft, Calendar, DollarSign, MapPin, User, Phone, Mail, ChevronRight, Users } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { WorkEdgePanel } from '@/components/admin/jobs/WorkEdgePanel';
import SchedulingWidget from '@/components/admin/calendar/SchedulingWidget';

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: job, isLoading } = useQuery({
    queryKey: ['crm_job', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_jobs')
        .select(`
          *,
          job_type:crm_job_types(*),
          current_stage:crm_job_stages(*),
          customer:crm_customers(*),
          location:crm_locations(*)
        `)
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  const { data: stages = [] } = useQuery({
    queryKey: ['crm_job_stages', job?.job_type?.id],
    queryFn: async () => {
      if (!job?.job_type?.id) return [];
      const { data, error } = await supabase
        .from('crm_job_stages')
        .select('*')
        .eq('job_type_id', job.job_type.id)
        .eq('is_active', true)
        .order('sort_order');
      if (error) throw error;
      return data;
    },
    enabled: !!job?.job_type?.id
  });

  const { data: stageHistory = [] } = useQuery({
    queryKey: ['crm_job_stage_history', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_job_stage_history')
        .select(`
          *,
          from_stage:crm_job_stages!crm_job_stage_history_from_stage_id_fkey(name, color),
          to_stage:crm_job_stages!crm_job_stage_history_to_stage_id_fkey(name, color)
        `)
        .eq('job_id', id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  const { data: assignments = [] } = useQuery({
    queryKey: ['crm_job_assignments', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_job_assignments')
        .select(`
          *,
          team:crm_teams(id, name, color),
          member:crm_team_members(id, first_name, last_name, role)
        `)
        .eq('job_id', id);
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['crm_teams_active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_teams')
        .select('*, assignments:crm_team_assignments(*, member:crm_team_members(*))')
        .eq('is_active', true);
      if (error) throw error;
      return data;
    }
  });

  const moveToStageMutation = useMutation({
    mutationFn: async (stageId: string) => {
      const { error } = await supabase
        .from('crm_jobs')
        .update({ current_stage_id: stageId })
        .eq('id', id);
      if (error) throw error;

      await supabase.from('crm_job_stage_history').insert({
        job_id: id,
        from_stage_id: job?.current_stage?.id,
        to_stage_id: stageId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm_job', id] });
      queryClient.invalidateQueries({ queryKey: ['crm_job_stage_history', id] });
      toast.success('Job moved to new stage');
    }
  });

  const assignTeamMutation = useMutation({
    mutationFn: async (teamId: string) => {
      const { error } = await supabase.from('crm_job_assignments').insert({
        job_id: id,
        team_id: teamId
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm_job_assignments', id] });
      toast.success('Team assigned');
    }
  });

  const updatePaymentStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const { error } = await supabase
        .from('crm_jobs')
        .update({ payment_status: status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm_job', id] });
      toast.success('Payment status updated');
    }
  });

  if (isLoading) {
    return (
      <AdminLayout title="Job Details">
        <p className="text-muted-foreground">Loading job...</p>
      </AdminLayout>
    );
  }

  if (!job) {
    return (
      <AdminLayout title="Job Details">
        <p className="text-muted-foreground">Job not found</p>
      </AdminLayout>
    );
  }

  const priorityColors: Record<string, string> = {
    low: 'bg-slate-500/10 text-slate-600',
    normal: 'bg-blue-500/10 text-blue-600',
    high: 'bg-orange-500/10 text-orange-600',
    urgent: 'bg-red-500/10 text-red-600'
  };

  const paymentStatusColors: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-600',
    deposit_received: 'bg-blue-500/10 text-blue-600',
    partial: 'bg-purple-500/10 text-purple-600',
    paid: 'bg-green-500/10 text-green-600',
    refunded: 'bg-red-500/10 text-red-600'
  };

  const currentStageIndex = stages.findIndex(s => s.id === job.current_stage?.id);

  return (
    <AdminLayout title={`Job ${job.job_number}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin/jobs')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground font-mono">{job.job_number}</span>
                <Badge className={priorityColors[job.priority]}>{job.priority}</Badge>
                <Badge style={{ backgroundColor: job.job_type?.color + '20', color: job.job_type?.color }}>
                  {job.job_type?.name}
                </Badge>
              </div>
              <h1 className="text-2xl font-bold mt-1">{job.title}</h1>
            </div>
          </div>
        </div>

        {/* Stage Progress Bar */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Workflow Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {stages.map((stage, index) => {
                const isCurrent = stage.id === job.current_stage?.id;
                const isPast = index < currentStageIndex;
                const isCancelled = stage.stage_type === 'cancelled';
                
                return (
                  <div key={stage.id} className="flex items-center">
                    <button
                      onClick={() => !isCurrent && moveToStageMutation.mutate(stage.id)}
                      disabled={isCurrent}
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                        isCurrent && "ring-2 ring-offset-2",
                        isPast && "opacity-60",
                        isCancelled && "border-dashed"
                      )}
                      style={{
                        backgroundColor: isCurrent ? stage.color : stage.color + '20',
                        color: isCurrent ? 'white' : stage.color,
                        borderColor: stage.color
                      }}
                    >
                      {stage.name}
                    </button>
                    {index < stages.length - 1 && !isCancelled && (
                      <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer & Location */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Customer & Location</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">
                      {job.customer?.company_name || `${job.customer?.first_name} ${job.customer?.last_name}`}
                    </h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      {job.customer?.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {job.customer.phone}
                        </span>
                      )}
                      {job.customer?.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {job.customer.email}
                        </span>
                      )}
                    </div>
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-sm"
                      onClick={() => navigate(`/admin/customers/${job.customer?.id}`)}
                    >
                      View Customer Profile →
                    </Button>
                  </div>
                </div>
                {job.location && (
                  <>
                    <Separator />
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                        <MapPin className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <h4 className="font-medium">{job.location.address_line1}</h4>
                        <p className="text-sm text-muted-foreground">
                          {job.location.city}, {job.location.state} {job.location.zip_code}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Schedule</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Scheduled Start</p>
                  <p className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {job.scheduled_start 
                      ? format(new Date(job.scheduled_start), 'PPP p') 
                      : 'Not scheduled'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Scheduled End</p>
                  <p className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {job.scheduled_end 
                      ? format(new Date(job.scheduled_end), 'PPP p') 
                      : 'Not set'}
                  </p>
                </div>
                {(job.actual_start || job.actual_end) && (
                  <>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Actual Start</p>
                      <p className="font-medium">
                        {job.actual_start ? format(new Date(job.actual_start), 'PPP p') : '-'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Actual End</p>
                      <p className="font-medium">
                        {job.actual_end ? format(new Date(job.actual_end), 'PPP p') : '-'}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            {(job.internal_notes || job.customer_notes) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Notes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {job.internal_notes && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Internal Notes</p>
                      <p className="text-sm whitespace-pre-wrap">{job.internal_notes}</p>
                    </div>
                  )}
                  {job.customer_notes && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Customer Notes</p>
                      <p className="text-sm whitespace-pre-wrap">{job.customer_notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Stage History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Activity Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                {stageHistory.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No stage changes recorded yet</p>
                ) : (
                  <div className="space-y-4">
                    {stageHistory.map((entry: any) => (
                      <div key={entry.id} className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full mt-2 bg-primary" />
                        <div className="flex-1">
                          <p className="text-sm">
                            Moved to <Badge variant="outline" style={{ borderColor: entry.to_stage?.color, color: entry.to_stage?.color }}>{entry.to_stage?.name}</Badge>
                            {entry.from_stage && (
                              <> from <Badge variant="outline">{entry.from_stage?.name}</Badge></>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(entry.created_at), 'PPP p')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Financials */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Financials</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Quoted Amount</p>
                  <p className="text-2xl font-bold flex items-center gap-1">
                    <DollarSign className="h-5 w-5" />
                    {job.quoted_amount?.toLocaleString() || '0'}
                  </p>
                </div>
                {job.final_amount && job.final_amount !== job.quoted_amount && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Final Amount</p>
                    <p className="text-xl font-semibold">${job.final_amount.toLocaleString()}</p>
                  </div>
                )}
                <Separator />
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Payment Status</p>
                  <Select
                    value={job.payment_status}
                    onValueChange={(v) => updatePaymentStatusMutation.mutate(v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="deposit_received">Deposit Received</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Crew Assignment */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-4 w-4" /> Assigned Crew
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {assignments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No crew assigned</p>
                ) : (
                  <div className="space-y-2">
                    {assignments.map((assignment: any) => (
                      <div key={assignment.id} className="flex items-center gap-2 p-2 rounded-lg bg-accent/50">
                        {assignment.team && (
                          <Badge style={{ backgroundColor: assignment.team.color + '20', color: assignment.team.color }}>
                            {assignment.team.name}
                          </Badge>
                        )}
                        {assignment.member && (
                          <span className="text-sm">
                            {assignment.member.first_name} {assignment.member.last_name}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <Select onValueChange={(v) => assignTeamMutation.mutate(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Assign a team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team: any) => (
                      <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span>{format(new Date(job.created_at), 'PPP')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span>{format(new Date(job.updated_at), 'PPP')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <span className="capitalize">{job.job_type?.category}</span>
                </div>
                {job.job_type?.requires_permit && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Permit Required</span>
                    <Badge variant="outline">Yes</Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Scheduling Widget */}
            <SchedulingWidget 
              job={{
                id: job.id,
                job_number: job.job_number,
                title: job.title,
                scheduled_start: job.scheduled_start,
                scheduled_end: job.scheduled_end,
                google_calendar_event_id: job.google_calendar_event_id,
                google_calendar_id: job.google_calendar_id,
                customer: job.customer ? {
                  first_name: job.customer.first_name,
                  last_name: job.customer.last_name,
                  phone: job.customer.phone
                } : null,
                location: job.location ? {
                  address_line1: job.location.address_line1,
                  city: job.location.city,
                  state: job.location.state,
                  zip_code: job.location.zip_code
                } : null,
                job_type: job.job_type ? {
                  name: job.job_type.name,
                  default_duration_hours: job.job_type.default_duration_hours
                } : null,
                priority: job.priority,
                customer_notes: job.customer_notes
              }}
              onUpdate={() => queryClient.invalidateQueries({ queryKey: ['crm_job', id] })}
            />

            {/* WorkEdge Panel */}
            <WorkEdgePanel jobId={job.id} workedgeProjectId={job.workedge_project_id} />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
