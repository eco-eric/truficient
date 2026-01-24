# System Pricing Database Setup

Complete database documentation for the **System Pricing** admin feature, which manages HVAC equipment systems and price book PDFs.

---

## Overview

The System Pricing feature allows administrators to:
- Manage equipment systems with detailed specifications and pricing
- **Separate gas furnace and heat pump system configurations**
- Upload and organize PDF price books from manufacturers
- Import/export equipment data via Excel
- Filter and search systems by type and specifications

---

## Tables

### 1. `equipment_systems`

Stores HVAC equipment system configurations with pricing and efficiency data.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | `gen_random_uuid()` | Primary key |
| `system_name` | text | NO | - | Display name (required) |
| `system_type` | text | NO | - | `'ducted'` or `'mini_split'` |
| `heating_source` | text | YES | - | `'gas_furnace'` or `'heat_pump'` (ducted only) |
| `tonnage` | numeric | YES | - | System capacity in tons |
| `ahri_number` | text | YES | - | AHRI certification number |
| `capacity_btuh` | integer | YES | - | Capacity in BTU/hour |
| `condenser_heat_pump_model` | text | YES | - | Outdoor unit model number |
| `condenser_price` | numeric | YES | - | Outdoor unit cost |
| **Gas Furnace Fields** | | | | |
| `furnace_model` | text | YES | - | Gas furnace model (gas systems only) |
| `furnace_price` | numeric | YES | - | Furnace cost |
| `furnace_btu_input` | integer | YES | - | Furnace heating capacity in BTU |
| `furnace_afue` | numeric | YES | - | Furnace efficiency (80, 96, etc.) |
| **Air Handler Fields** | | | | |
| `air_handler_model` | text | YES | - | Air handler model (heat pump systems only) |
| `air_handler_price` | numeric | YES | - | Air handler cost |
| `air_handler_cfm` | integer | YES | - | Airflow capacity in CFM |
| **Common Fields** | | | | |
| `evap_coil_model` | text | YES | - | Evaporator coil model |
| `evap_coil_price` | numeric | YES | - | Evaporator coil cost |
| `heat_kit` | text | YES | - | Electric heat kit model (heat pump systems) |
| `heat_kit_price` | numeric | YES | - | Heat kit cost |
| `system_price` | numeric | YES | - | Total calculated system price |
| `seer2` | numeric | YES | - | SEER2 efficiency rating |
| `eer2` | numeric | YES | - | EER2 efficiency rating |
| `hspf2` | numeric | YES | - | HSPF2 heating efficiency (heat pumps) |
| `notes` | text | YES | - | Admin notes |
| `needs_migration_review` | boolean | NO | `true` | Flag for records needing review |
| `created_at` | timestamptz | NO | `now()` | Record creation timestamp |
| `updated_at` | timestamptz | NO | `now()` | Last modification timestamp |

#### Deprecated Columns

These columns are kept for backward compatibility during migration:

| Column | Type | Replacement |
|--------|------|-------------|
| `furnace_air_handler_model` | text | Use `furnace_model` or `air_handler_model` |
| `furnace_air_handler_price` | numeric | Use `furnace_price` or `air_handler_price` |
| `furnace_air_handler_size` | text | No longer used |

---

### 2. `price_books`

Tracks uploaded PDF price book documents.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | `gen_random_uuid()` | Primary key |
| `file_name` | text | NO | - | Original filename |
| `file_path` | text | NO | - | Storage bucket path |
| `file_size` | integer | YES | - | File size in bytes |
| `category` | text | YES | - | Optional categorization |
| `uploaded_at` | timestamptz | NO | `now()` | Upload timestamp |
| `uploaded_by` | uuid | YES | - | User ID of uploader |

---

## System Types and Heating Sources

### Ducted Systems

Ducted systems must specify a `heating_source`:

| Heating Source | Indoor Unit | Key Fields |
|----------------|-------------|------------|
| `gas_furnace` | Gas Furnace | `furnace_model`, `furnace_price`, `furnace_btu_input`, `furnace_afue` |
| `heat_pump` | Air Handler | `air_handler_model`, `air_handler_price`, `air_handler_cfm`, `heat_kit`, `heat_kit_price` |

### Mini Split Systems

Mini split systems do not use the `heating_source` field and have their own configuration in the ductless estimator tables.

---

## Auto-Calculated System Price

The admin form auto-calculates `system_price` based on `heating_source`:

**Gas Furnace Systems:**
```
system_price = condenser_price + furnace_price + evap_coil_price
```

**Heat Pump Systems:**
```
system_price = condenser_price + air_handler_price + evap_coil_price + heat_kit_price
```

---

## Row Level Security (RLS) Policies

### `equipment_systems` Policies

| Policy Name | Operation | Using/With Check |
|-------------|-----------|------------------|
| `Admins can view equipment systems` | SELECT | `has_role(auth.uid(), 'admin')` |
| `Admins can insert equipment systems` | INSERT | `has_role(auth.uid(), 'admin')` |
| `Admins can update equipment systems` | UPDATE | `has_role(auth.uid(), 'admin')` |
| `Admins can delete equipment systems` | DELETE | `has_role(auth.uid(), 'admin')` |

