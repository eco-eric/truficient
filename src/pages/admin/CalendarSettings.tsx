import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, Calendar, CheckCircle2, Star, Users, Briefcase } from "lucide-react";
import { toast } from "sonner";

interface GoogleCalendar {
  id: string;
  calendar_id: string;
  name: string;
  description: string | null;
  color: string;
  is_primary: boolean;
  is_active: boolean;
  linked_job_type_id: string | null;
  linked_team_id: string | null;
  last_synced_at: string | null;
}

export default function CalendarSettings() {
  const [syncing, setSyncing] = useState(false);
  const queryClient = useQueryClient();

  const { data: calendars, isLoading } = useQuery({
    queryKey: ["google-calendars"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("google_calendars")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as GoogleCalendar[];
    },
  });

  const { data: jobTypes } = useQuery({
    queryKey: ["job-types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crm_job_types")
        .select("id, name")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: teams } = useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crm_teams")
        .select("id, name")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const syncMutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await supabase.functions.invoke("google-calendar-sync", {
        body: { action: "sync-calendars" },
      });

      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["google-calendars"] });
      toast.success(`Synced ${data.calendars?.length || 0} calendars from Google`);
    },
    onError: (error: Error) => {
      toast.error(`Sync failed: ${error.message}`);
    },
  });

  const updateCalendarMutation = useMutation({
    mutationFn: async (updates: Partial<GoogleCalendar> & { id: string }) => {
      const { id, ...data } = updates;
      
      // If setting as primary, unset other primaries first
      if (data.is_primary) {
        await supabase
          .from("google_calendars")
          .update({ is_primary: false })
          .neq("id", id);
      }

      const { error } = await supabase
        .from("google_calendars")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["google-calendars"] });
      toast.success("Calendar updated");
    },
    onError: (error: Error) => {
      toast.error(`Update failed: ${error.message}`);
    },
  });

  const handleSync = async () => {
    setSyncing(true);
    try {
      await syncMutation.mutateAsync();
    } finally {
      setSyncing(false);
    }
  };

  return (
    <AdminLayout title="Calendar Settings">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Calendar Settings</h1>
            <p className="text-muted-foreground">
              Manage Google Calendars synced with your CRM
            </p>
          </div>
          <Button onClick={handleSync} disabled={syncing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing..." : "Sync Calendars"}
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !calendars?.length ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Calendars Found</h3>
              <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                Share your Google Calendars with the service account email, then click
                "Sync Calendars" to import them.
              </p>
              <div className="bg-muted rounded-lg p-3 max-w-lg mx-auto">
                <code className="text-sm break-all">
                  truficient-admin-sync@truficient-estimator-465520.iam.gserviceaccount.com
                </code>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {calendars.map((calendar) => (
              <Card key={calendar.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: calendar.color }}
                      />
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {calendar.name}
                          {calendar.is_primary && (
                            <Badge variant="default" className="text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              Primary
                            </Badge>
                          )}
                        </CardTitle>
                        {calendar.description && (
                          <CardDescription>{calendar.description}</CardDescription>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Active</span>
                      <Switch
                        checked={calendar.is_active}
                        onCheckedChange={(checked) =>
                          updateCalendarMutation.mutate({
                            id: calendar.id,
                            is_active: checked,
                          })
                        }
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">
                        Set as Primary
                      </label>
                      <Button
                        variant={calendar.is_primary ? "default" : "outline"}
                        size="sm"
                        onClick={() =>
                          updateCalendarMutation.mutate({
                            id: calendar.id,
                            is_primary: !calendar.is_primary,
                          })
                        }
                      >
                        {calendar.is_primary ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Primary Calendar
                          </>
                        ) : (
                          "Make Primary"
                        )}
                      </Button>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-1.5 flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        Link to Job Type
                      </label>
                      <Select
                        value={calendar.linked_job_type_id || "none"}
                        onValueChange={(value) =>
                          updateCalendarMutation.mutate({
                            id: calendar.id,
                            linked_job_type_id: value === "none" ? null : value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select job type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {jobTypes?.map((jt) => (
                            <SelectItem key={jt.id} value={jt.id}>
                              {jt.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-1.5 flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        Link to Team
                      </label>
                      <Select
                        value={calendar.linked_team_id || "none"}
                        onValueChange={(value) =>
                          updateCalendarMutation.mutate({
                            id: calendar.id,
                            linked_team_id: value === "none" ? null : value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select team" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {teams?.map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {calendar.last_synced_at && (
                    <p className="text-xs text-muted-foreground">
                      Last synced:{" "}
                      {new Date(calendar.last_synced_at).toLocaleString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
