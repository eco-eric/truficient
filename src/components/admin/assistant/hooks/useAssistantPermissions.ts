import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";

export interface AssistantPermissions {
  canAccess: boolean;
  canWrite: boolean;
  canCalendar: boolean;
  canVoice: boolean;
  canBriefing: boolean;
  canFinancials: boolean;
  maxMessagesPerHour: number;
  isLoading: boolean;
  role: string | null;
}

export function useAssistantPermissions(): AssistantPermissions {
  const { role, loading: roleLoading } = useUserRole();
  const [permissions, setPermissions] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (roleLoading || !role) return;

    const fetchPermissions = async () => {
      const { data } = await supabase
        .from("assistant_role_permissions" as any)
        .select("*")
        .eq("role_name", role)
        .single();

      setPermissions(data);
      setIsLoading(false);
    };

    fetchPermissions();
  }, [role, roleLoading]);

  return {
    canAccess: permissions?.can_access_assistant ?? (role === "super_admin" || role === "admin"),
    canWrite: permissions?.can_use_write_tools ?? false,
    canCalendar: permissions?.can_use_calendar_tools ?? false,
    canVoice: permissions?.can_use_voice_input ?? true,
    canBriefing: permissions?.can_view_briefing ?? false,
    canFinancials: permissions?.can_view_financials ?? false,
    maxMessagesPerHour: permissions?.max_messages_per_hour ?? 30,
    isLoading: isLoading || roleLoading,
    role: role as string | null,
  };
}