### `price_books` Policies

| Policy Name | Operation | Using/With Check |
|-------------|-----------|------------------|
| `Admins can view price books` | SELECT | `has_role(auth.uid(), 'admin')` |
| `Admins can upload price books` | INSERT | `has_role(auth.uid(), 'admin')` |
| `Admins can delete price books` | DELETE | `has_role(auth.uid(), 'admin')` |

---

## Storage Bucket

| Property | Value |
|----------|-------|
| **Bucket Name** | `price-books` |
| **Public Access** | `false` (private) |
| **Purpose** | Store PDF price book files |
| **File Types** | PDF documents only |

### Storage Policies

Authenticated admins can upload, download, and delete files from the `price-books` bucket.

---

## SQL Migration Scripts

### Add New Furnace/Air Handler Columns

```sql
-- Add heating source field
ALTER TABLE public.equipment_systems
ADD COLUMN heating_source TEXT CHECK (heating_source IN ('gas_furnace', 'heat_pump'));

-- Add furnace-specific columns
ALTER TABLE public.equipment_systems
ADD COLUMN furnace_model TEXT,
ADD COLUMN furnace_price NUMERIC,
ADD COLUMN furnace_btu_input INTEGER,
ADD COLUMN furnace_afue NUMERIC;

-- Add air handler-specific columns
ALTER TABLE public.equipment_systems
ADD COLUMN air_handler_model TEXT,
ADD COLUMN air_handler_price NUMERIC,
ADD COLUMN air_handler_cfm INTEGER;

-- Add migration tracking flag
ALTER TABLE public.equipment_systems
ADD COLUMN needs_migration_review BOOLEAN DEFAULT true;
```

### Create `equipment_systems` Table (Full Schema)

```sql
CREATE TABLE public.equipment_systems (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  system_name TEXT NOT NULL,
  system_type TEXT NOT NULL CHECK (system_type IN ('ducted', 'mini_split')),
  heating_source TEXT CHECK (heating_source IN ('gas_furnace', 'heat_pump')),
  tonnage NUMERIC,
  ahri_number TEXT,
  capacity_btuh INTEGER,
  condenser_heat_pump_model TEXT,
  condenser_price NUMERIC,
  -- Furnace fields (gas systems)
  furnace_model TEXT,
  furnace_price NUMERIC,
  furnace_btu_input INTEGER,
  furnace_afue NUMERIC,
  -- Air handler fields (heat pump systems)
  air_handler_model TEXT,
  air_handler_price NUMERIC,
  air_handler_cfm INTEGER,
  -- Common fields
  evap_coil_model TEXT,
  evap_coil_price NUMERIC,
  heat_kit TEXT,
  heat_kit_price NUMERIC,
  system_price NUMERIC,
  seer2 NUMERIC,
  eer2 NUMERIC,
  hspf2 NUMERIC,
  notes TEXT,
  needs_migration_review BOOLEAN NOT NULL DEFAULT true,
  -- Deprecated fields (for migration)
  furnace_air_handler_model TEXT,
  furnace_air_handler_price NUMERIC,
  furnace_air_handler_size TEXT,
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.equipment_systems ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can view equipment systems"
  ON public.equipment_systems FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert equipment systems"
  ON public.equipment_systems FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update equipment systems"
  ON public.equipment_systems FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete equipment systems"
  ON public.equipment_systems FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Create updated_at trigger
CREATE TRIGGER update_equipment_systems_updated_at
  BEFORE UPDATE ON public.equipment_systems
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
```

### Create `price_books` Table

```sql
CREATE TABLE public.price_books (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  category TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  uploaded_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.price_books ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can view price books"
  ON public.price_books FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can upload price books"
  ON public.price_books FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete price books"
  ON public.price_books FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));
```

### Create Storage Bucket

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('price-books', 'price-books', false);

-- Storage policies for admins
CREATE POLICY "Admins can upload to price-books"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'price-books' 
    AND public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can view price-books"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'price-books' 
    AND public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can delete from price-books"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'price-books' 
    AND public.has_role(auth.uid(), 'admin')
  );
