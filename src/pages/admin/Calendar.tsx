import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, RefreshCw, Settings, Share } from "lucide-react";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays, addWeeks, addMonths, subWeeks, subMonths, parseISO } from "date-fns";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import CalendarView from "@/components/admin/calendar/CalendarView";
import CalendarFilterSidebar from "@/components/admin/calendar/CalendarFilterSidebar";
import { useIsMobile } from "@/hooks/use-mobile";

type ViewMode = "week" | "month" | "day";

interface CalendarEvent {
  id: string;
  summary: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  calendarId: string;
  description?: string;
  location?: string;
}

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [refreshing, setRefreshing] = useState(false);
  const isMobile = useIsMobile();

  // Multi-calendar filter state
  const [showCrmJobs, setShowCrmJobs] = useState(true);
  const [visibleCalendarIds, setVisibleCalendarIds] = useState<Set<string>>(new Set());

  // Fetch synced calendars
  const { data: calendars } = useQuery({
    queryKey: ["google-calendars"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("google_calendars")
        .select("*")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  // Initialize visible calendars when data loads
  useEffect(() => {
    if (calendars?.length && visibleCalendarIds.size === 0) {
      setVisibleCalendarIds(new Set(calendars.map(c => c.id)));
    }
  }, [calendars, visibleCalendarIds.size]);

  // Fetch job appointments from database
  const { data: appointments } = useQuery({
    queryKey: ["calendar-appointments", currentDate, viewMode],
    queryFn: async () => {
      const { start, end } = getDateRange();
      const { data, error } = await supabase
        .from("crm_job_appointments")
        .select(`
          *,
          job:crm_jobs(id, job_number, title),
          team:crm_teams(id, name, color),
          calendar:google_calendars(id, name, color, calendar_id)
        `)
        .gte("start_datetime", start.toISOString())
        .lte("start_datetime", end.toISOString())
        .order("start_datetime");
      if (error) throw error;
      return data;
    },
  });

  // Fetch Google Calendar events only from visible calendars
  const { data: googleEvents, refetch: refetchEvents } = useQuery({
    queryKey: ["google-calendar-events", currentDate, viewMode, Array.from(visibleCalendarIds), calendars],
    queryFn: async () => {
      if (!calendars?.length || visibleCalendarIds.size === 0) return [];
      
      const { start, end } = getDateRange();
      const calendarIds = calendars
        .filter(c => visibleCalendarIds.has(c.id))
        .map(c => c.calendar_id);

      if (!calendarIds.length) return [];

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];

      const response = await supabase.functions.invoke("google-calendar-sync", {
        body: {
          action: "get-all-events",
          calendarIds,
          timeMin: start.toISOString(),
          timeMax: end.toISOString(),
        },
      });

      if (response.error) {
        console.error("Failed to fetch events:", response.error);
        return [];
      }

      return response.data?.items || [];
    },
    enabled: !!calendars?.length && visibleCalendarIds.size > 0,
  });

  function getDateRange() {
    let start: Date, end: Date;
    switch (viewMode) {
      case "day":
        start = new Date(currentDate);
        start.setHours(0, 0, 0, 0);
        end = new Date(currentDate);
        end.setHours(23, 59, 59, 999);
        break;
      case "week":
        start = startOfWeek(currentDate, { weekStartsOn: 0 });
        end = endOfWeek(currentDate, { weekStartsOn: 0 });
        break;
      case "month":
        start = startOfMonth(currentDate);
        end = endOfMonth(currentDate);
        break;
    }
    return { start, end };
  }

  const navigate = (direction: "prev" | "next") => {
    const fn = direction === "prev" 
      ? viewMode === "month" ? subMonths : subWeeks
      : viewMode === "month" ? addMonths : addWeeks;
    
    if (viewMode === "day") {
      setCurrentDate(d => addDays(d, direction === "prev" ? -1 : 1));
    } else {
      setCurrentDate(d => fn(d, 1));
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetchEvents();
      toast.success("Calendar refreshed");
    } catch (err) {
      toast.error("Failed to refresh");
    } finally {
      setRefreshing(false);
    }
  };

  const getTitle = () => {
    switch (viewMode) {
      case "day":
        return format(currentDate, "EEEE, MMMM d, yyyy");
      case "week":
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
        return `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`;
      case "month":
        return format(currentDate, "MMMM yyyy");
    }
  };

  // Combine and filter events based on visibility settings
  const combinedEvents = useMemo(() => {
    const events: Array<{
      id: string;
      title: string;
      start: Date;
      end: Date;
      type: "job" | "google";
      color: string;
      data: any;
    }> = [];

    // Add job appointments only if CRM Jobs toggle is on
    if (showCrmJobs) {
      appointments?.forEach((apt: any) => {
        if (apt.start_datetime) {
          const start = new Date(apt.start_datetime);
          const end = apt.end_datetime ? new Date(apt.end_datetime) : addDays(start, 0.25);
          const jobNumber = apt.job?.job_number || "Job";
          const title = apt.title || apt.job?.title || "Appointment";

          events.push({
            id: apt.id,
            title: `${jobNumber} - ${title}`,
            start,
            end,
            type: "job",
            color: apt.team?.color || apt.calendar?.color || "#3b82f6",
            data: apt,
          });
        }
      });
    }

    // Add Google events only from visible calendars
    googleEvents?.forEach((event: CalendarEvent) => {
      const eventStart = event.start.dateTime || event.start.date;
      const eventEnd = event.end.dateTime || event.end.date;
      if (eventStart) {
        const isSyncedAppointment = appointments?.some(
          (a: any) => a.google_calendar_event_id === event.id
        );
        if (!isSyncedAppointment) {
          const calendar = calendars?.find((c) => c.calendar_id === event.calendarId);
          // Only include if calendar is in visible set
          if (calendar && visibleCalendarIds.has(calendar.id)) {
            events.push({
              id: event.id,
              title: event.summary || "Untitled",
              start: parseISO(eventStart),
              end: eventEnd ? parseISO(eventEnd) : addDays(parseISO(eventStart), 0.25),
              type: "google",
              color: calendar?.color || "#9ca3af",
              data: event,
            });
          }
        }
      }
    });

    return events.sort((a, b) => a.start.getTime() - b.start.getTime());
  }, [appointments, googleEvents, calendars, showCrmJobs, visibleCalendarIds]);

  return (
    <AdminLayout title="Calendar">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CalendarIcon className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Calendar</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/admin/calendar`);
                toast.success("Calendar link copied!");
              }}
            >
              <Share className="h-4 w-4 mr-1" />
              Copy Link
            </Button>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Link to="/admin/calendars">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-1" />
                Settings
              </Button>
            </Link>
          </div>
        </div>

        {/* Controls */}
        <Card>
          <CardContent className="py-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => navigate("prev")}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={() => setCurrentDate(new Date())}>
                  Today
                </Button>
                <Button variant="outline" size="icon" onClick={() => navigate("next")}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <span className="text-lg font-medium ml-2">{getTitle()}</span>
              </div>

              <div className="flex items-center gap-2">
                {/* Mobile filter button */}
                {isMobile && (
                  <CalendarFilterSidebar
                    calendars={calendars || []}
                    showCrmJobs={showCrmJobs}
                    onShowCrmJobsChange={setShowCrmJobs}
                    visibleCalendarIds={visibleCalendarIds}
                    onVisibleCalendarsChange={setVisibleCalendarIds}
                  />
                )}

                <div className="flex border rounded-md">
                  {(["day", "week", "month"] as ViewMode[]).map(mode => (
                    <Button
                      key={mode}
                      variant={viewMode === mode ? "default" : "ghost"}
                      size="sm"
                      className="rounded-none first:rounded-l-md last:rounded-r-md"
                      onClick={() => setViewMode(mode)}
                    >
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main content with sidebar */}
        <div className="flex gap-4">
          {/* Desktop sidebar */}
          {!isMobile && (
            <CalendarFilterSidebar
              calendars={calendars || []}
              showCrmJobs={showCrmJobs}
              onShowCrmJobsChange={setShowCrmJobs}
              visibleCalendarIds={visibleCalendarIds}
              onVisibleCalendarsChange={setVisibleCalendarIds}
            />
          )}

          {/* Calendar Grid */}
          <div className="flex-1 min-w-0">
            <CalendarView 
              events={combinedEvents}
              currentDate={currentDate}
              viewMode={viewMode}
              onDateChange={setCurrentDate}
            />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}