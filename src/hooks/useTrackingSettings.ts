import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TrackingSetting {
  id: string;
  setting_key: string;
  setting_value: string | null;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export const useTrackingSettings = () => {
  return useQuery({
    queryKey: ['tracking-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tracking_settings')
        .select('*');
      
      if (error) throw error;
      return data as TrackingSetting[];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

export const getTrackingSetting = (
  settings: TrackingSetting[] | undefined,
  key: string
): TrackingSetting | undefined => {
  return settings?.find(s => s.setting_key === key);
};
