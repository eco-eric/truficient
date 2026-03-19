import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, parseISO, addDays, subDays } from 'date-fns';
import { Clock, Play, Square, Plus, ChevronLeft, ChevronRight, CalendarIcon, Check, X, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const OVERTIME_THRESHOLD = 8; // hours per day

export default function Timesheets() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [entryType, setEntryType] = useState<'manual' | 'clock'>('manual');
  const [selectedMember, setSelectedMember] = useState('');
  const [selectedJob, setSelectedJob] = useState('');
  const [manualStart, setManualStart] = useState('08:00');
  const [manualEnd, setManualEnd] = useState('17:00');
  const [breakMinutes, setBreakMinutes] = useState('30');
  const [notes, setNotes] = useState('');
  const queryClient = useQueryClient();
  const dateStr = format(selectedDate, 'yyyy-MM-dd');

  // Fetch active team members
  const { data: members = [] } = useQuery({
    queryKey: ['timesheet-members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_team_members')
        .select('id, first_name, last_name, role, hourly_rate, overtime_rate')
        .eq('is_active', true)
        .order('first_name');
      if (error) throw error;
      return data;
    },
  });

  // Fetch time entries for selected date
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['time-entries', dateStr],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('time_entries')
        .select(`
          *,
          team_member:crm_team_members(id, first_name, last_name, role, hourly_rate, overtime_rate),
          job:crm_jobs(id, job_number, title)
        `)
        .eq('entry_date', dateStr)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Fetch active jobs for linking
  const { data: activeJobs = [] } = useQuery({
    queryKey: ['timesheet-active-jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_jobs')
        .select('id, job_number, title, current_stage_id, crm_job_stages!crm_jobs_current_stage_id_fkey(stage_type)')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data || []).filter((j: any) => j.crm_job_stages?.stage_type !== 'end');
    },
  });

  // Add manual entry
  const addEntry = useMutation({
    mutationFn: async () => {
      const member = members.find(m => m.id === selectedMember);
      if (!member) throw new Error('Select a team member');
      
      const [startH, startM] = manualStart.split(':').map(Number);
      const [endH, endM] = manualEnd.split(':').map(Number);
      const totalMinutes = (endH * 60 + endM) - (startH * 60 + startM) - Number(breakMinutes || 0);
      const totalHours = Math.max(0, totalMinutes / 60);
      const overtimeHours = Math.max(0, totalHours - OVERTIME_THRESHOLD);

      const { error } = await supabase.from('time_entries').insert({
        team_member_id: selectedMember,
        entry_date: dateStr,
        manual_start: manualStart,
        manual_end: manualEnd,
        break_minutes: Number(breakMinutes || 0),
        total_hours: Math.round(totalHours * 100) / 100,
        overtime_hours: Math.round(overtimeHours * 100) / 100,
        hourly_rate: member.hourly_rate,
        overtime_rate: member.overtime_rate,
        job_id: selectedJob || null,
        notes: notes || null,
        entry_type: 'manual',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries', dateStr] });
      toast.success('Time entry added');
      resetForm();
      setDialogOpen(false);
    },
    onError: (err: any) => toast.error(err.message),
  });

  // Clock in
  const clockIn = useMutation({
    mutationFn: async (memberId: string) => {
      const member = members.find(m => m.id === memberId);
      if (!member) throw new Error('Member not found');
      const { error } = await supabase.from('time_entries').insert({
        team_member_id: memberId,
        entry_date: dateStr,
        clock_in: new Date().toISOString(),
        hourly_rate: member.hourly_rate,
        overtime_rate: member.overtime_rate,
        entry_type: 'clock',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries', dateStr] });
      toast.success('Clocked in');
    },
    onError: (err: any) => toast.error(err.message),
  });

  // Clock out
  const clockOut = useMutation({
    mutationFn: async (entryId: string) => {
      const entry = entries.find(e => e.id === entryId);
      if (!entry?.clock_in) throw new Error('No clock-in found');
      const clockInTime = new Date(entry.clock_in);
      const clockOutTime = new Date();
      const totalHours = Math.max(0, (clockOutTime.getTime() - clockInTime.getTime()) / 3600000 - (entry.break_minutes || 0) / 60);
      const overtimeHours = Math.max(0, totalHours - OVERTIME_THRESHOLD);
      
      const { error } = await supabase.from('time_entries').update({
        clock_out: clockOutTime.toISOString(),
        total_hours: Math.round(totalHours * 100) / 100,
        overtime_hours: Math.round(overtimeHours * 100) / 100,
      }).eq('id', entryId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries', dateStr] });
      toast.success('Clocked out');
    },
    onError: (err: any) => toast.error(err.message),
  });

  // Approve / reject
  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('time_entries').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries', dateStr] });
      toast.success('Status updated');
    },
  });

  // Delete entry
  const deleteEntry = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('time_entries').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries', dateStr] });
      toast.success('Entry deleted');
    },
  });

  const resetForm = () => {
    setSelectedMember('');
    setSelectedJob('');
    setManualStart('08:00');
    setManualEnd('17:00');
    setBreakMinutes('30');
    setNotes('');
    setEntryType('manual');
  };

  // Summary calculations
  const totalHoursToday = entries.reduce((sum, e) => sum + (e.total_hours || 0), 0);
  const totalOvertimeToday = entries.reduce((sum, e) => sum + (e.overtime_hours || 0), 0);
  const totalRegular = totalHoursToday - totalOvertimeToday;
  const totalLabourCost = entries.reduce((sum, e) => {
    const regular = (e.total_hours || 0) - (e.overtime_hours || 0);
    const ot = e.overtime_hours || 0;
    return sum + regular * (e.hourly_rate || 0) + ot * (e.overtime_rate || e.hourly_rate || 0);
  }, 0);

  // Active clocks (clocked in but not out)
  const activeClocks = entries.filter(e => e.entry_type === 'clock' && e.clock_in && !e.clock_out);

  const getMemberName = (m: any) => `${m.first_name || ''} ${m.last_name || ''}`.trim();

  // Members who are already clocked in (no clock out yet)
  const clockedInMemberIds = new Set(activeClocks.map(e => e.team_member_id));

  return (
    <AdminLayout
      title="Timesheets"
    >
      {/* Date Nav + Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setSelectedDate(d => subDays(d, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="min-w-[200px]">
                <CalendarIcon className="h-4 w-4 mr-2" />
                {format(selectedDate, 'MMM d, yyyy')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(d) => d && setSelectedDate(d)}
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          <Button variant="outline" size="icon" onClick={() => setSelectedDate(d => addDays(d, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSelectedDate(new Date())}>
            Today
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Clock In */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Play className="h-4 w-4 mr-1" /> Clock In
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56" align="end">
              <div className="space-y-1">
                <p className="text-sm font-medium mb-2">Select crew member:</p>
                {members.filter(m => !clockedInMemberIds.has(m.id)).map(m => (
                  <Button
                    key={m.id}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => clockIn.mutate(m.id)}
                  >
                    {getMemberName(m)}
                  </Button>
                ))}
                {members.filter(m => !clockedInMemberIds.has(m.id)).length === 0 && (
                  <p className="text-xs text-muted-foreground">All members clocked in</p>
                )}
              </div>
            </PopoverContent>
          </Popover>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" /> Add Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
              <DialogHeader>
                <DialogTitle>Add Time Entry</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Crew Member</Label>
                  <Select value={selectedMember} onValueChange={setSelectedMember}>
                    <SelectTrigger><SelectValue placeholder="Select member" /></SelectTrigger>
                    <SelectContent>
                      {members.map(m => (
                        <SelectItem key={m.id} value={m.id}>
                          {getMemberName(m)} ({m.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Start Time</Label>
                    <Input type="time" value={manualStart} onChange={e => setManualStart(e.target.value)} />
                  </div>
                  <div>
                    <Label>End Time</Label>
                    <Input type="time" value={manualEnd} onChange={e => setManualEnd(e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label>Break (minutes)</Label>
                  <Input type="number" value={breakMinutes} onChange={e => setBreakMinutes(e.target.value)} min="0" />
                </div>
                <div>
                  <Label>Link to Job (optional)</Label>
                  <Select value={selectedJob} onValueChange={setSelectedJob}>
                    <SelectTrigger><SelectValue placeholder="No job linked" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {activeJobs.map((j: any) => (
                        <SelectItem key={j.id} value={j.id}>
                          {j.job_number} — {j.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Notes</Label>
                  <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Optional notes..." />
                </div>
                <Button className="w-full" onClick={() => addEntry.mutate()} disabled={!selectedMember || addEntry.isPending}>
                  {addEntry.isPending ? 'Adding...' : 'Add Entry'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-xs text-muted-foreground">Entries</p>
            <p className="text-2xl font-bold">{entries.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-xs text-muted-foreground">Regular Hours</p>
            <p className="text-2xl font-bold">{totalRegular.toFixed(1)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-xs text-muted-foreground">Overtime</p>
            <p className="text-2xl font-bold text-destructive">{totalOvertimeToday.toFixed(1)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-xs text-muted-foreground">Est. Labor Cost</p>
            <p className="text-2xl font-bold">${totalLabourCost.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Clocks */}
      {activeClocks.length > 0 && (
        <Card className="mb-6 border-green-500/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              Currently Clocked In
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {activeClocks.map(e => (
                <div key={e.id} className="flex items-center gap-2 bg-green-500/10 rounded-lg px-3 py-2">
                  <span className="text-sm font-medium">{getMemberName(e.team_member)}</span>
                  <span className="text-xs text-muted-foreground">
                    since {format(new Date(e.clock_in), 'h:mm a')}
                  </span>
                  <Button variant="destructive" size="sm" onClick={() => clockOut.mutate(e.id)}>
                    <Square className="h-3 w-3 mr-1" /> Out
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Entries Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Time Entries — {format(selectedDate, 'MMM d')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground text-sm py-8 text-center">Loading...</p>
          ) : entries.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">No time entries for this date</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Crew Member</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Break</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>OT</TableHead>
                  <TableHead>Job</TableHead>
                  <TableHead>Est. Pay</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map(entry => {
                  const regular = (entry.total_hours || 0) - (entry.overtime_hours || 0);
                  const ot = entry.overtime_hours || 0;
                  const pay = regular * (entry.hourly_rate || 0) + ot * (entry.overtime_rate || entry.hourly_rate || 0);
                  const timeDisplay = entry.entry_type === 'clock'
                    ? `${entry.clock_in ? format(new Date(entry.clock_in), 'h:mm a') : '—'} – ${entry.clock_out ? format(new Date(entry.clock_out), 'h:mm a') : 'active'}`
                    : `${entry.manual_start?.slice(0, 5) || '—'} – ${entry.manual_end?.slice(0, 5) || '—'}`;
                    
                  return (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">
                        {getMemberName(entry.team_member)}
                        <span className="block text-xs text-muted-foreground">{entry.team_member?.role}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={entry.entry_type === 'clock' ? 'default' : 'secondary'} className="text-xs">
                          {entry.entry_type === 'clock' ? 'Clock' : 'Manual'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{timeDisplay}</TableCell>
                      <TableCell className="text-sm">{entry.break_minutes || 0}m</TableCell>
                      <TableCell className="font-medium">{entry.total_hours?.toFixed(1) ?? '—'}</TableCell>
                      <TableCell>
                        {ot > 0 ? <span className="text-destructive font-medium">{ot.toFixed(1)}</span> : '—'}
                      </TableCell>
                      <TableCell className="text-xs">
                        {entry.job ? (
                          <span className="font-mono">{entry.job.job_number}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">${pay.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={
                          entry.status === 'approved' ? 'default' : 
                          entry.status === 'rejected' ? 'destructive' : 'secondary'
                        } className="text-xs">
                          {entry.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {entry.status === 'pending' && (
                            <>
                              <Button
                                variant="ghost" size="icon" className="h-7 w-7"
                                onClick={() => updateStatus.mutate({ id: entry.id, status: 'approved' })}
                              >
                                <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                              </Button>
                              <Button
                                variant="ghost" size="icon" className="h-7 w-7"
                                onClick={() => updateStatus.mutate({ id: entry.id, status: 'rejected' })}
                              >
                                <X className="h-3.5 w-3.5 text-destructive" />
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost" size="icon" className="h-7 w-7"
                            onClick={() => deleteEntry.mutate(entry.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
