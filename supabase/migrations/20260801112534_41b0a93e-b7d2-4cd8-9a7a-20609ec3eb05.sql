CREATE TABLE public.crm_events (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID,
  event_type   TEXT NOT NULL,
  entity_type  TEXT NOT NULL,
  entity_id    UUID NOT NULL,
  actor_id     UUID REFERENCES auth.users(id),
  actor_label  TEXT,
  source       TEXT NOT NULL DEFAULT 'admin_ui',
  payload      JSONB NOT NULL DEFAULT '{}',
  occurred_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.crm_events TO authenticated;
GRANT ALL ON public.crm_events TO service_role;

ALTER TABLE public.crm_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "crm_events_select" ON public.crm_events
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager'));

CREATE POLICY "crm_events_insert" ON public.crm_events
FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager'));

CREATE OR REPLACE FUNCTION public.crm_events_block_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RAISE EXCEPTION 'crm_events is append-only: % is not permitted', TG_OP;
END;
$$;

CREATE TRIGGER crm_events_append_only
BEFORE UPDATE OR DELETE ON public.crm_events
FOR EACH ROW EXECUTE FUNCTION public.crm_events_block_mutation();

CREATE INDEX idx_crm_events_entity ON public.crm_events (entity_type, entity_id);
CREATE INDEX idx_crm_events_type_time ON public.crm_events (event_type, occurred_at DESC);
CREATE INDEX idx_crm_events_time ON public.crm_events (occurred_at DESC);
CREATE INDEX idx_crm_events_payload ON public.crm_events USING GIN (payload);

CREATE OR REPLACE FUNCTION public.log_crm_event(
  _event_type  TEXT,
  _entity_type TEXT,
  _entity_id   UUID,
  _payload     JSONB DEFAULT '{}'::jsonb,
  _source      TEXT DEFAULT 'admin_ui',
  _actor_id    UUID DEFAULT auth.uid(),
  _actor_label TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _id UUID;
  _label TEXT := _actor_label;
BEGIN
  IF _label IS NULL AND _actor_id IS NOT NULL THEN
    SELECT email INTO _label FROM auth.users WHERE id = _actor_id;
  END IF;

  INSERT INTO public.crm_events (event_type, entity_type, entity_id, actor_id, actor_label, source, payload)
  VALUES (_event_type, _entity_type, _entity_id, _actor_id, COALESCE(_label, 'system'), COALESCE(_source, 'admin_ui'), COALESCE(_payload, '{}'::jsonb))
  RETURNING id INTO _id;

  RETURN _id;
END;
$$;