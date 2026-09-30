CREATE OR REPLACE FUNCTION public.sync_export_changes(p_table text, p_since timestamp with time zone)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  result jsonb;
  time_col text;
  has_upd boolean;
  has_crt boolean;
  ts_expr text;
BEGIN
  IF p_table IN (
    'crm_companies', 'crm_customers', 'crm_jobs', 'crm_job_types', 'crm_job_stages',
    'crm_locations', 'admin_notifications', 'admin_tasks', 'contact_submissions',
    'crm_job_appointments'
  ) THEN
    time_col := CASE WHEN p_table = 'admin_notifications' THEN 'created_at' ELSE 'updated_at' END;

    EXECUTE format(
      'SELECT COALESCE(jsonb_agg(t), ''[]''::jsonb) FROM (SELECT * FROM %I WHERE %I > $1 ORDER BY %I LIMIT 500) t',
      p_table, time_col, time_col
    )
    INTO result
    USING p_since;

    RETURN result;
  ELSIF p_table IN (
    'page_seo', 'seo_location_pages', 'seo_linking_opportunities', 'seo_reports',
    'seo_report_actions', 'seo_report_messages', 'seo_bach_analyses', 'page_seo_gsc_snapshots',
    'gsc_page_metrics', 'gsc_page_query_metrics', 'gsc_query_metrics', 'gsc_site_metrics',
    'ga4_page_metrics', 'ga4_traffic_sources', 'sitemap_snapshots', 'equipment_page_conflicts'
  ) THEN
    SELECT
      bool_or(column_name = 'updated_at'),
      bool_or(column_name = 'created_at')
    INTO has_upd, has_crt
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = p_table
      AND column_name IN ('updated_at', 'created_at');

    ts_expr := CASE
      WHEN has_upd AND has_crt THEN 'COALESCE(updated_at, created_at)'
      WHEN has_upd THEN 'updated_at'
      WHEN has_crt THEN 'created_at'
      ELSE NULL
    END;

    IF ts_expr IS NULL THEN
      EXECUTE format(
        'SELECT COALESCE(jsonb_agg(to_jsonb(t)), ''[]''::jsonb) FROM (SELECT * FROM %I ORDER BY id LIMIT 500) t',
        p_table
      )
      INTO result;
    ELSE
      EXECUTE format(
        'SELECT COALESCE(jsonb_agg(to_jsonb(t)), ''[]''::jsonb) FROM (SELECT * FROM %I WHERE %s > $1 ORDER BY %s LIMIT 500) t',
        p_table, ts_expr, ts_expr
      )
      INTO result
      USING p_since;
    END IF;

    RETURN result;
  ELSE
    RAISE EXCEPTION 'Table % is not allowed for sync export', p_table;
  END IF;
END;
$function$;