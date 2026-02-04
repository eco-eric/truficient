-- Allow partial saves for ductless estimator by setting defaults and removing NOT NULL constraints
ALTER TABLE ductless_estimate_submissions
  ALTER COLUMN zone_count SET DEFAULT 0,
  ALTER COLUMN subtotal SET DEFAULT 0,
  ALTER COLUMN tax_amount SET DEFAULT 0,
  ALTER COLUMN rebates SET DEFAULT 0,
  ALTER COLUMN final_total SET DEFAULT 0,
  ALTER COLUMN customer_name DROP NOT NULL,
  ALTER COLUMN customer_email DROP NOT NULL;

-- Add GHL tracking columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'ductless_estimate_submissions' 
    AND column_name = 'ghl_sync_status'
  ) THEN
    ALTER TABLE ductless_estimate_submissions ADD COLUMN ghl_sync_status TEXT DEFAULT 'pending';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'ductless_estimate_submissions' 
    AND column_name = 'ghl_contact_id'
  ) THEN
    ALTER TABLE ductless_estimate_submissions ADD COLUMN ghl_contact_id TEXT;
  END IF;
END $$;