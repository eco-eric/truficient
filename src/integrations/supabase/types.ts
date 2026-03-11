export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_costs: {
        Row: {
          amount: number
          cost_type: Database["public"]["Enums"]["admin_cost_type"]
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          is_required: boolean
          name: string
          updated_at: string
        }
        Insert: {
          amount?: number
          cost_type?: Database["public"]["Enums"]["admin_cost_type"]
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_required?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          amount?: number
          cost_type?: Database["public"]["Enums"]["admin_cost_type"]
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_required?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      admin_notification_preferences: {
        Row: {
          created_at: string
          general_enabled: boolean
          id: string
          job_enabled: boolean
          lead_enabled: boolean
          pipeline_enabled: boolean
          sound_enabled: boolean
          system_enabled: boolean
          team_enabled: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          general_enabled?: boolean
          id?: string
          job_enabled?: boolean
          lead_enabled?: boolean
          pipeline_enabled?: boolean
          sound_enabled?: boolean
          system_enabled?: boolean
          team_enabled?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          general_enabled?: boolean
          id?: string
          job_enabled?: boolean
          lead_enabled?: boolean
          pipeline_enabled?: boolean
          sound_enabled?: boolean
          system_enabled?: boolean
          team_enabled?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_notifications: {
        Row: {
          category: string
          color: string | null
          created_at: string
          icon: string | null
          id: string
          is_dismissed: boolean
          is_read: boolean
          link_url: string | null
          message: string | null
          related_entity_id: string | null
          related_entity_type: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          category?: string
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          is_dismissed?: boolean
          is_read?: boolean
          link_url?: string | null
          message?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          category?: string
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          is_dismissed?: boolean
          is_read?: boolean
          link_url?: string | null
          message?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      admin_tasks: {
        Row: {
          assigned_to: string | null
          created_at: string
          created_by: string | null
          customer_id: string | null
          description: string | null
          due_date: string | null
          id: string
          job_id: string | null
          pipeline_entry_id: string | null
          priority: string
          source: string | null
          source_event: string | null
          status: string
          submission_id: string | null
          submission_type: string | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          job_id?: string | null
          pipeline_entry_id?: string | null
          priority?: string
          source?: string | null
          source_event?: string | null
          status?: string
          submission_id?: string | null
          submission_type?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          job_id?: string | null
          pipeline_entry_id?: string | null
          priority?: string
          source?: string | null
          source_event?: string | null
          status?: string
          submission_id?: string | null
          submission_type?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_tasks_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "crm_customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_tasks_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "crm_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_tasks_pipeline_entry_id_fkey"
            columns: ["pipeline_entry_id"]
            isOneToOne: false
            referencedRelation: "crm_pipeline_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_config: {
        Row: {
          api_key_secret_name: string | null
          config_key: string
          created_at: string | null
          id: string
          is_active: boolean | null
          max_tokens: number | null
          model: string
          provider: string
          system_prompt: string | null
          temperature: number | null
          updated_at: string | null
        }
        Insert: {
          api_key_secret_name?: string | null
          config_key: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          max_tokens?: number | null
          model?: string
          provider?: string
          system_prompt?: string | null
          temperature?: number | null
          updated_at?: string | null
        }
        Update: {
          api_key_secret_name?: string | null
          config_key?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          max_tokens?: number | null
          model?: string
          provider?: string
          system_prompt?: string | null
          temperature?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_request_logs: {
        Row: {
          action: string | null
          config_key: string | null
          created_at: string | null
          duration_ms: number | null
          error_message: string | null
          id: string
          input_tokens: number | null
          metadata: Json | null
          model: string
          output_tokens: number | null
          provider: string
          status: string | null
          user_id: string | null
        }
        Insert: {
          action?: string | null
          config_key?: string | null
          created_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          input_tokens?: number | null
          metadata?: Json | null
          model: string
          output_tokens?: number | null
          provider: string
          status?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string | null
          config_key?: string | null
          created_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          input_tokens?: number | null
          metadata?: Json | null
          model?: string
          output_tokens?: number | null
          provider?: string
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      assistant_logs: {
        Row: {
          assistant_response: string | null
          created_at: string
          duration_ms: number | null
          error: string | null
          id: string
          tools_used: Json | null
          user_id: string | null
          user_message: string
        }
        Insert: {
          assistant_response?: string | null
          created_at?: string
          duration_ms?: number | null
          error?: string | null
          id?: string
          tools_used?: Json | null
          user_id?: string | null
          user_message: string
        }
        Update: {
          assistant_response?: string | null
          created_at?: string
          duration_ms?: number | null
          error?: string | null
          id?: string
          tools_used?: Json | null
          user_id?: string | null
          user_message?: string
        }
        Relationships: []
      }
      assistant_role_permissions: {
        Row: {
          can_access_assistant: boolean
          can_use_calendar_tools: boolean
          can_use_voice_input: boolean
          can_use_write_tools: boolean
          can_view_briefing: boolean
          can_view_financials: boolean
          created_at: string
          id: string
          max_messages_per_hour: number
          role_name: string
          updated_at: string
        }
        Insert: {
          can_access_assistant?: boolean
          can_use_calendar_tools?: boolean
          can_use_voice_input?: boolean
          can_use_write_tools?: boolean
          can_view_briefing?: boolean
          can_view_financials?: boolean
          created_at?: string
          id?: string
          max_messages_per_hour?: number
          role_name: string
          updated_at?: string
        }
        Update: {
          can_access_assistant?: boolean
          can_use_calendar_tools?: boolean
          can_use_voice_input?: boolean
          can_use_write_tools?: boolean
          can_view_briefing?: boolean
          can_view_financials?: boolean
          created_at?: string
          id?: string
          max_messages_per_hour?: number
          role_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      author_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string
          id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name: string
          id?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string
          id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      automation_logs: {
        Row: {
          actions_executed: Json | null
          automation_id: string | null
          created_at: string | null
          duration_ms: number | null
          error_message: string | null
          id: string
          status: string | null
          trigger_event: Json
        }
        Insert: {
          actions_executed?: Json | null
          automation_id?: string | null
          created_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          status?: string | null
          trigger_event: Json
        }
        Update: {
          actions_executed?: Json | null
          automation_id?: string | null
          created_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          status?: string | null
          trigger_event?: Json
        }
        Relationships: [
          {
            foreignKeyName: "automation_logs_automation_id_fkey"
            columns: ["automation_id"]
            isOneToOne: false
            referencedRelation: "automations"
            referencedColumns: ["id"]
          },
        ]
      }
      automations: {
        Row: {
          actions: Json | null
          conditions: Json | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          last_run_at: string | null
          name: string
          run_count: number | null
          trigger_config: Json | null
          trigger_type: string
          updated_at: string | null
        }
        Insert: {
          actions?: Json | null
          conditions?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          name: string
          run_count?: number | null
          trigger_config?: Json | null
          trigger_type: string
          updated_at?: string | null
        }
        Update: {
          actions?: Json | null
          conditions?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          name?: string
          run_count?: number | null
          trigger_config?: Json | null
          trigger_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_bio: string | null
          author_id: string | null
          author_name: string | null
          author_profile_id: string | null
          canonical_url: string | null
          category: string[] | null
          content: string | null
          created_at: string | null
          excerpt: string | null
          featured_image: string | null
          featured_image_alt: string | null
          focus_keyword: string | null
          id: string
          meta_description: string | null
          meta_title: string | null
          noindex: boolean
          og_description: string | null
          og_image: string | null
          og_title: string | null
          published_at: string | null
          slug: string
          status: string
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_bio?: string | null
          author_id?: string | null
          author_name?: string | null
          author_profile_id?: string | null
          canonical_url?: string | null
          category?: string[] | null
          content?: string | null
          created_at?: string | null
          excerpt?: string | null
          featured_image?: string | null
          featured_image_alt?: string | null
          focus_keyword?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          noindex?: boolean
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          published_at?: string | null
          slug: string
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_bio?: string | null
          author_id?: string | null
          author_name?: string | null
          author_profile_id?: string | null
          canonical_url?: string | null
          category?: string[] | null
          content?: string | null
          created_at?: string | null
          excerpt?: string | null
          featured_image?: string | null
          featured_image_alt?: string | null
          focus_keyword?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          noindex?: boolean
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          published_at?: string | null
          slug?: string
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_profile_id_fkey"
            columns: ["author_profile_id"]
            isOneToOne: false
            referencedRelation: "author_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_tags: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      button_clicks: {
        Row: {
          button_location: string
          button_name: string
          clicked_at: string
          destination_url: string | null
          id: string
          referrer: string | null
          user_agent: string | null
        }
        Insert: {
          button_location: string
          button_name: string
          clicked_at?: string
          destination_url?: string | null
          id?: string
          referrer?: string | null
          user_agent?: string | null
        }
        Update: {
          button_location?: string
          button_name?: string
          clicked_at?: string
          destination_url?: string | null
          id?: string
          referrer?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      calculator_configs: {
        Row: {
          calculator_type: string
          config: Json | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          calculator_type?: string
          config?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          calculator_type?: string
          config?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      calculator_options: {
        Row: {
          calculator_id: string
          created_at: string
          help_text: string | null
          id: string
          is_required: boolean | null
          label: string
          option_name: string
          option_type: string
          options: Json | null
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          calculator_id: string
          created_at?: string
          help_text?: string | null
          id?: string
          is_required?: boolean | null
          label: string
          option_name: string
          option_type?: string
          options?: Json | null
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          calculator_id?: string
          created_at?: string
          help_text?: string | null
          id?: string
          is_required?: boolean | null
          label?: string
          option_name?: string
          option_type?: string
          options?: Json | null
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "calculator_options_calculator_id_fkey"
            columns: ["calculator_id"]
            isOneToOne: false
            referencedRelation: "calculator_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_landing_pages: {
        Row: {
          archived_at: string | null
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          platform: string | null
          slug: string
          updated_at: string
          url: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          notes?: string | null
          platform?: string | null
          slug: string
          updated_at?: string
          url: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          platform?: string | null
          slug?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          message: string
          phone: string
          service_type: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name: string
          message: string
          phone: string
          service_type?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          message?: string
          phone?: string
          service_type?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      crm_campaign_tags: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      crm_companies: {
        Row: {
          billing_address: string | null
          billing_city: string | null
          billing_state: string | null
          billing_zip: string | null
          created_at: string
          deleted_at: string | null
          email: string | null
          id: string
          lead_source: string | null
          name: string
          notes: string | null
          phone: string | null
          tags: string[] | null
          updated_at: string
          website: string | null
          workedge_customer_id: string | null
        }
        Insert: {
          billing_address?: string | null
          billing_city?: string | null
          billing_state?: string | null
          billing_zip?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          id?: string
          lead_source?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          tags?: string[] | null
          updated_at?: string
          website?: string | null
          workedge_customer_id?: string | null
        }
        Update: {
          billing_address?: string | null
          billing_city?: string | null
          billing_state?: string | null
          billing_zip?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          id?: string
          lead_source?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          tags?: string[] | null
          updated_at?: string
          website?: string | null
          workedge_customer_id?: string | null
        }
        Relationships: []
      }
      crm_customer_contacts: {
        Row: {
          contact_type: string
          created_at: string
          customer_id: string
          deleted_at: string | null
          email: string | null
          first_name: string
          id: string
          last_name: string | null
          notes: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          contact_type?: string
          created_at?: string
          customer_id: string
          deleted_at?: string | null
          email?: string | null
          first_name: string
          id?: string
          last_name?: string | null
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          contact_type?: string
          created_at?: string
          customer_id?: string
          deleted_at?: string | null
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string | null
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_customer_contacts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "crm_customers"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_customer_notes: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          customer_id: string
          id: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          customer_id: string
          id?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          customer_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_customer_notes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "crm_customers"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_customers: {
        Row: {
          alternate_phone: string | null
          assigned_to: string | null
          billing_address: string | null
          billing_address_line2: string | null
          billing_city: string | null
          billing_state: string | null
          billing_zip: string | null
          company_id: string | null
          company_name: string | null
          created_at: string
          customer_status: string
          customer_type: string
          deleted_at: string | null
          email: string | null
          first_name: string | null
          ghl_contact_id: string | null
          id: string
          last_name: string | null
          lead_source: string | null
          notes: string | null
          phone: string | null
          preferred_contact_method: string | null
          tags: string[] | null
          updated_at: string
          workedge_customer_id: string | null
        }
        Insert: {
          alternate_phone?: string | null
          assigned_to?: string | null
          billing_address?: string | null
          billing_address_line2?: string | null
          billing_city?: string | null
          billing_state?: string | null
          billing_zip?: string | null
          company_id?: string | null
          company_name?: string | null
          created_at?: string
          customer_status?: string
          customer_type?: string
          deleted_at?: string | null
          email?: string | null
          first_name?: string | null
          ghl_contact_id?: string | null
          id?: string
          last_name?: string | null
          lead_source?: string | null
          notes?: string | null
          phone?: string | null
          preferred_contact_method?: string | null
          tags?: string[] | null
          updated_at?: string
          workedge_customer_id?: string | null
        }
        Update: {
          alternate_phone?: string | null
          assigned_to?: string | null
          billing_address?: string | null
          billing_address_line2?: string | null
          billing_city?: string | null
          billing_state?: string | null
          billing_zip?: string | null
          company_id?: string | null
          company_name?: string | null
          created_at?: string
          customer_status?: string
          customer_type?: string
          deleted_at?: string | null
          email?: string | null
          first_name?: string | null
          ghl_contact_id?: string | null
          id?: string
          last_name?: string | null
          lead_source?: string | null
          notes?: string | null
          phone?: string | null
          preferred_contact_method?: string | null
          tags?: string[] | null
          updated_at?: string
          workedge_customer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_customers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_interactions: {
        Row: {
          content: string | null
          created_at: string
          customer_id: string
          direction: string | null
          id: string
          interaction_at: string
          interaction_type: string
          logged_by: string | null
          outcome: string | null
          subject: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          customer_id: string
          direction?: string | null
          id?: string
          interaction_at?: string
          interaction_type: string
          logged_by?: string | null
          outcome?: string | null
          subject?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string
          customer_id?: string
          direction?: string | null
          id?: string
          interaction_at?: string
          interaction_type?: string
          logged_by?: string | null
          outcome?: string | null
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_interactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "crm_customers"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_job_appointment_calendars: {
        Row: {
          appointment_id: string
          created_at: string
          google_calendar_db_id: string
          google_calendar_event_id: string | null
          id: string
        }
        Insert: {
          appointment_id: string
          created_at?: string
          google_calendar_db_id: string
          google_calendar_event_id?: string | null
          id?: string
        }
        Update: {
          appointment_id?: string
          created_at?: string
          google_calendar_db_id?: string
          google_calendar_event_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_job_appointment_calendars_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "crm_job_appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_job_appointment_calendars_google_calendar_db_id_fkey"
            columns: ["google_calendar_db_id"]
            isOneToOne: false
            referencedRelation: "google_calendars"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_job_appointments: {
        Row: {
          assigned_team_id: string | null
          attendee_member_ids: string[] | null
          created_at: string | null
          end_datetime: string
          google_calendar_event_id: string | null
          google_calendar_id: string | null
          id: string
          job_id: string
          notes: string | null
          start_datetime: string
          title: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_team_id?: string | null
          attendee_member_ids?: string[] | null
          created_at?: string | null
          end_datetime: string
          google_calendar_event_id?: string | null
          google_calendar_id?: string | null
          id?: string
          job_id: string
          notes?: string | null
          start_datetime: string
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_team_id?: string | null
          attendee_member_ids?: string[] | null
          created_at?: string | null
          end_datetime?: string
          google_calendar_event_id?: string | null
          google_calendar_id?: string | null
          id?: string
          job_id?: string
          notes?: string | null
          start_datetime?: string
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_job_appointments_assigned_team_id_fkey"
            columns: ["assigned_team_id"]
            isOneToOne: false
            referencedRelation: "crm_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_job_appointments_google_calendar_id_fkey"
            columns: ["google_calendar_id"]
            isOneToOne: false
            referencedRelation: "google_calendars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_job_appointments_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "crm_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_job_assignments: {
        Row: {
          actual_hours: number | null
          assignment_type: string | null
          created_at: string
          id: string
          job_id: string
          member_id: string | null
          notes: string | null
          role: string | null
          scheduled_end: string | null
          scheduled_start: string | null
          team_id: string | null
        }
        Insert: {
          actual_hours?: number | null
          assignment_type?: string | null
          created_at?: string
          id?: string
          job_id: string
          member_id?: string | null
          notes?: string | null
          role?: string | null
          scheduled_end?: string | null
          scheduled_start?: string | null
          team_id?: string | null
        }
        Update: {
          actual_hours?: number | null
          assignment_type?: string | null
          created_at?: string
          id?: string
          job_id?: string
          member_id?: string | null
          notes?: string | null
          role?: string | null
          scheduled_end?: string | null
          scheduled_start?: string | null
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_job_assignments_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "crm_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_job_assignments_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "crm_team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_job_assignments_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "crm_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_job_stage_history: {
        Row: {
          changed_by: string | null
          created_at: string
          from_stage_id: string | null
          id: string
          job_id: string
          notes: string | null
          to_stage_id: string
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          from_stage_id?: string | null
          id?: string
          job_id: string
          notes?: string | null
          to_stage_id: string
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          from_stage_id?: string | null
          id?: string
          job_id?: string
          notes?: string | null
          to_stage_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_job_stage_history_from_stage_id_fkey"
            columns: ["from_stage_id"]
            isOneToOne: false
            referencedRelation: "crm_job_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_job_stage_history_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "crm_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_job_stage_history_to_stage_id_fkey"
            columns: ["to_stage_id"]
            isOneToOne: false
            referencedRelation: "crm_job_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_job_stages: {
        Row: {
          auto_notify_customer: boolean | null
          color: string | null
          created_at: string
          id: string
          is_active: boolean | null
          job_type_id: string
          name: string
          sort_order: number
          stage_type: string
          updated_at: string
        }
        Insert: {
          auto_notify_customer?: boolean | null
          color?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          job_type_id: string
          name: string
          sort_order?: number
          stage_type?: string
          updated_at?: string
        }
        Update: {
          auto_notify_customer?: boolean | null
          color?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          job_type_id?: string
          name?: string
          sort_order?: number
          stage_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_job_stages_job_type_id_fkey"
            columns: ["job_type_id"]
            isOneToOne: false
            referencedRelation: "crm_job_types"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_job_types: {
        Row: {
          category: string
          color: string | null
          created_at: string
          default_duration_hours: number | null
          default_priority: string | null
          icon_name: string | null
          id: string
          is_active: boolean | null
          name: string
          requires_permit: boolean | null
          slug: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          category?: string
          color?: string | null
          created_at?: string
          default_duration_hours?: number | null
          default_priority?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          requires_permit?: boolean | null
          slug: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          category?: string
          color?: string | null
          created_at?: string
          default_duration_hours?: number | null
          default_priority?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          requires_permit?: boolean | null
          slug?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      crm_jobs: {
        Row: {
          actual_end: string | null
          actual_start: string | null
          created_at: string
          created_by: string | null
          current_stage_id: string | null
          customer_id: string
          customer_notes: string | null
          deleted_at: string | null
          final_amount: number | null
          google_calendar_event_id: string | null
          google_calendar_id: string | null
          id: string
          internal_notes: string | null
          job_number: string
          job_type_id: string
          location_id: string | null
          payment_status: string | null
          priority: string | null
          quoted_amount: number | null
          scheduled_date: string | null
          scheduled_end: string | null
          scheduled_end_date: string | null
          scheduled_start: string | null
          source_estimate_id: string | null
          source_pipeline_id: string | null
          title: string
          updated_at: string
          workedge_last_sync: string | null
          workedge_project_id: string | null
        }
        Insert: {
          actual_end?: string | null
          actual_start?: string | null
          created_at?: string
          created_by?: string | null
          current_stage_id?: string | null
          customer_id: string
          customer_notes?: string | null
          deleted_at?: string | null
          final_amount?: number | null
          google_calendar_event_id?: string | null
          google_calendar_id?: string | null
          id?: string
          internal_notes?: string | null
          job_number: string
          job_type_id: string
          location_id?: string | null
          payment_status?: string | null
          priority?: string | null
          quoted_amount?: number | null
          scheduled_date?: string | null
          scheduled_end?: string | null
          scheduled_end_date?: string | null
          scheduled_start?: string | null
          source_estimate_id?: string | null
          source_pipeline_id?: string | null
          title: string
          updated_at?: string
          workedge_last_sync?: string | null
          workedge_project_id?: string | null
        }
        Update: {
          actual_end?: string | null
          actual_start?: string | null
          created_at?: string
          created_by?: string | null
          current_stage_id?: string | null
          customer_id?: string
          customer_notes?: string | null
          deleted_at?: string | null
          final_amount?: number | null
          google_calendar_event_id?: string | null
          google_calendar_id?: string | null
          id?: string
          internal_notes?: string | null
          job_number?: string
          job_type_id?: string
          location_id?: string | null
          payment_status?: string | null
          priority?: string | null
          quoted_amount?: number | null
          scheduled_date?: string | null
          scheduled_end?: string | null
          scheduled_end_date?: string | null
          scheduled_start?: string | null
          source_estimate_id?: string | null
          source_pipeline_id?: string | null
          title?: string
          updated_at?: string
          workedge_last_sync?: string | null
          workedge_project_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_jobs_current_stage_id_fkey"
            columns: ["current_stage_id"]
            isOneToOne: false
            referencedRelation: "crm_job_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_jobs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "crm_customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_jobs_google_calendar_id_fkey"
            columns: ["google_calendar_id"]
            isOneToOne: false
            referencedRelation: "google_calendars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_jobs_job_type_id_fkey"
            columns: ["job_type_id"]
            isOneToOne: false
            referencedRelation: "crm_job_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_jobs_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "crm_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_locations: {
        Row: {
          access_notes: string | null
          address_line1: string
          address_line2: string | null
          bathrooms: number | null
          bedrooms: number | null
          building_type: string | null
          city: string
          county: string | null
          created_at: string
          customer_id: string
          deleted_at: string | null
          gate_code: string | null
          google_place_id: string | null
          id: string
          is_primary: boolean | null
          latitude: number | null
          location_name: string | null
          location_type: string | null
          longitude: number | null
          lot_size_sqft: number | null
          property_class: string | null
          property_data_auto_populated: boolean | null
          property_data_source: string | null
          property_data_verified_at: string | null
          square_footage: number | null
          state: string
          stories: number | null
          updated_at: string
          workedge_property_id: string | null
          year_built: number | null
          zip_code: string
        }
        Insert: {
          access_notes?: string | null
          address_line1: string
          address_line2?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          building_type?: string | null
          city: string
          county?: string | null
          created_at?: string
          customer_id: string
          deleted_at?: string | null
          gate_code?: string | null
          google_place_id?: string | null
          id?: string
          is_primary?: boolean | null
          latitude?: number | null
          location_name?: string | null
          location_type?: string | null
          longitude?: number | null
          lot_size_sqft?: number | null
          property_class?: string | null
          property_data_auto_populated?: boolean | null
          property_data_source?: string | null
          property_data_verified_at?: string | null
          square_footage?: number | null
          state: string
          stories?: number | null
          updated_at?: string
          workedge_property_id?: string | null
          year_built?: number | null
          zip_code: string
        }
        Update: {
          access_notes?: string | null
          address_line1?: string
          address_line2?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          building_type?: string | null
          city?: string
          county?: string | null
          created_at?: string
          customer_id?: string
          deleted_at?: string | null
          gate_code?: string | null
          google_place_id?: string | null
          id?: string
          is_primary?: boolean | null
          latitude?: number | null
          location_name?: string | null
          location_type?: string | null
          longitude?: number | null
          lot_size_sqft?: number | null
          property_class?: string | null
          property_data_auto_populated?: boolean | null
          property_data_source?: string | null
          property_data_verified_at?: string | null
          square_footage?: number | null
          state?: string
          stories?: number | null
          updated_at?: string
          workedge_property_id?: string | null
          year_built?: number | null
          zip_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_locations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "crm_customers"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_pipeline_entries: {
        Row: {
          assigned_to: string | null
          created_at: string
          customer_id: string
          estimated_value: number | null
          expected_close_date: string | null
          id: string
          lost_date: string | null
          lost_reason: string | null
          notes: string | null
          probability: number | null
          stage_id: string
          updated_at: string
          won_date: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          customer_id: string
          estimated_value?: number | null
          expected_close_date?: string | null
          id?: string
          lost_date?: string | null
          lost_reason?: string | null
          notes?: string | null
          probability?: number | null
          stage_id: string
          updated_at?: string
          won_date?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          customer_id?: string
          estimated_value?: number | null
          expected_close_date?: string | null
          id?: string
          lost_date?: string | null
          lost_reason?: string | null
          notes?: string | null
          probability?: number | null
          stage_id?: string
          updated_at?: string
          won_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_pipeline_entries_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "crm_customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_pipeline_entries_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "crm_pipeline_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_pipeline_stages: {
        Row: {
          color: string
          created_at: string
          display_name: string
          id: string
          is_active: boolean | null
          is_lost_stage: boolean | null
          is_won_stage: boolean | null
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          display_name: string
          id?: string
          is_active?: boolean | null
          is_lost_stage?: boolean | null
          is_won_stage?: boolean | null
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          display_name?: string
          id?: string
          is_active?: boolean | null
          is_lost_stage?: boolean | null
          is_won_stage?: boolean | null
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      crm_submission_links: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          submission_id: string
          submission_type: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          submission_id: string
          submission_type: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          submission_id?: string
          submission_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_submission_links_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "crm_customers"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_team_assignments: {
        Row: {
          created_at: string
          id: string
          is_lead: boolean | null
          member_id: string
          role_in_team: string | null
          team_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_lead?: boolean | null
          member_id: string
          role_in_team?: string | null
          team_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_lead?: boolean | null
          member_id?: string
          role_in_team?: string | null
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_team_assignments_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "crm_team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_team_assignments_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "crm_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_team_members: {
        Row: {
          certifications: string[] | null
          created_at: string
          default_availability: Json | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          first_name: string
          google_calendar_id: string | null
          hire_date: string | null
          hourly_rate: number | null
          id: string
          is_active: boolean | null
          last_name: string | null
          license_expiry: string | null
          license_number: string | null
          member_type: string | null
          notes: string | null
          overtime_rate: number | null
          phone: string | null
          role: string | null
          specialties: string[] | null
          updated_at: string
          user_id: string | null
          workedge_user_id: string | null
        }
        Insert: {
          certifications?: string[] | null
          created_at?: string
          default_availability?: Json | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          first_name: string
          google_calendar_id?: string | null
          hire_date?: string | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          last_name?: string | null
          license_expiry?: string | null
          license_number?: string | null
          member_type?: string | null
          notes?: string | null
          overtime_rate?: number | null
          phone?: string | null
          role?: string | null
          specialties?: string[] | null
          updated_at?: string
          user_id?: string | null
          workedge_user_id?: string | null
        }
        Update: {
          certifications?: string[] | null
          created_at?: string
          default_availability?: Json | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          first_name?: string
          google_calendar_id?: string | null
          hire_date?: string | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          last_name?: string | null
          license_expiry?: string | null
          license_number?: string | null
          member_type?: string | null
          notes?: string | null
          overtime_rate?: number | null
          phone?: string | null
          role?: string | null
          specialties?: string[] | null
          updated_at?: string
          user_id?: string | null
          workedge_user_id?: string | null
        }
        Relationships: []
      }
      crm_teams: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          google_calendar_id: string | null
          id: string
          is_active: boolean | null
          max_concurrent_jobs: number | null
          name: string
          team_type: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          google_calendar_id?: string | null
          id?: string
          is_active?: boolean | null
          max_concurrent_jobs?: number | null
          name: string
          team_type?: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          google_calendar_id?: string | null
          id?: string
          is_active?: boolean | null
          max_concurrent_jobs?: number | null
          name?: string
          team_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      documentation_search_log: {
        Row: {
          brand: string | null
          cache_hit: boolean | null
          created_at: string | null
          documents_found: number | null
          id: string
          model_number: string | null
          search_duration_ms: number | null
        }
        Insert: {
          brand?: string | null
          cache_hit?: boolean | null
          created_at?: string | null
          documents_found?: number | null
          id?: string
          model_number?: string | null
          search_duration_ms?: number | null
        }
        Update: {
          brand?: string | null
          cache_hit?: boolean | null
          created_at?: string | null
          documents_found?: number | null
          id?: string
          model_number?: string | null
          search_duration_ms?: number | null
        }
        Relationships: []
      }
      ducted_addons: {
        Row: {
          created_at: string
          description: string | null
          icon_name: string | null
          id: string
          is_active: boolean
          is_popular: boolean
          name: string
          price: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean
          is_popular?: boolean
          name: string
          price?: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean
          is_popular?: boolean
          name?: string
          price?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      ducted_efficiency_tiers: {
        Row: {
          created_at: string
          description: string | null
          display_name: string
          features: Json | null
          id: string
          is_active: boolean
          name: string
          seer_max: number
          seer_min: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_name: string
          features?: Json | null
          id?: string
          is_active?: boolean
          name: string
          seer_max: number
          seer_min: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_name?: string
          features?: Json | null
          id?: string
          is_active?: boolean
          name?: string
          seer_max?: number
          seer_min?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      ducted_equipment: {
        Row: {
          air_handler_model: string | null
          brand: string
          condenser_model: string | null
          created_at: string
          display_order: number
          eer2_rating: number | null
          efficiency_tier_id: string | null
          equipment_cost: number
          evap_coil_model: string | null
          features: Json | null
          furnace_model: string | null
          heat_kit_model: string | null
          heat_pump_model: string | null
          hspf2_rating: number | null
          id: string
          installation_labor: number
          is_active: boolean
          is_best_value: boolean
          is_energy_star: boolean
          refrigerant: string | null
          seer2_rating: number | null
          system_name: string | null
          system_type: string
          thermostat_name: string | null
          tonnage: number
          updated_at: string
          warranty_years: number
        }
        Insert: {
          air_handler_model?: string | null
          brand: string
          condenser_model?: string | null
          created_at?: string
          display_order?: number
          eer2_rating?: number | null
          efficiency_tier_id?: string | null
          equipment_cost?: number
          evap_coil_model?: string | null
          features?: Json | null
          furnace_model?: string | null
          heat_kit_model?: string | null
          heat_pump_model?: string | null
          hspf2_rating?: number | null
          id?: string
          installation_labor?: number
          is_active?: boolean
          is_best_value?: boolean
          is_energy_star?: boolean
          refrigerant?: string | null
          seer2_rating?: number | null
          system_name?: string | null
          system_type: string
          thermostat_name?: string | null
          tonnage: number
          updated_at?: string
          warranty_years?: number
        }
        Update: {
          air_handler_model?: string | null
          brand?: string
          condenser_model?: string | null
          created_at?: string
          display_order?: number
          eer2_rating?: number | null
          efficiency_tier_id?: string | null
          equipment_cost?: number
          evap_coil_model?: string | null
          features?: Json | null
          furnace_model?: string | null
          heat_kit_model?: string | null
          heat_pump_model?: string | null
          hspf2_rating?: number | null
          id?: string
          installation_labor?: number
          is_active?: boolean
          is_best_value?: boolean
          is_energy_star?: boolean
          refrigerant?: string | null
          seer2_rating?: number | null
          system_name?: string | null
          system_type?: string
          thermostat_name?: string | null
          tonnage?: number
          updated_at?: string
          warranty_years?: number
        }
        Relationships: [
          {
            foreignKeyName: "ducted_equipment_efficiency_tier_id_fkey"
            columns: ["efficiency_tier_id"]
            isOneToOne: false
            referencedRelation: "ducted_efficiency_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      ducted_estimate_submissions: {
        Row: {
          addons_cost: number | null
          best_time_to_call: string | null
          coverage: string
          created_at: string
          customer_address: string | null
          customer_email: string
          customer_name: string
          customer_phone: string | null
          efficiency_tier_id: string | null
          equipment_cost: number | null
          equipment_id: string | null
          final_total: number | null
          ghl_contact_id: string | null
          ghl_sync_status: string | null
          heating_type: string
          home_layout: string
          home_type: string
          hot_cold_spots: string | null
          id: string
          installation_cost: number | null
          notes: string | null
          recommended_tonnage: number | null
          selected_addons: Json | null
          square_footage: string
          status: string
          summer_temp: string | null
          system_count: number
          tax_amount: number | null
          updated_at: string
          wants_backup_quote: boolean | null
          winter_temp: string | null
        }
        Insert: {
          addons_cost?: number | null
          best_time_to_call?: string | null
          coverage: string
          created_at?: string
          customer_address?: string | null
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          efficiency_tier_id?: string | null
          equipment_cost?: number | null
          equipment_id?: string | null
          final_total?: number | null
          ghl_contact_id?: string | null
          ghl_sync_status?: string | null
          heating_type: string
          home_layout: string
          home_type: string
          hot_cold_spots?: string | null
          id?: string
          installation_cost?: number | null
          notes?: string | null
          recommended_tonnage?: number | null
          selected_addons?: Json | null
          square_footage: string
          status?: string
          summer_temp?: string | null
          system_count?: number
          tax_amount?: number | null
          updated_at?: string
          wants_backup_quote?: boolean | null
          winter_temp?: string | null
        }
        Update: {
          addons_cost?: number | null
          best_time_to_call?: string | null
          coverage?: string
          created_at?: string
          customer_address?: string | null
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          efficiency_tier_id?: string | null
          equipment_cost?: number | null
          equipment_id?: string | null
          final_total?: number | null
          ghl_contact_id?: string | null
          ghl_sync_status?: string | null
          heating_type?: string
          home_layout?: string
          home_type?: string
          hot_cold_spots?: string | null
          id?: string
          installation_cost?: number | null
          notes?: string | null
          recommended_tonnage?: number | null
          selected_addons?: Json | null
          square_footage?: string
          status?: string
          summer_temp?: string | null
          system_count?: number
          tax_amount?: number | null
          updated_at?: string
          wants_backup_quote?: boolean | null
          winter_temp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ducted_estimate_submissions_efficiency_tier_id_fkey"
            columns: ["efficiency_tier_id"]
            isOneToOne: false
            referencedRelation: "ducted_efficiency_tiers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ducted_estimate_submissions_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "ducted_equipment"
            referencedColumns: ["id"]
          },
        ]
      }
      ducted_pricing_modifiers: {
        Row: {
          amount: number | null
          calculation_base: string | null
          conditions: Json | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          modifier_type: string
          name: string
          percentage: number | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          amount?: number | null
          calculation_base?: string | null
          conditions?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          modifier_type: string
          name: string
          percentage?: number | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          amount?: number | null
          calculation_base?: string | null
          conditions?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          modifier_type?: string
          name?: string
          percentage?: number | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      ducted_tonnage_sizing_rules: {
        Row: {
          created_at: string
          home_type: string
          id: string
          is_active: boolean
          layout: string
          notes: string | null
          recommended_tonnage: number
          sort_order: number
          sq_ft_max: number
          sq_ft_min: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          home_type: string
          id?: string
          is_active?: boolean
          layout: string
          notes?: string | null
          recommended_tonnage: number
          sort_order?: number
          sq_ft_max: number
          sq_ft_min: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          home_type?: string
          id?: string
          is_active?: boolean
          layout?: string
          notes?: string | null
          recommended_tonnage?: number
          sort_order?: number
          sq_ft_max?: number
          sq_ft_min?: number
          updated_at?: string
        }
        Relationships: []
      }
      ductless_addons: {
        Row: {
          created_at: string
          description: string | null
          icon_name: string | null
          id: string
          is_active: boolean
          is_popular: boolean
          name: string
          price: number
          price_type: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean
          is_popular?: boolean
          name: string
          price?: number
          price_type?: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean
          is_popular?: boolean
          name?: string
          price?: number
          price_type?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      ductless_estimate_submissions: {
        Row: {
          created_at: string
          customer_address: string | null
          customer_city: string | null
          customer_county: string | null
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          customer_state: string | null
          customer_zip: string | null
          final_total: number
          ghl_contact_id: string | null
          ghl_sync_status: string | null
          google_place_id: string | null
          id: string
          notes: string | null
          rebates: number
          selected_addons: Json | null
          selected_rooms: Json | null
          status: string
          subtotal: number
          system_tier_id: string | null
          tax_amount: number
          unit_type_id: string | null
          updated_at: string
          zone_count: number
        }
        Insert: {
          created_at?: string
          customer_address?: string | null
          customer_city?: string | null
          customer_county?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          customer_state?: string | null
          customer_zip?: string | null
          final_total?: number
          ghl_contact_id?: string | null
          ghl_sync_status?: string | null
          google_place_id?: string | null
          id?: string
          notes?: string | null
          rebates?: number
          selected_addons?: Json | null
          selected_rooms?: Json | null
          status?: string
          subtotal?: number
          system_tier_id?: string | null
          tax_amount?: number
          unit_type_id?: string | null
          updated_at?: string
          zone_count?: number
        }
        Update: {
          created_at?: string
          customer_address?: string | null
          customer_city?: string | null
          customer_county?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          customer_state?: string | null
          customer_zip?: string | null
          final_total?: number
          ghl_contact_id?: string | null
          ghl_sync_status?: string | null
          google_place_id?: string | null
          id?: string
          notes?: string | null
          rebates?: number
          selected_addons?: Json | null
          selected_rooms?: Json | null
          status?: string
          subtotal?: number
          system_tier_id?: string | null
          tax_amount?: number
          unit_type_id?: string | null
          updated_at?: string
          zone_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "ductless_estimate_submissions_system_tier_id_fkey"
            columns: ["system_tier_id"]
            isOneToOne: false
            referencedRelation: "ductless_system_tiers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ductless_estimate_submissions_unit_type_id_fkey"
            columns: ["unit_type_id"]
            isOneToOne: false
            referencedRelation: "ductless_unit_types"
            referencedColumns: ["id"]
          },
        ]
      }
      ductless_system_tiers: {
        Row: {
          created_at: string
          description: string | null
          display_name: string
          features: Json | null
          id: string
          is_active: boolean
          is_featured: boolean
          name: string
          price_multiplier: number
          seer_rating: number | null
          sort_order: number
          tier_level: string
          updated_at: string
          warranty_years: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_name: string
          features?: Json | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          name: string
          price_multiplier?: number
          seer_rating?: number | null
          sort_order?: number
          tier_level: string
          updated_at?: string
          warranty_years?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          display_name?: string
          features?: Json | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          name?: string
          price_multiplier?: number
          seer_rating?: number | null
          sort_order?: number
          tier_level?: string
          updated_at?: string
          warranty_years?: number
        }
        Relationships: []
      }
      ductless_unit_size_pricing: {
        Row: {
          created_at: string
          id: string
          is_available: boolean
          price: number
          size_btu: number
          size_tons: number
          sort_order: number
          unit_type_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_available?: boolean
          price?: number
          size_btu: number
          size_tons: number
          sort_order?: number
          unit_type_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_available?: boolean
          price?: number
          size_btu?: number
          size_tons?: number
          sort_order?: number
          unit_type_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ductless_unit_size_pricing_unit_type_id_fkey"
            columns: ["unit_type_id"]
            isOneToOne: false
            referencedRelation: "ductless_unit_types"
            referencedColumns: ["id"]
          },
        ]
      }
      ductless_unit_types: {
        Row: {
          base_price: number
          benefits: Json | null
          created_at: string
          description: string | null
          display_name: string
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          base_price?: number
          benefits?: Json | null
          created_at?: string
          description?: string | null
          display_name: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          base_price?: number
          benefits?: Json | null
          created_at?: string
          description?: string | null
          display_name?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      equipment_documentation: {
        Row: {
          brand: string
          created_at: string | null
          document_title: string | null
          document_type: string
          document_url: string
          file_type: string | null
          id: string
          last_verified: string | null
          model_number: string | null
          model_pattern: string
          search_query_used: string | null
          source_domain: string | null
          source_url: string | null
          verified_working: boolean | null
        }
        Insert: {
          brand: string
          created_at?: string | null
          document_title?: string | null
          document_type: string
          document_url: string
          file_type?: string | null
          id?: string
          last_verified?: string | null
          model_number?: string | null
          model_pattern: string
          search_query_used?: string | null
          source_domain?: string | null
          source_url?: string | null
          verified_working?: boolean | null
        }
        Update: {
          brand?: string
          created_at?: string | null
          document_title?: string | null
          document_type?: string
          document_url?: string
          file_type?: string | null
          id?: string
          last_verified?: string | null
          model_number?: string | null
          model_pattern?: string
          search_query_used?: string | null
          source_domain?: string | null
          source_url?: string | null
          verified_working?: boolean | null
        }
        Relationships: []
      }
      equipment_pages: {
        Row: {
          auto_generated: boolean | null
          brand: string
          created_at: string | null
          custom_content: string | null
          documentation_count: number | null
          equipment_type: string | null
          id: string
          model_number: string
          model_pattern: string | null
          published: boolean | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          specs: Json
          times_searched: number | null
          updated_at: string | null
        }
        Insert: {
          auto_generated?: boolean | null
          brand: string
          created_at?: string | null
          custom_content?: string | null
          documentation_count?: number | null
          equipment_type?: string | null
          id?: string
          model_number: string
          model_pattern?: string | null
          published?: boolean | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          specs: Json
          times_searched?: number | null
          updated_at?: string | null
        }
        Update: {
          auto_generated?: boolean | null
          brand?: string
          created_at?: string | null
          custom_content?: string | null
          documentation_count?: number | null
          equipment_type?: string | null
          id?: string
          model_number?: string
          model_pattern?: string | null
          published?: boolean | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          specs?: Json
          times_searched?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      equipment_scans: {
        Row: {
          brand: string | null
          breaker_size: string | null
          city: string | null
          compressor_info: string | null
          created_at: string | null
          customer_address: string | null
          customer_name: string | null
          customer_phone: string | null
          email: string | null
          equipment_type: string | null
          factory_charge: string | null
          fan_motor_info: string | null
          ghl_contact_id: string | null
          ghl_sync_status: string
          id: string
          is_dfw: boolean | null
          manufactured_year: number | null
          marketing_opt_in: boolean | null
          model_number: string
          raw_ai_response: Json | null
          refrigerant: string | null
          seer_rating: number | null
          serial_number: string | null
          state: string | null
          status: string
          tonnage: string | null
          voltage_info: string | null
          zip_code: string
        }
        Insert: {
          brand?: string | null
          breaker_size?: string | null
          city?: string | null
          compressor_info?: string | null
          created_at?: string | null
          customer_address?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          email?: string | null
          equipment_type?: string | null
          factory_charge?: string | null
          fan_motor_info?: string | null
          ghl_contact_id?: string | null
          ghl_sync_status?: string
          id?: string
          is_dfw?: boolean | null
          manufactured_year?: number | null
          marketing_opt_in?: boolean | null
          model_number: string
          raw_ai_response?: Json | null
          refrigerant?: string | null
          seer_rating?: number | null
          serial_number?: string | null
          state?: string | null
          status?: string
          tonnage?: string | null
          voltage_info?: string | null
          zip_code: string
        }
        Update: {
          brand?: string | null
          breaker_size?: string | null
          city?: string | null
          compressor_info?: string | null
          created_at?: string | null
          customer_address?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          email?: string | null
          equipment_type?: string | null
          factory_charge?: string | null
          fan_motor_info?: string | null
          ghl_contact_id?: string | null
          ghl_sync_status?: string
          id?: string
          is_dfw?: boolean | null
          manufactured_year?: number | null
          marketing_opt_in?: boolean | null
          model_number?: string
          raw_ai_response?: Json | null
          refrigerant?: string | null
          seer_rating?: number | null
          serial_number?: string | null
          state?: string | null
          status?: string
          tonnage?: string | null
          voltage_info?: string | null
          zip_code?: string
        }
        Relationships: []
      }
      equipment_systems: {
        Row: {
          ahri_number: string | null
          air_handler_cfm: number | null
          air_handler_model: string | null
          air_handler_price: number | null
          capacity_btuh: number | null
          condenser_heat_pump_model: string | null
          condenser_price: number | null
          created_at: string
          eer2: number | null
          evap_coil_model: string | null
          evap_coil_price: number | null
          furnace_afue: number | null
          furnace_air_handler_model: string | null
          furnace_air_handler_price: number | null
          furnace_air_handler_size: string | null
          furnace_btu_input: number | null
          furnace_model: string | null
          furnace_price: number | null
          heat_kit: string | null
          heat_kit_price: number | null
          heating_source: string | null
          hspf2: number | null
          id: string
          needs_migration_review: boolean | null
          notes: string | null
          refrigerant: string | null
          seer2: number | null
          system_name: string
          system_price: number | null
          system_type: string
          thermostat_model: string | null
          thermostat_price: number | null
          tonnage: number | null
          updated_at: string
        }
        Insert: {
          ahri_number?: string | null
          air_handler_cfm?: number | null
          air_handler_model?: string | null
          air_handler_price?: number | null
          capacity_btuh?: number | null
          condenser_heat_pump_model?: string | null
          condenser_price?: number | null
          created_at?: string
          eer2?: number | null
          evap_coil_model?: string | null
          evap_coil_price?: number | null
          furnace_afue?: number | null
          furnace_air_handler_model?: string | null
          furnace_air_handler_price?: number | null
          furnace_air_handler_size?: string | null
          furnace_btu_input?: number | null
          furnace_model?: string | null
          furnace_price?: number | null
          heat_kit?: string | null
          heat_kit_price?: number | null
          heating_source?: string | null
          hspf2?: number | null
          id?: string
          needs_migration_review?: boolean | null
          notes?: string | null
          refrigerant?: string | null
          seer2?: number | null
          system_name: string
          system_price?: number | null
          system_type: string
          thermostat_model?: string | null
          thermostat_price?: number | null
          tonnage?: number | null
          updated_at?: string
        }
        Update: {
          ahri_number?: string | null
          air_handler_cfm?: number | null
          air_handler_model?: string | null
          air_handler_price?: number | null
          capacity_btuh?: number | null
          condenser_heat_pump_model?: string | null
          condenser_price?: number | null
          created_at?: string
          eer2?: number | null
          evap_coil_model?: string | null
          evap_coil_price?: number | null
          furnace_afue?: number | null
          furnace_air_handler_model?: string | null
          furnace_air_handler_price?: number | null
          furnace_air_handler_size?: string | null
          furnace_btu_input?: number | null
          furnace_model?: string | null
          furnace_price?: number | null
          heat_kit?: string | null
          heat_kit_price?: number | null
          heating_source?: string | null
          hspf2?: number | null
          id?: string
          needs_migration_review?: boolean | null
          notes?: string | null
          refrigerant?: string | null
          seer2?: number | null
          system_name?: string
          system_price?: number | null
          system_type?: string
          thermostat_model?: string | null
          thermostat_price?: number | null
          tonnage?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      estimate_line_items: {
        Row: {
          admin_cost_id: string | null
          created_at: string
          description: string | null
          equipment_system_id: string | null
          estimate_id: string
          id: string
          item_type: Database["public"]["Enums"]["line_item_type"]
          labor_rate_id: string | null
          line_total: number
          material_id: string | null
          name: string
          quantity: number
          section: Database["public"]["Enums"]["estimate_section"] | null
          sort_order: number
          unit: string
          unit_cost: number
          updated_at: string
        }
        Insert: {
          admin_cost_id?: string | null
          created_at?: string
          description?: string | null
          equipment_system_id?: string | null
          estimate_id: string
          id?: string
          item_type: Database["public"]["Enums"]["line_item_type"]
          labor_rate_id?: string | null
          line_total?: number
          material_id?: string | null
          name: string
          quantity?: number
          section?: Database["public"]["Enums"]["estimate_section"] | null
          sort_order?: number
          unit?: string
          unit_cost?: number
          updated_at?: string
        }
        Update: {
          admin_cost_id?: string | null
          created_at?: string
          description?: string | null
          equipment_system_id?: string | null
          estimate_id?: string
          id?: string
          item_type?: Database["public"]["Enums"]["line_item_type"]
          labor_rate_id?: string | null
          line_total?: number
          material_id?: string | null
          name?: string
          quantity?: number
          section?: Database["public"]["Enums"]["estimate_section"] | null
          sort_order?: number
          unit?: string
          unit_cost?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "estimate_line_items_admin_cost_id_fkey"
            columns: ["admin_cost_id"]
            isOneToOne: false
            referencedRelation: "admin_costs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimate_line_items_equipment_system_id_fkey"
            columns: ["equipment_system_id"]
            isOneToOne: false
            referencedRelation: "equipment_systems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimate_line_items_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimate_line_items_labor_rate_id_fkey"
            columns: ["labor_rate_id"]
            isOneToOne: false
            referencedRelation: "labor_rates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimate_line_items_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      estimate_template_items: {
        Row: {
          admin_cost_id: string | null
          created_at: string
          description: string | null
          equipment_system_id: string | null
          id: string
          item_type: Database["public"]["Enums"]["line_item_type"]
          labor_rate_id: string | null
          material_id: string | null
          name: string
          quantity: number
          section: Database["public"]["Enums"]["estimate_section"] | null
          sort_order: number
          template_id: string
          unit: string
          unit_cost: number
          updated_at: string
        }
        Insert: {
          admin_cost_id?: string | null
          created_at?: string
          description?: string | null
          equipment_system_id?: string | null
          id?: string
          item_type?: Database["public"]["Enums"]["line_item_type"]
          labor_rate_id?: string | null
          material_id?: string | null
          name: string
          quantity?: number
          section?: Database["public"]["Enums"]["estimate_section"] | null
          sort_order?: number
          template_id: string
          unit?: string
          unit_cost?: number
          updated_at?: string
        }
        Update: {
          admin_cost_id?: string | null
          created_at?: string
          description?: string | null
          equipment_system_id?: string | null
          id?: string
          item_type?: Database["public"]["Enums"]["line_item_type"]
          labor_rate_id?: string | null
          material_id?: string | null
          name?: string
          quantity?: number
          section?: Database["public"]["Enums"]["estimate_section"] | null
          sort_order?: number
          template_id?: string
          unit?: string
          unit_cost?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "estimate_template_items_admin_cost_id_fkey"
            columns: ["admin_cost_id"]
            isOneToOne: false
            referencedRelation: "admin_costs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimate_template_items_equipment_system_id_fkey"
            columns: ["equipment_system_id"]
            isOneToOne: false
            referencedRelation: "equipment_systems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimate_template_items_labor_rate_id_fkey"
            columns: ["labor_rate_id"]
            isOneToOne: false
            referencedRelation: "labor_rates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimate_template_items_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimate_template_items_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "estimate_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      estimate_templates: {
        Row: {
          created_at: string
          description: string | null
          heating_type: Database["public"]["Enums"]["heating_type"]
          id: string
          is_active: boolean
          job_type: Database["public"]["Enums"]["job_type"]
          name: string
          profit_margin: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          heating_type?: Database["public"]["Enums"]["heating_type"]
          id?: string
          is_active?: boolean
          job_type?: Database["public"]["Enums"]["job_type"]
          name: string
          profit_margin?: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          heating_type?: Database["public"]["Enums"]["heating_type"]
          id?: string
          is_active?: boolean
          job_type?: Database["public"]["Enums"]["job_type"]
          name?: string
          profit_margin?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      estimate_versions: {
        Row: {
          change_summary: string | null
          created_at: string
          created_by: string | null
          estimate_id: string
          id: string
          snapshot_data: Json
          version_number: number
        }
        Insert: {
          change_summary?: string | null
          created_at?: string
          created_by?: string | null
          estimate_id: string
          id?: string
          snapshot_data: Json
          version_number?: number
        }
        Update: {
          change_summary?: string | null
          created_at?: string
          created_by?: string | null
          estimate_id?: string
          id?: string
          snapshot_data?: Json
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "estimate_versions_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
        ]
      }
      estimates: {
        Row: {
          created_at: string
          created_by: string | null
          customer_address: string | null
          customer_email: string | null
          customer_id: string | null
          customer_name: string
          customer_phone: string | null
          estimate_number: string
          grand_total: number
          heating_type: Database["public"]["Enums"]["heating_type"]
          id: string
          job_notes: string | null
          job_type: Database["public"]["Enums"]["job_type"]
          location_id: string | null
          profit_margin: number
          status: Database["public"]["Enums"]["estimate_status"]
          subtotal_charge: number
          subtotal_cost: number
          tags: string[] | null
          tax_amount: number
          tax_rate: number
          title: string | null
          updated_at: string
          valid_until: string | null
          workedge_project_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          customer_address?: string | null
          customer_email?: string | null
          customer_id?: string | null
          customer_name: string
          customer_phone?: string | null
          estimate_number: string
          grand_total?: number
          heating_type?: Database["public"]["Enums"]["heating_type"]
          id?: string
          job_notes?: string | null
          job_type?: Database["public"]["Enums"]["job_type"]
          location_id?: string | null
          profit_margin?: number
          status?: Database["public"]["Enums"]["estimate_status"]
          subtotal_charge?: number
          subtotal_cost?: number
          tags?: string[] | null
          tax_amount?: number
          tax_rate?: number
          title?: string | null
          updated_at?: string
          valid_until?: string | null
          workedge_project_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          customer_address?: string | null
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string | null
          estimate_number?: string
          grand_total?: number
          heating_type?: Database["public"]["Enums"]["heating_type"]
          id?: string
          job_notes?: string | null
          job_type?: Database["public"]["Enums"]["job_type"]
          location_id?: string | null
          profit_margin?: number
          status?: Database["public"]["Enums"]["estimate_status"]
          subtotal_charge?: number
          subtotal_cost?: number
          tags?: string[] | null
          tax_amount?: number
          tax_rate?: number
          title?: string | null
          updated_at?: string
          valid_until?: string | null
          workedge_project_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "estimates_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "crm_customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimates_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "crm_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      financing_options: {
        Row: {
          applies_to: string[] | null
          contractor_fee: number
          created_at: string
          dealer_net_cost: string | null
          id: string
          interest_rate: number
          is_active: boolean
          months_to_payoff: number | null
          notes: string | null
          payment_factor: number
          plan_name: string
          promotional_offer: string
          sort_order: number
          tran_code: string | null
          updated_at: string
        }
        Insert: {
          applies_to?: string[] | null
          contractor_fee?: number
          created_at?: string
          dealer_net_cost?: string | null
          id?: string
          interest_rate?: number
          is_active?: boolean
          months_to_payoff?: number | null
          notes?: string | null
          payment_factor?: number
          plan_name: string
          promotional_offer: string
          sort_order?: number
          tran_code?: string | null
          updated_at?: string
        }
        Update: {
          applies_to?: string[] | null
          contractor_fee?: number
          created_at?: string
          dealer_net_cost?: string | null
          id?: string
          interest_rate?: number
          is_active?: boolean
          months_to_payoff?: number | null
          notes?: string | null
          payment_factor?: number
          plan_name?: string
          promotional_offer?: string
          sort_order?: number
          tran_code?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      form_source_tags: {
        Row: {
          created_at: string
          id: string
          source_type: string
          tag_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          source_type: string
          tag_id: string
        }
        Update: {
          created_at?: string
          id?: string
          source_type?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_source_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "ghl_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_image_tags: {
        Row: {
          created_at: string | null
          id: string
          image_id: string
          tag_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_id: string
          tag_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          image_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gallery_image_tags_image_id_fkey"
            columns: ["image_id"]
            isOneToOne: false
            referencedRelation: "gallery_images"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gallery_image_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "gallery_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_images: {
        Row: {
          alt_text: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string
          is_active: boolean | null
          is_featured: boolean | null
          media_type: string | null
          sort_order: number | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url: string
          is_active?: boolean | null
          is_featured?: boolean | null
          media_type?: string | null
          sort_order?: number | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          media_type?: string | null
          sort_order?: number | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      gallery_tags: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ghl_tags: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          tag_value: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          tag_value: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          tag_value?: string
          updated_at?: string
        }
        Relationships: []
      }
      google_calendars: {
        Row: {
          calendar_id: string
          color: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          is_primary: boolean | null
          last_synced_at: string | null
          linked_job_type_id: string | null
          linked_member_id: string | null
          linked_team_id: string | null
          name: string
          updated_at: string
        }
        Insert: {
          calendar_id: string
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          last_synced_at?: string | null
          linked_job_type_id?: string | null
          linked_member_id?: string | null
          linked_team_id?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          calendar_id?: string
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          last_synced_at?: string | null
          linked_job_type_id?: string | null
          linked_member_id?: string | null
          linked_team_id?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "google_calendars_linked_job_type_id_fkey"
            columns: ["linked_job_type_id"]
            isOneToOne: false
            referencedRelation: "crm_job_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "google_calendars_linked_member_id_fkey"
            columns: ["linked_member_id"]
            isOneToOne: false
            referencedRelation: "crm_team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "google_calendars_linked_team_id_fkey"
            columns: ["linked_team_id"]
            isOneToOne: false
            referencedRelation: "crm_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      individual_equipment_pricing: {
        Row: {
          brand: string
          created_at: string
          id: string
          is_active: boolean
          model_number: string
          notes: string | null
          price: number
          size: string
          sort_order: number
          type: string
          updated_at: string
        }
        Insert: {
          brand: string
          created_at?: string
          id?: string
          is_active?: boolean
          model_number: string
          notes?: string | null
          price?: number
          size: string
          sort_order?: number
          type: string
          updated_at?: string
        }
        Update: {
          brand?: string
          created_at?: string
          id?: string
          is_active?: boolean
          model_number?: string
          notes?: string | null
          price?: number
          size?: string
          sort_order?: number
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      integration_configs: {
        Row: {
          config: Json
          created_at: string
          id: string
          integration_name: string
          is_active: boolean | null
          last_sync_at: string | null
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          id?: string
          integration_name: string
          is_active?: boolean | null
          last_sync_at?: string | null
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          id?: string
          integration_name?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      job_applications: {
        Row: {
          availability: string | null
          certifications: string | null
          cover_letter: string | null
          created_at: string
          email: string
          experience: string
          first_name: string
          how_did_you_hear: string | null
          id: string
          last_name: string
          phone: string
          position: string | null
          resume_url: string | null
          status: string
          updated_at: string
        }
        Insert: {
          availability?: string | null
          certifications?: string | null
          cover_letter?: string | null
          created_at?: string
          email: string
          experience: string
          first_name: string
          how_did_you_hear?: string | null
          id?: string
          last_name: string
          phone: string
          position?: string | null
          resume_url?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          availability?: string | null
          certifications?: string | null
          cover_letter?: string | null
          created_at?: string
          email?: string
          experience?: string
          first_name?: string
          how_did_you_hear?: string | null
          id?: string
          last_name?: string
          phone?: string
          position?: string | null
          resume_url?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      labor_rates: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          rate: number
          rate_type: Database["public"]["Enums"]["labor_rate_type"]
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          rate?: number
          rate_type?: Database["public"]["Enums"]["labor_rate_type"]
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          rate?: number
          rate_type?: Database["public"]["Enums"]["labor_rate_type"]
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      landing_page_form_tags: {
        Row: {
          created_at: string
          form_id: string
          id: string
          tag_id: string
        }
        Insert: {
          created_at?: string
          form_id: string
          id?: string
          tag_id: string
        }
        Update: {
          created_at?: string
          form_id?: string
          id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "landing_page_form_tags_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "landing_page_forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "landing_page_form_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "ghl_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      landing_page_forms: {
        Row: {
          archived_at: string | null
          created_at: string
          description: string | null
          fields_config: Json
          form_type: string
          id: string
          is_active: boolean
          name: string
          redirect_url: string | null
          slug: string
          success_message: string | null
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          description?: string | null
          fields_config?: Json
          form_type?: string
          id?: string
          is_active?: boolean
          name: string
          redirect_url?: string | null
          slug: string
          success_message?: string | null
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          description?: string | null
          fields_config?: Json
          form_type?: string
          id?: string
          is_active?: boolean
          name?: string
          redirect_url?: string | null
          slug?: string
          success_message?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      landing_page_submissions: {
        Row: {
          created_at: string
          custom_fields: Json | null
          email: string
          first_name: string
          form_id: string | null
          ghl_contact_id: string | null
          ghl_sync_status: string
          id: string
          last_name: string
          message: string | null
          phone: string | null
          service_type: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          custom_fields?: Json | null
          email: string
          first_name: string
          form_id?: string | null
          ghl_contact_id?: string | null
          ghl_sync_status?: string
          id?: string
          last_name: string
          message?: string | null
          phone?: string | null
          service_type?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          custom_fields?: Json | null
          email?: string
          first_name?: string
          form_id?: string | null
          ghl_contact_id?: string | null
          ghl_sync_status?: string
          id?: string
          last_name?: string
          message?: string | null
          phone?: string | null
          service_type?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "landing_page_submissions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "landing_page_forms"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_sources: {
        Row: {
          category: string | null
          color: string | null
          created_at: string | null
          display_name: string
          id: string
          is_active: boolean | null
          name: string
          sort_order: number | null
        }
        Insert: {
          category?: string | null
          color?: string | null
          created_at?: string | null
          display_name: string
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
        }
        Update: {
          category?: string | null
          color?: string | null
          created_at?: string | null
          display_name?: string
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      materials_catalog: {
        Row: {
          category: Database["public"]["Enums"]["material_category"]
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          part_number: string | null
          sort_order: number | null
          supplier: string | null
          unit: string
          unit_cost: number
          updated_at: string
        }
        Insert: {
          category: Database["public"]["Enums"]["material_category"]
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          part_number?: string | null
          sort_order?: number | null
          supplier?: string | null
          unit?: string
          unit_cost?: number
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["material_category"]
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          part_number?: string | null
          sort_order?: number | null
          supplier?: string | null
          unit?: string
          unit_cost?: number
          updated_at?: string
        }
        Relationships: []
      }
      page_seo: {
        Row: {
          canonical_url: string | null
          created_at: string | null
          id: string
          meta_description: string | null
          meta_title: string | null
          og_description: string | null
          og_image: string | null
          og_title: string | null
          page_name: string
          page_path: string
          robots: string | null
          structured_data: Json | null
          updated_at: string | null
        }
        Insert: {
          canonical_url?: string | null
          created_at?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          page_name: string
          page_path: string
          robots?: string | null
          structured_data?: Json | null
          updated_at?: string | null
        }
        Update: {
          canonical_url?: string | null
          created_at?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          page_name?: string
          page_path?: string
          robots?: string | null
          structured_data?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      price_books: {
        Row: {
          category: string | null
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          uploaded_at: string
          uploaded_by: string | null
        }
        Insert: {
          category?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Update: {
          category?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          enabled: boolean
          id: string
          permission_key: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          enabled?: boolean
          id?: string
          permission_key: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          enabled?: boolean
          id?: string
          permission_key?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      social_link_clicks: {
        Row: {
          clicked_at: string
          id: string
          platform: string
          referrer: string | null
          social_link_id: string | null
          source: string
          user_agent: string | null
        }
        Insert: {
          clicked_at?: string
          id?: string
          platform: string
          referrer?: string | null
          social_link_id?: string | null
          source?: string
          user_agent?: string | null
        }
        Update: {
          clicked_at?: string
          id?: string
          platform?: string
          referrer?: string | null
          social_link_id?: string | null
          source?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "social_link_clicks_social_link_id_fkey"
            columns: ["social_link_id"]
            isOneToOne: false
            referencedRelation: "social_links"
            referencedColumns: ["id"]
          },
        ]
      }
      social_links: {
        Row: {
          created_at: string
          display_name: string
          icon_name: string | null
          id: string
          is_active: boolean
          platform: string
          updated_at: string
          url: string | null
        }
        Insert: {
          created_at?: string
          display_name: string
          icon_name?: string | null
          id?: string
          is_active?: boolean
          platform: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          created_at?: string
          display_name?: string
          icon_name?: string | null
          id?: string
          is_active?: boolean
          platform?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
      tracking_settings: {
        Row: {
          created_at: string
          id: string
          is_enabled: boolean
          setting_key: string
          setting_value: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_enabled?: boolean
          setting_key: string
          setting_value?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_enabled?: boolean
          setting_key?: string
          setting_value?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      trash_bin: {
        Row: {
          data: Json
          deleted_at: string | null
          deleted_by: string | null
          expires_at: string | null
          id: string
          original_id: string
          original_table: string
        }
        Insert: {
          data: Json
          deleted_at?: string | null
          deleted_by?: string | null
          expires_at?: string | null
          id?: string
          original_id: string
          original_table: string
        }
        Update: {
          data?: Json
          deleted_at?: string | null
          deleted_by?: string | null
          expires_at?: string | null
          id?: string
          original_id?: string
          original_table?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      workedge_daily_sync_log: {
        Row: {
          attachments_synced: number | null
          duration_ms: number | null
          errors: Json | null
          id: string
          jobs_created: number | null
          jobs_updated: number | null
          status: string | null
          sync_at: string | null
        }
        Insert: {
          attachments_synced?: number | null
          duration_ms?: number | null
          errors?: Json | null
          id?: string
          jobs_created?: number | null
          jobs_updated?: number | null
          status?: string | null
          sync_at?: string | null
        }
        Update: {
          attachments_synced?: number | null
          duration_ms?: number | null
          errors?: Json | null
          id?: string
          jobs_created?: number | null
          jobs_updated?: number | null
          status?: string | null
          sync_at?: string | null
        }
        Relationships: []
      }
      workedge_project_media: {
        Row: {
          captured_at: string | null
          captured_by: string | null
          description: string | null
          id: string
          job_id: string
          media_type: string
          media_url: string | null
          synced_at: string
          thumbnail_url: string | null
          title: string | null
          transcription: string | null
          workedge_project_id: string
        }
        Insert: {
          captured_at?: string | null
          captured_by?: string | null
          description?: string | null
          id?: string
          job_id: string
          media_type: string
          media_url?: string | null
          synced_at?: string
          thumbnail_url?: string | null
          title?: string | null
          transcription?: string | null
          workedge_project_id: string
        }
        Update: {
          captured_at?: string | null
          captured_by?: string | null
          description?: string | null
          id?: string
          job_id?: string
          media_type?: string
          media_url?: string | null
          synced_at?: string
          thumbnail_url?: string | null
          title?: string | null
          transcription?: string | null
          workedge_project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workedge_project_media_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "crm_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      workedge_sync_log: {
        Row: {
          entity_type: string
          error_message: string | null
          id: string
          local_id: string
          request_payload: Json | null
          response_payload: Json | null
          sync_direction: string
          sync_status: string
          synced_at: string
          workedge_id: string | null
        }
        Insert: {
          entity_type: string
          error_message?: string | null
          id?: string
          local_id: string
          request_payload?: Json | null
          response_payload?: Json | null
          sync_direction: string
          sync_status?: string
          synced_at?: string
          workedge_id?: string | null
        }
        Update: {
          entity_type?: string
          error_message?: string | null
          id?: string
          local_id?: string
          request_payload?: Json | null
          response_payload?: Json | null
          sync_direction?: string
          sync_status?: string
          synced_at?: string
          workedge_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      equipment_scans_public: {
        Row: {
          brand: string | null
          breaker_size: string | null
          city: string | null
          compressor_info: string | null
          created_at: string | null
          equipment_type: string | null
          factory_charge: string | null
          fan_motor_info: string | null
          id: string | null
          is_dfw: boolean | null
          manufactured_year: number | null
          model_number: string | null
          refrigerant: string | null
          seer_rating: number | null
          state: string | null
          tonnage: string | null
          voltage_info: string | null
          zip_code: string | null
        }
        Insert: {
          brand?: string | null
          breaker_size?: string | null
          city?: string | null
          compressor_info?: string | null
          created_at?: string | null
          equipment_type?: string | null
          factory_charge?: string | null
          fan_motor_info?: string | null
          id?: string | null
          is_dfw?: boolean | null
          manufactured_year?: number | null
          model_number?: string | null
          refrigerant?: string | null
          seer_rating?: number | null
          state?: string | null
          tonnage?: string | null
          voltage_info?: string | null
          zip_code?: string | null
        }
        Update: {
          brand?: string | null
          breaker_size?: string | null
          city?: string | null
          compressor_info?: string | null
          created_at?: string | null
          equipment_type?: string | null
          factory_charge?: string | null
          fan_motor_info?: string | null
          id?: string | null
          is_dfw?: boolean | null
          manufactured_year?: number | null
          model_number?: string | null
          refrigerant?: string | null
          seer_rating?: number | null
          state?: string | null
          tonnage?: string | null
          voltage_info?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      generate_estimate_number: { Args: never; Returns: string }
      generate_job_number: { Args: never; Returns: string }
      get_new_submission_counts: { Args: never; Returns: Json }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_user_roles_with_email: {
        Args: never
        Returns: {
          created_at: string
          email: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      admin_cost_type: "fixed" | "percentage" | "per_job"
      app_role:
        | "admin"
        | "manager"
        | "super_admin"
        | "technician"
        | "lead_tech"
        | "installer"
        | "helper"
      estimate_section:
        | "equipment_controls"
        | "miscellaneous_inside"
        | "ducting"
        | "labor"
        | "admin_costs"
        | "miscellaneous_outside"
      estimate_status: "draft" | "sent" | "accepted" | "declined" | "expired"
      heating_type: "gas" | "electric" | "heat_pump" | "dual_fuel"
      job_type:
        | "residential_new"
        | "residential_replacement"
        | "commercial_new"
        | "commercial_replacement"
        | "maintenance"
        | "repair"
      labor_rate_type: "hourly" | "daily" | "flat"
      line_item_type:
        | "equipment"
        | "material"
        | "labor"
        | "admin_cost"
        | "custom"
      material_category:
        | "refrigerant"
        | "copper"
        | "electrical"
        | "ductwork"
        | "controls"
        | "supports"
        | "misc"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      admin_cost_type: ["fixed", "percentage", "per_job"],
      app_role: [
        "admin",
        "manager",
        "super_admin",
        "technician",
        "lead_tech",
        "installer",
        "helper",
      ],
      estimate_section: [
        "equipment_controls",
        "miscellaneous_inside",
        "ducting",
        "labor",
        "admin_costs",
        "miscellaneous_outside",
      ],
      estimate_status: ["draft", "sent", "accepted", "declined", "expired"],
      heating_type: ["gas", "electric", "heat_pump", "dual_fuel"],
      job_type: [
        "residential_new",
        "residential_replacement",
        "commercial_new",
        "commercial_replacement",
        "maintenance",
        "repair",
      ],
      labor_rate_type: ["hourly", "daily", "flat"],
      line_item_type: [
        "equipment",
        "material",
        "labor",
        "admin_cost",
        "custom",
      ],
      material_category: [
        "refrigerant",
        "copper",
        "electrical",
        "ductwork",
        "controls",
        "supports",
        "misc",
      ],
    },
  },
} as const