```

---

## Excel Import Template

The admin interface supports bulk import via Excel. Column mapping:

| Excel Column | Database Column | Required | Notes |
|--------------|-----------------|----------|-------|
| System Name | `system_name` | YES | |
| System Type | `system_type` | YES | `ducted` or `mini_split` |
| Heating Source | `heating_source` | NO | `gas_furnace` or `heat_pump` |
| Tonnage | `tonnage` | NO | |
| AHRI Number | `ahri_number` | NO | |
| Condenser/Heat Pump Model | `condenser_heat_pump_model` | NO | |
| Condenser Price | `condenser_price` | NO | |
| Furnace Model | `furnace_model` | NO | Gas systems only |
| Furnace Price | `furnace_price` | NO | Gas systems only |
| Furnace BTU Input | `furnace_btu_input` | NO | Gas systems only |
| Furnace AFUE | `furnace_afue` | NO | Gas systems only |
| Air Handler Model | `air_handler_model` | NO | Heat pump systems only |
| Air Handler Price | `air_handler_price` | NO | Heat pump systems only |
| Air Handler CFM | `air_handler_cfm` | NO | Heat pump systems only |
| Evap Coil Model | `evap_coil_model` | NO | |
| Evap Coil Price | `evap_coil_price` | NO | |
| Heat Kit | `heat_kit` | NO | Heat pump systems only |
| Heat Kit Price | `heat_kit_price` | NO | Heat pump systems only |
| System Price | `system_price` | NO | Auto-calculated if blank |
| SEER2 | `seer2` | NO | |
| EER2 | `eer2` | NO | |
| HSPF2 | `hspf2` | NO | Heat pump systems only |
| Capacity (BTU/h) | `capacity_btuh` | NO | |
| Notes | `notes` | NO | |

**Deprecated Columns:** If an import file contains the old `Furnace/Air Handler Model` column, a warning will be shown suggesting the new format.

---

## TypeScript Interfaces

```typescript
interface EquipmentSystem {
  id: string;
  system_name: string;
  system_type: 'ducted' | 'mini_split';
  heating_source: 'gas_furnace' | 'heat_pump' | null;
  tonnage: number | null;
  ahri_number: string | null;
  capacity_btuh: number | null;
  
  // Outdoor unit
  condenser_heat_pump_model: string | null;
  condenser_price: number | null;
  
  // Furnace (gas systems only)
  furnace_model: string | null;
  furnace_price: number | null;
  furnace_btu_input: number | null;
  furnace_afue: number | null;
  
  // Air handler (heat pump systems only)
  air_handler_model: string | null;
  air_handler_price: number | null;
  air_handler_cfm: number | null;
  
  // Common equipment
  evap_coil_model: string | null;
  evap_coil_price: number | null;
  heat_kit: string | null;
  heat_kit_price: number | null;
  
  // Efficiency ratings
  seer2: number | null;
  eer2: number | null;
  hspf2: number | null;
  
  // Calculated total
  system_price: number | null;
  
  // Meta
  notes: string | null;
  needs_migration_review: boolean;
  created_at: string;
  updated_at: string;
  
  // Deprecated (for migration compatibility)
  furnace_air_handler_model?: string | null;
  furnace_air_handler_price?: number | null;
  furnace_air_handler_size?: string | null;
}

interface PriceBook {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  category: string | null;
  uploaded_at: string;
  uploaded_by: string | null;
}
```

---

## Usage Examples

### Fetch Equipment Systems

```typescript
import { supabase } from "@/integrations/supabase/client";

// Get all ducted gas furnace systems
const { data, error } = await supabase
  .from('equipment_systems')
  .select('*')
  .eq('system_type', 'ducted')
  .eq('heating_source', 'gas_furnace')
  .order('tonnage', { ascending: true });

// Get all heat pump systems
const { data, error } = await supabase
  .from('equipment_systems')
  .select('*')
  .eq('heating_source', 'heat_pump')
  .order('tonnage', { ascending: true });

// Search by model number (includes new fields)
const { data, error } = await supabase
  .from('equipment_systems')
  .select('*')
  .or('condenser_heat_pump_model.ilike.%GSZ14%,furnace_model.ilike.%GSZ14%,air_handler_model.ilike.%GSZ14%');
```

### Upload Price Book

```typescript
// 1. Upload file to storage
const { data: uploadData, error: uploadError } = await supabase.storage
  .from('price-books')
  .upload(`${Date.now()}-${file.name}`, file);

// 2. Create database record
const { error: insertError } = await supabase
  .from('price_books')
  .insert({
    file_name: file.name,
    file_path: uploadData.path,
    file_size: file.size,
    category: 'Manufacturer Pricing',
  });
```

### Download Price Book

```typescript
const { data, error } = await supabase.storage
  .from('price-books')
  .download(priceBook.file_path);
```

---

## Data Migration

For existing records using deprecated fields:

1. Records with `needs_migration_review = true` appear highlighted in the admin UI with a warning icon
2. Edit each record to:
   - Set the `heating_source` field (`gas_furnace` or `heat_pump`)
   - Move data from deprecated fields to the appropriate new fields
3. Saving automatically sets `needs_migration_review = false`

---

## Related Files

| File | Purpose |
|------|---------|
| `src/pages/admin/SystemPricing.tsx` | Admin UI for managing systems and price books |
| `src/integrations/supabase/types.ts` | Auto-generated TypeScript types |

---

## Notes

- All prices are stored as `numeric` for precision in financial calculations
- The `system_price` field is auto-calculated based on component prices
- Gas furnace systems show SEER2 and EER2 ratings only
- Heat pump systems show SEER2, EER2, and HSPF2 ratings
- Equipment systems support both ducted and ductless (mini-split) types
- Price books are stored privately and require admin authentication to access
