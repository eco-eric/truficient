import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Plus, Search, LayoutGrid, List, MoreHorizontal, Eye, Pencil, Trash2, Calendar, DollarSign, MapPin, User } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import JobFormDialog from '@/components/admin/jobs/JobFormDialog';

interface Job {
  id: string;
  job_number: string;
  title: string;
  priority: string;
  payment_status: string;
  scheduled_start: string | null;
  scheduled_end: string | null;
  quoted_amount: number | null;
  final_amount: number | null;
  created_at: string;
  job_type: {
    id: string;
    name: string;
    category: string;
    color: string;
  };
  current_stage: {
    id: string;
    name: string;
    stage_type: string;
    color: string;
  } | null;
  customer: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    company_name: string | null;
  };
  location: {
    id: string;
    address_line1: string;
    city: string;
  } | null;
}

interface JobType {
  id: string;
  name: string;
  category: string;
  color: string;
}

interface JobStage {
  id: string;
  job_type_id: string;
  name: string;
  stage_type: string;
  color: string;
  sort_order: number;
}

export default function Jobs() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterJobType, setFilterJobType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['crm_jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_jobs')
        .select(`
          *,
          job_type:crm_job_types(id, name, category, color),
          current_stage:crm_job_stages(id, name, stage_type, color),
          customer:crm_customers(id, first_name, last_name, company_name),
          location:crm_locations(id, address_line1, city)
        `)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Job[];
    }
  });

  const { data: jobTypes = [] } = useQuery({
    queryKey: ['crm_job_types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_job_types')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      if (error) throw error;
      return data as JobType[];
    }
  });

  const { data: allStages = [] } = useQuery({
    queryKey: ['crm_job_stages_all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_job_stages')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      if (error) throw error;
      return data as JobStage[];
    }
  });

  const moveJobMutation = useMutation({
    mutationFn: async ({ jobId, stageId }: { jobId: string; stageId: string }) => {
      const { error } = await supabase
        .from('crm_jobs')
        .update({ current_stage_id: stageId })
        .eq('id', jobId);
      if (error) throw error;
      
      // Log stage history
      await supabase.from('crm_job_stage_history').insert({
        job_id: jobId,
        to_stage_id: stageId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm_jobs'] });
      toast.success('Job moved');
    }
  });

  const deleteJobMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('crm_jobs')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm_jobs'] });
      toast.success('Job deleted');
    }
  });

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesSearch = searchQuery === '' || 
        job.job_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.customer?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.customer?.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.customer?.company_name?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = filterJobType === 'all' || job.job_type?.id === filterJobType;
      const matchesPriority = filterPriority === 'all' || job.priority === filterPriority;
      
      return matchesSearch && matchesType && matchesPriority;
    });
  }, [jobs, searchQuery, filterJobType, filterPriority]);

  // Group stages by type for Kanban columns
  const kanbanColumns = useMemo(() => {
    const stageTypes = ['initial', 'in_progress', 'review', 'completed', 'cancelled'];
    return stageTypes.map(type => ({
      type,
      label: type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      jobs: filteredJobs.filter(job => job.current_stage?.stage_type === type)
    }));
  }, [filteredJobs]);

  const priorityColors: Record<string, string> = {
    low: 'bg-slate-500/10 text-slate-600',
    normal: 'bg-blue-500/10 text-blue-600',
    high: 'bg-orange-500/10 text-orange-600',
    urgent: 'bg-red-500/10 text-red-600'
  };

  const getCustomerName = (job: Job) => {
    if (job.customer?.company_name) return job.customer.company_name;
    return `${job.customer?.first_name || ''} ${job.customer?.last_name || ''}`.trim() || 'Unknown';
  };

  return (
    <AdminLayout title="Jobs Board">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Jobs Board</h1>
            <p className="text-muted-foreground">Track and manage all jobs through their workflow</p>
          </div>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingJob(null)}>
                <Plus className="h-4 w-4 mr-2" /> New Job
              </Button>
            </DialogTrigger>
            <JobFormDialog
              editingJob={editingJob}
              jobTypes={jobTypes}
              allStages={allStages}
              onClose={() => { setIsFormOpen(false); setEditingJob(null); }}
            />
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterJobType} onValueChange={setFilterJobType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Job Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {jobTypes.map(type => (
                <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1 border rounded-lg p-1">
            <Button
              variant={viewMode === 'kanban' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('kanban')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">Loading jobs...</p>
        ) : viewMode === 'kanban' ? (
          /* Kanban View */
          <div className="grid grid-cols-5 gap-4 min-h-[600px]">
            {kanbanColumns.map(column => (
              <div key={column.type} className="flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm">{column.label}</h3>
                  <Badge variant="secondary">{column.jobs.length}</Badge>
                </div>
                <div className="flex-1 space-y-3 p-2 bg-muted/30 rounded-lg min-h-[500px]">
                  {column.jobs.map(job => (
                    <Card
                      key={job.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => navigate(`/admin/jobs/${job.id}`)}
                    >
                      <CardContent className="p-3 space-y-2">
                        <div className="flex items-start justify-between">
                          <span className="text-xs text-muted-foreground">{job.job_number}</span>
                          <Badge className={priorityColors[job.priority]}>{job.priority}</Badge>
                        </div>
                        <h4 className="font-medium text-sm line-clamp-2">{job.title}</h4>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <User className="h-3 w-3" />
                          {getCustomerName(job)}
                        </div>
                        {job.scheduled_start && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(job.scheduled_start), 'MMM d, yyyy')}
                          </div>
                        )}
                        {job.quoted_amount && (
                          <div className="flex items-center gap-1 text-xs font-medium">
                            <DollarSign className="h-3 w-3" />
                            ${job.quoted_amount.toLocaleString()}
                          </div>
                        )}
                        <div
                          className="w-full h-1 rounded-full mt-2"
                          style={{ backgroundColor: job.job_type?.color || '#3B82F6' }}
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job #</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Scheduled</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJobs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No jobs found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredJobs.map(job => (
                    <TableRow key={job.id} className="cursor-pointer" onClick={() => navigate(`/admin/jobs/${job.id}`)}>
                      <TableCell className="font-mono text-sm">{job.job_number}</TableCell>
                      <TableCell className="font-medium">{job.title}</TableCell>
                      <TableCell>{getCustomerName(job)}</TableCell>
                      <TableCell>
                        <Badge style={{ backgroundColor: job.job_type?.color + '20', color: job.job_type?.color }}>
                          {job.job_type?.name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {job.current_stage && (
                          <Badge variant="outline" style={{ borderColor: job.current_stage.color, color: job.current_stage.color }}>
                            {job.current_stage.name}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={priorityColors[job.priority]}>{job.priority}</Badge>
                      </TableCell>
                      <TableCell>
                        {job.scheduled_start ? format(new Date(job.scheduled_start), 'MMM d, yyyy') : '-'}
                      </TableCell>
                      <TableCell>
                        {job.quoted_amount ? `$${job.quoted_amount.toLocaleString()}` : '-'}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/admin/jobs/${job.id}`); }}>
                              <Eye className="h-4 w-4 mr-2" /> View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setEditingJob(job); setIsFormOpen(true); }}>
                              <Pencil className="h-4 w-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={(e) => { e.stopPropagation(); deleteJobMutation.mutate(job.id); }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
