# System Pricing Database Setup

Complete database documentation for the **System Pricing** admin feature, which manages HVAC equipment systems and price book PDFs.

---

## Overview

The System Pricing feature allows administrators to:
- Manage equipment systems with detailed specifications and pricing
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
| `tonnage` | numeric | YES | - | System capacity in tons |
| `ahri_number` | text | YES | - | AHRI certification number |
| `condenser_heat_pump_model` | text | YES | - | Outdoor unit model number |
| `furnace_air_handler_model` | text | YES | - | Indoor unit model number |
| `evap_coil_model` | text | YES | - | Evaporator coil model |
| `heat_kit` | text | YES | - | Electric heat kit model |
| `condenser_price` | numeric | YES | - | Outdoor unit cost |
| `furnace_air_handler_price` | numeric | YES | - | Indoor unit cost |
| `evap_coil_price` | numeric | YES | - | Evaporator coil cost |
| `heat_kit_price` | numeric | YES | - | Heat kit cost |
| `system_price` | numeric | YES | - | Total calculated system price |
| `seer2` | numeric | YES | - | SEER2 efficiency rating |
| `eer2` | numeric | YES | - | EER2 efficiency rating |
| `hspf2` | numeric | YES | - | HSPF2 heating efficiency |
| `capacity_btuh` | integer | YES | - | Capacity in BTU/hour |
| `furnace_air_handler_size` | text | YES | - | Size specification |
| `notes` | text | YES | - | Admin notes |
| `created_at` | timestamptz | NO | `now()` | Record creation timestamp |
| `updated_at` | timestamptz | NO | `now()` | Last modification timestamp |

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

## Row Level Security (RLS) Policies

### `equipment_systems` Policies

| Policy Name | Operation | Using/With Check |
|-------------|-----------|------------------|
| `Admins can view equipment systems` | SELECT | `has_role(auth.uid(), 'admin')` |
| `Admins can create equipment systems` | INSERT | `has_role(auth.uid(), 'admin')` |
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

### Create `equipment_systems` Table

```sql
CREATE TABLE public.equipment_systems (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  system_name TEXT NOT NULL,
  system_type TEXT NOT NULL,
  tonnage NUMERIC,
  ahri_number TEXT,
  condenser_heat_pump_model TEXT,
  furnace_air_handler_model TEXT,
  evap_coil_model TEXT,
  heat_kit TEXT,
  condenser_price NUMERIC,
  furnace_air_handler_price NUMERIC,
  evap_coil_price NUMERIC,
  heat_kit_price NUMERIC,
  system_price NUMERIC,
  seer2 NUMERIC,
  eer2 NUMERIC,
  hspf2 NUMERIC,
  capacity_btuh INTEGER,
  furnace_air_handler_size TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.equipment_systems ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can view equipment systems"
  ON public.equipment_systems FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create equipment systems"
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

| Excel Column | Database Column | Required |
|--------------|-----------------|----------|
| System Name | `system_name` | YES |
| System Type | `system_type` | YES |
| Tonnage | `tonnage` | NO |
| AHRI Number | `ahri_number` | NO |
| Condenser/Heat Pump Model | `condenser_heat_pump_model` | NO |
| Furnace/Air Handler Model | `furnace_air_handler_model` | NO |
| Evap Coil Model | `evap_coil_model` | NO |
| Heat Kit | `heat_kit` | NO |
| Condenser Price | `condenser_price` | NO |
| Furnace/AH Price | `furnace_air_handler_price` | NO |
| Evap Coil Price | `evap_coil_price` | NO |
| Heat Kit Price | `heat_kit_price` | NO |
| System Price | `system_price` | NO |
| SEER2 | `seer2` | NO |
| EER2 | `eer2` | NO |
| HSPF2 | `hspf2` | NO |
| Capacity (BTU/h) | `capacity_btuh` | NO |
| Furnace/AH Size | `furnace_air_handler_size` | NO |
| Notes | `notes` | NO |

---

## TypeScript Interfaces

```typescript
interface EquipmentSystem {
  id: string;
  system_name: string;
  system_type: string;
  tonnage: number | null;
  ahri_number: string | null;
  condenser_heat_pump_model: string | null;
  furnace_air_handler_model: string | null;
  evap_coil_model: string | null;
  heat_kit: string | null;
  condenser_price: number | null;
  furnace_air_handler_price: number | null;
  evap_coil_price: number | null;
  heat_kit_price: number | null;
  system_price: number | null;
  seer2: number | null;
  eer2: number | null;
  hspf2: number | null;
  capacity_btuh: number | null;
  furnace_air_handler_size: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
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

// Get all ducted systems
const { data, error } = await supabase
  .from('equipment_systems')
  .select('*')
  .eq('system_type', 'ducted')
  .order('tonnage', { ascending: true });

// Search by model number
const { data, error } = await supabase
  .from('equipment_systems')
  .select('*')
  .ilike('condenser_heat_pump_model', '%GSZ14%');
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

## Related Files

| File | Purpose |
|------|---------|
| `src/pages/admin/SystemPricing.tsx` | Admin UI for managing systems and price books |
| `src/integrations/supabase/types.ts` | Auto-generated TypeScript types |

---

## Notes

- All prices are stored as `numeric` for precision in financial calculations
- The `system_price` field can be auto-calculated or manually set
- Equipment systems support both ducted and ductless (mini-split) types
- Price books are stored privately and require admin authentication to access
