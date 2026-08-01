ALTER TABLE public.individual_equipment_pricing
  ADD COLUMN IF NOT EXISTS supplier_id UUID REFERENCES public.crm_suppliers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS supplier_url TEXT,
  ADD COLUMN IF NOT EXISTS price_updated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS previous_price NUMERIC;

CREATE INDEX IF NOT EXISTS idx_iep_supplier_id ON public.individual_equipment_pricing (supplier_id);

UPDATE public.individual_equipment_pricing
SET price_updated_at = updated_at
WHERE price_updated_at IS NULL;

CREATE OR REPLACE FUNCTION public.track_equipment_price_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.price_updated_at := now();
    RETURN NEW;
  END IF;

  IF NEW.price IS DISTINCT FROM OLD.price THEN
    NEW.previous_price := OLD.price;
    NEW.price_updated_at := now();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_iep_price_insert ON public.individual_equipment_pricing;
CREATE TRIGGER trg_iep_price_insert
BEFORE INSERT ON public.individual_equipment_pricing
FOR EACH ROW EXECUTE FUNCTION public.track_equipment_price_change();

DROP TRIGGER IF EXISTS trg_iep_price_update ON public.individual_equipment_pricing;
CREATE TRIGGER trg_iep_price_update
BEFORE UPDATE ON public.individual_equipment_pricing
FOR EACH ROW EXECUTE FUNCTION public.track_equipment_price_change();

CREATE OR REPLACE FUNCTION public.log_equipment_price_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _supplier_name TEXT;
BEGIN
  IF NEW.price IS DISTINCT FROM OLD.price THEN
    IF NEW.supplier_id IS NOT NULL THEN
      SELECT name INTO _supplier_name FROM public.crm_suppliers WHERE id = NEW.supplier_id;
    END IF;

    PERFORM public.log_crm_event(
      'equipment.price_changed',
      'equipment',
      NEW.id,
      jsonb_build_object(
        'brand', NEW.brand,
        'model_number', NEW.model_number,
        'old_price', OLD.price,
        'new_price', NEW.price,
        'supplier_id', NEW.supplier_id,
        'supplier_name', _supplier_name
      )
    );
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_iep_price_event ON public.individual_equipment_pricing;
CREATE TRIGGER trg_iep_price_event
AFTER UPDATE ON public.individual_equipment_pricing
FOR EACH ROW EXECUTE FUNCTION public.log_equipment_price_change();