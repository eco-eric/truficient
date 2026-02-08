import { useMemo } from "react";
import { format, startOfWeek, addDays, isSameDay, isToday, parseISO, differenceInMinutes, startOfDay } from "date-fns";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: "job" | "google";
  color: string;
  data: any;
}

interface CalendarViewProps {
  events: CalendarEvent[];
  currentDate: Date;
  viewMode: "day" | "week" | "month";
  onDateChange: (date: Date) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const HOUR_HEIGHT = 60; // pixels per hour

export default function CalendarView({ events, currentDate, viewMode, onDateChange }: CalendarViewProps) {
  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 0 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [currentDate]);

  const getEventsForDay = (date: Date) => {
    return events.filter(event => isSameDay(event.start, date));
  };

  const getEventStyle = (event: CalendarEvent) => {
    const startMinutes = event.start.getHours() * 60 + event.start.getMinutes();
    const endMinutes = event.end.getHours() * 60 + event.end.getMinutes();
    const duration = Math.max(endMinutes - startMinutes, 30); // minimum 30 min
    
    return {
      top: `${(startMinutes / 60) * HOUR_HEIGHT}px`,
      height: `${(duration / 60) * HOUR_HEIGHT}px`,
      backgroundColor: event.color,
    };
  };

  if (viewMode === "month") {
    return <MonthView events={events} currentDate={currentDate} onDateChange={onDateChange} />;
  }

  const daysToShow = viewMode === "day" ? [currentDate] : weekDays;

  return (
    <Card className="overflow-hidden">
      {/* Header with day names */}
      <div className="grid border-b" style={{ gridTemplateColumns: `60px repeat(${daysToShow.length}, 1fr)` }}>
        <div className="border-r p-2 text-xs text-muted-foreground text-center">Time</div>
        {daysToShow.map(day => (
          <div 
            key={day.toISOString()} 
            className={cn(
              "p-2 text-center border-r last:border-r-0",
              isToday(day) && "bg-primary/5"
            )}
          >
            <div className="text-xs text-muted-foreground uppercase">
              {format(day, "EEE")}
            </div>
            <div className={cn(
              "text-lg font-semibold",
              isToday(day) && "text-primary"
            )}>
              {format(day, "d")}
            </div>
          </div>
        ))}
      </div>

      {/* Time grid */}
      <ScrollArea className="h-[600px]">
        <div className="grid relative" style={{ gridTemplateColumns: `60px repeat(${daysToShow.length}, 1fr)` }}>
          {/* Time labels */}
          <div className="border-r">
            {HOURS.map(hour => (
              <div 
                key={hour} 
                className="border-b text-xs text-muted-foreground text-right pr-2 flex items-start justify-end"
                style={{ height: HOUR_HEIGHT }}
              >
                {hour === 0 ? "" : format(new Date().setHours(hour, 0), "h a")}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {daysToShow.map(day => (
            <div key={day.toISOString()} className="relative border-r last:border-r-0">
              {/* Hour lines */}
              {HOURS.map(hour => (
                <div 
                  key={hour} 
                  className="border-b"
                  style={{ height: HOUR_HEIGHT }}
                />
              ))}

              {/* Events */}
              <div className="absolute inset-0 px-1">
                {getEventsForDay(day).map(event => (
                  <EventBlock key={event.id} event={event} style={getEventStyle(event)} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}

function EventBlock({ event, style }: { event: CalendarEvent; style: React.CSSProperties }) {
  const content = (
    <div
      className="absolute left-1 right-1 rounded px-1.5 py-0.5 text-white text-xs overflow-hidden cursor-pointer hover:opacity-90 transition-opacity shadow-sm"
      style={style}
    >
      <div className="font-medium truncate">{event.title}</div>
      <div className="text-white/80 truncate">
        {format(event.start, "h:mm a")} - {format(event.end, "h:mm a")}
      </div>
    </div>
  );

  if (event.type === "job") {
    const jobId = event.data?.job?.id || event.data?.job_id || event.data?.jobId;
    if (jobId) {
      return <Link to={`/admin/jobs/${jobId}`}>{content}</Link>;
    }
  }

  return content;
}

function MonthView({ events, currentDate, onDateChange }: { 
  events: CalendarEvent[]; 
  currentDate: Date;
  onDateChange: (date: Date) => void;
}) {
  const weeks = useMemo(() => {
    const start = startOfWeek(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1), { weekStartsOn: 0 });
    const result: Date[][] = [];
    let current = start;
    
    for (let w = 0; w < 6; w++) {
      const week: Date[] = [];
      for (let d = 0; d < 7; d++) {
        week.push(current);
        current = addDays(current, 1);
      }
      result.push(week);
    }
    return result;
  }, [currentDate]);

  const getEventsForDay = (date: Date) => {
    return events.filter(event => isSameDay(event.start, date));
  };

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-7 border-b">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
          <div key={day} className="p-2 text-center text-xs font-medium text-muted-foreground uppercase border-r last:border-r-0">
            {day}
          </div>
        ))}
      </div>

      {/* Weeks */}
      {weeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7 border-b last:border-b-0">
          {week.map(day => {
            const dayEvents = getEventsForDay(day);
            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
            
            return (
              <div 
                key={day.toISOString()} 
                className={cn(
                  "min-h-[100px] p-1 border-r last:border-r-0",
                  !isCurrentMonth && "bg-muted/30",
                  isToday(day) && "bg-primary/5"
                )}
              >
                <div 
                  className={cn(
                    "text-sm font-medium mb-1 cursor-pointer hover:text-primary",
                    !isCurrentMonth && "text-muted-foreground",
                    isToday(day) && "text-primary"
                  )}
                  onClick={() => onDateChange(day)}
                >
                  {format(day, "d")}
                </div>
                <div className="space-y-0.5">
                  {dayEvents.slice(0, 3).map(event => (
                    <div
                      key={event.id}
                      className="text-xs px-1 py-0.5 rounded truncate text-white"
                      style={{ backgroundColor: event.color }}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-muted-foreground px-1">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </Card>
  );
}
