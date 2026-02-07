import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, RefreshCw, Settings } from "lucide-react";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays, addWeeks, addMonths, subWeeks, subMonths, isSameDay, parseISO, isWithinInterval } from "date-fns";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import CalendarView from "@/components/admin/calendar/CalendarView";

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
  const [selectedCalendarId, setSelectedCalendarId] = useState<string>("all");
  const [refreshing, setRefreshing] = useState(false);

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

  // Fetch jobs from database
  const { data: jobs } = useQuery({
    queryKey: ["calendar-jobs", currentDate, viewMode],
    queryFn: async () => {
      const { start, end } = getDateRange();
      const { data, error } = await supabase
        .from("crm_jobs")
        .select(`
          *,
          customer:crm_customers(first_name, last_name, company_name),
          job_type:crm_job_types(name, color),
          location:crm_locations(address_line1, city)
        `)
        .gte("scheduled_start", start.toISOString())
        .lte("scheduled_start", end.toISOString())
        .is("deleted_at", null)
        .order("scheduled_start");
      if (error) throw error;
      return data;
    },
  });

  // Fetch Google Calendar events
  const { data: googleEvents, refetch: refetchEvents } = useQuery({
    queryKey: ["google-calendar-events", currentDate, viewMode, selectedCalendarId, calendars],
    queryFn: async () => {
      if (!calendars?.length) return [];
      
      const { start, end } = getDateRange();
      const calendarIds = selectedCalendarId === "all" 
        ? calendars.map(c => c.calendar_id)
        : [calendars.find(c => c.id === selectedCalendarId)?.calendar_id].filter(Boolean);

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
    enabled: !!calendars?.length,
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
    const amount = viewMode === "day" ? 1 : 1;
    
    if (viewMode === "day") {
      setCurrentDate(d => addDays(d, direction === "prev" ? -1 : 1));
    } else {
      setCurrentDate(d => fn(d, amount));
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

  // Combine jobs and Google events for calendar view
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

    // Add jobs
    jobs?.forEach(job => {
      if (job.scheduled_start) {
        events.push({
          id: job.id,
          title: `${job.job_number} - ${job.customer?.first_name || job.customer?.company_name || "Unknown"}`,
          start: new Date(job.scheduled_start),
          end: job.scheduled_end ? new Date(job.scheduled_end) : addDays(new Date(job.scheduled_start), 0.25),
          type: "job",
          color: job.job_type?.color || "#3b82f6",
          data: job,
        });
      }
    });

    // Add Google events (that aren't already jobs)
    googleEvents?.forEach((event: CalendarEvent) => {
      const eventStart = event.start.dateTime || event.start.date;
      const eventEnd = event.end.dateTime || event.end.date;
      if (eventStart) {
        // Skip if this is a job we already have
        const isJobEvent = jobs?.some(j => j.google_calendar_event_id === event.id);
        if (!isJobEvent) {
          const calendar = calendars?.find(c => c.calendar_id === event.calendarId);
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
    });

    return events.sort((a, b) => a.start.getTime() - b.start.getTime());
  }, [jobs, googleEvents, calendars]);

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
                <Select value={selectedCalendarId} onValueChange={setSelectedCalendarId}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Calendars" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Calendars</SelectItem>
                    {calendars?.map(cal => (
                      <SelectItem key={cal.id} value={cal.id}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: cal.color }}
                          />
                          {cal.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

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

        {/* Legend */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-muted-foreground">CRM Jobs</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-gray-400" />
            <span className="text-muted-foreground">Google Events</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <CalendarView 
          events={combinedEvents}
          currentDate={currentDate}
          viewMode={viewMode}
          onDateChange={setCurrentDate}
        />
      </div>
    </AdminLayout>
  );
}
