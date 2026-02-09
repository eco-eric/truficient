import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MultiSelect } from '@/components/ui/multi-select';
import { Calendar, RefreshCw, CheckCircle2, Users, MapPin } from 'lucide-react';
import { format, addHours } from 'date-fns';
import { toast } from 'sonner';

interface JobAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  jobNumber: string;
  jobTitle: string;
  customerName: string;
  customerPhone?: string | null;
  location?: string | null;
  appointment?: {
    id: string;
    title: string | null;
    start_datetime: string;
    end_datetime: string;
    google_calendar_id: string | null;
    google_calendar_event_id: string | null;
    assigned_team_id: string | null;
    notes: string | null;
    attendee_member_ids?: string[] | null;
  } | null;
}

export default function JobAppointmentDialog({
  open,
  onOpenChange,
  jobId,
  jobNumber,
  jobTitle,
  customerName,
  customerPhone,
  location,
  appointment
}: JobAppointmentDialogProps) {
  const queryClient = useQueryClient();
  const [syncing, setSyncing] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    startDate: '',
    startTime: '08:00',
    endDate: '',
    endTime: '17:00',
    calendarId: '',
    teamId: '',
    notes: '',
    attendeeIds: [] as string[],
    location: ''
  });

  // Fetch team members for attendee selection
  const { data: teamMembers = [] } = useQuery({
    queryKey: ['crm_team_members_active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_team_members')
        .select('id, first_name, last_name, email')
        .eq('is_active', true)
        .order('first_name');
      if (error) throw error;
      return data;
    }
  });

  // Reset form when appointment changes
  useEffect(() => {
    if (appointment) {
      const startDt = new Date(appointment.start_datetime);
      const endDt = new Date(appointment.end_datetime);
      setFormData({
        title: appointment.title || '',
        startDate: format(startDt, 'yyyy-MM-dd'),
        startTime: format(startDt, 'HH:mm'),
        endDate: format(endDt, 'yyyy-MM-dd'),
        endTime: format(endDt, 'HH:mm'),
        calendarId: appointment.google_calendar_id || '',
        teamId: appointment.assigned_team_id || '',
        notes: appointment.notes || '',
        attendeeIds: appointment.attendee_member_ids || [],
        location: ''
      });
    } else {
      // New appointment - auto-populate from job location
      setFormData({
        title: '',
        startDate: '',
        startTime: '08:00',
        endDate: '',
        endTime: '17:00',
        calendarId: '',
        teamId: '',
        notes: '',
        attendeeIds: [],
        location: location || ''
      });
    }
  }, [appointment, open, location]);

  const { data: calendars = [] } = useQuery({
    queryKey: ['google-calendars-active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('google_calendars')
        .select('*')
        .eq('is_active', true)
        .order('is_primary', { ascending: false })
        .order('name');
      if (error) throw error;
      return data;
    }
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['crm_teams_active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_teams')
        .select('*')
        .eq('is_active', true);
      if (error) throw error;
      return data;
    }
  });

  // Auto-select primary calendar
  useEffect(() => {
    if (!formData.calendarId && calendars.length > 0) {
      const primary = calendars.find((c: any) => c.is_primary);
      setFormData(prev => ({ ...prev, calendarId: primary?.id || calendars[0]?.id || '' }));
    }
  }, [calendars, formData.calendarId]);

  // Auto-set end date when start date changes
  useEffect(() => {
    if (formData.startDate && !formData.endDate) {
      setFormData(prev => ({ ...prev, endDate: formData.startDate }));
    }
  }, [formData.startDate]);

  const saveMutation = useMutation({
    mutationFn: async (syncToCalendar: boolean) => {
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);

      const appointmentData = {
        job_id: jobId,
        title: formData.title || null,
        start_datetime: startDateTime.toISOString(),
        end_datetime: endDateTime.toISOString(),
        google_calendar_id: formData.calendarId || null,
        assigned_team_id: formData.teamId || null,
        notes: formData.notes || null,
        attendee_member_ids: formData.attendeeIds
      };

      let savedAppointment;
      
      if (appointment?.id) {
        const { data, error } = await supabase
          .from('crm_job_appointments')
          .update(appointmentData)
          .eq('id', appointment.id)
          .select()
          .single();
        if (error) throw error;
        savedAppointment = data;
      } else {
        const { data, error } = await supabase
          .from('crm_job_appointments')
          .insert(appointmentData)
          .select()
          .single();
        if (error) throw error;
        savedAppointment = data;
      }

      // Sync to Google Calendar if requested
      if (syncToCalendar && formData.calendarId) {
        setSyncing(true);
        try {
          const calendar = calendars.find((c: any) => c.id === formData.calendarId);
          if (!calendar) throw new Error('Calendar not found');

          const description = [
            `Job Type: ${jobTitle}`,
            `Customer: ${customerName}`,
            customerPhone ? `Phone: ${customerPhone}` : null,
            formData.notes ? `\nNotes:\n${formData.notes}` : null,
          ].filter(Boolean).join('\n');

          // Get attendee emails for Google Calendar invites
          const attendees = formData.attendeeIds
            .map(id => teamMembers.find(m => m.id === id))
            .filter(m => m?.email)
            .map(m => ({ email: m!.email! }));

          const eventPayload = {
            summary: `${jobNumber} - ${customerName} - ${formData.title || jobTitle}`,
            description,
            location: formData.location || '',
            start: {
              dateTime: startDateTime.toISOString(),
              timeZone: 'America/Chicago',
            },
            end: {
              dateTime: endDateTime.toISOString(),
              timeZone: 'America/Chicago',
            },
            attendees: attendees.length > 0 ? attendees : undefined,
          };

          let response;
          if (appointment?.google_calendar_event_id) {
            response = await supabase.functions.invoke('google-calendar-sync', {
              body: {
                action: 'update-event',
                calendarId: calendar.calendar_id,
                eventId: appointment.google_calendar_event_id,
                event: eventPayload,
              },
            });
          } else {
            response = await supabase.functions.invoke('google-calendar-sync', {
              body: {
                action: 'create-event',
                calendarId: calendar.calendar_id,
                event: eventPayload,
              },
            });
          }

          if (response.error) throw response.error;

          // Update appointment with calendar event ID
          await supabase
            .from('crm_job_appointments')
            .update({ google_calendar_event_id: response.data.id })
            .eq('id', savedAppointment.id);

        } finally {
          setSyncing(false);
        }
      }

      return savedAppointment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm_job_appointments', jobId] });
      toast.success(appointment ? 'Appointment updated' : 'Appointment created');
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(`Failed to save: ${error.message}`);
    }
  });

  const handleSubmit = (e: React.FormEvent, syncToCalendar: boolean = false) => {
    e.preventDefault();
    if (!formData.startDate || !formData.endDate) {
      toast.error('Please select start and end dates');
      return;
    }
    saveMutation.mutate(syncToCalendar);
  };

  const selectedCalendar = calendars.find((c: any) => c.id === formData.calendarId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-lg"
        onInteractOutside={(e) => {
          const target = e.target as HTMLElement;
          if (target?.closest('[data-radix-popper-content-wrapper]')) {
            e.preventDefault();
          }
        }}
        onPointerDownOutside={(e) => {
          const target = e.target as HTMLElement;
          if (target?.closest('[data-radix-popper-content-wrapper]')) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>
            {appointment ? 'Edit Appointment' : 'Add Calendar Appointment'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label>Appointment Title</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Installation Day 1, Site Survey"
            />
          </div>

          {/* Start Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
              />
            </div>
          </div>

          {/* End Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>End Time</Label>
              <Input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location
            </Label>
            <div className="flex gap-2">
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Event location address"
                className="flex-1"
              />
              {location && formData.location !== location && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFormData({ ...formData, location: location })}
                >
                  Use Job Address
                </Button>
              )}
            </div>
            {location && (
              <p className="text-xs text-muted-foreground">
                Job address: {location}
              </p>
            )}
          </div>

          {/* Team Assignment */}
          <div className="space-y-2">
            <Label>Assign Team</Label>
            <Select
              value={formData.teamId}
              onValueChange={(v) => setFormData({ ...formData, teamId: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a team" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team: any) => (
                  <SelectItem key={team.id} value={team.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: team.color }}
                      />
                      {team.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Attendees Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Attendees (will receive calendar invites)
            </Label>
            <MultiSelect
              options={teamMembers.map(m => ({
                value: m.id,
                label: `${m.first_name} ${m.last_name || ''}`.trim() + (m.email ? ` (${m.email})` : ''),
              }))}
              selected={formData.attendeeIds}
              onChange={(ids) => setFormData({ ...formData, attendeeIds: ids })}
              placeholder="Select team members..."
            />
            {formData.attendeeIds.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {formData.attendeeIds.length} attendee(s) will be invited when synced
              </p>
            )}
          </div>

          {/* Calendar Selection */}
          <div className="space-y-2">
            <Label>Google Calendar</Label>
            <Select
              value={formData.calendarId}
              onValueChange={(v) => setFormData({ ...formData, calendarId: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select calendar" />
              </SelectTrigger>
              <SelectContent>
                {calendars.map((cal: any) => (
                  <SelectItem key={cal.id} value={cal.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: cal.color }}
                      />
                      {cal.name}
                      {cal.is_primary && <span className="text-xs text-muted-foreground">(Primary)</span>}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Appointment notes..."
              rows={2}
            />
          </div>

          {/* Sync status indicator */}
          {appointment?.google_calendar_event_id && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Synced to {selectedCalendar?.name || 'Google Calendar'}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="outline"
              disabled={saveMutation.isPending}
            >
              Save Only
            </Button>
            <Button 
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              disabled={saveMutation.isPending || syncing || !formData.calendarId}
            >
              {syncing ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Calendar className="h-4 w-4 mr-2" />
              )}
              Save & Sync
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
