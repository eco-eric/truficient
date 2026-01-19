import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type FormSourceType = 'ducted' | 'ductless' | 'contact' | 'scanner' | 'landing_page';

interface FormSourceTag {
  id: string;
  source_type: FormSourceType;
  tag_id: string;
  tag_value: string;
  tag_name: string;
}

// Default tags for each source type (fallback if none configured)
const DEFAULT_TAGS: Record<FormSourceType, string[]> = {
  ducted: ['ducted-estimator'],
  ductless: ['ductless-estimator'],
  contact: ['website-lead'],
  scanner: ['equipment-scanner'],
  landing_page: ['landing-page-lead'],
};

export function useFormSourceTags(sourceType: FormSourceType) {
  return useQuery({
    queryKey: ['form-source-tags', sourceType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('form_source_tags')
        .select(`
          id,
          source_type,
          tag_id,
          ghl_tags!inner (
            tag_value,
            name,
            is_active
          )
        `)
        .eq('source_type', sourceType);

      if (error) {
        console.error('Error fetching form source tags:', error);
        return DEFAULT_TAGS[sourceType];
      }

      if (!data || data.length === 0) {
        return DEFAULT_TAGS[sourceType];
      }

      // Filter to only active tags and return tag values
      const activeTags = data
        .filter((item: any) => item.ghl_tags?.is_active)
        .map((item: any) => item.ghl_tags?.tag_value)
        .filter(Boolean);

      return activeTags.length > 0 ? activeTags : DEFAULT_TAGS[sourceType];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

// Hook to get all form source tags for admin management
export function useAllFormSourceTags() {
  return useQuery({
    queryKey: ['form-source-tags-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('form_source_tags')
        .select(`
          id,
          source_type,
          tag_id,
          ghl_tags!inner (
            id,
            tag_value,
            name,
            color,
            is_active
          )
        `)
        .order('source_type');

      if (error) {
        console.error('Error fetching all form source tags:', error);
        throw error;
      }

      // Group by source type
      const grouped: Record<FormSourceType, FormSourceTag[]> = {
        ducted: [],
        ductless: [],
        contact: [],
        scanner: [],
        landing_page: [],
      };

      data?.forEach((item: any) => {
        if (item.ghl_tags) {
          grouped[item.source_type as FormSourceType]?.push({
            id: item.id,
            source_type: item.source_type,
            tag_id: item.tag_id,
            tag_value: item.ghl_tags.tag_value,
            tag_name: item.ghl_tags.name,
          });
        }
      });

      return grouped;
    },
  });
}
