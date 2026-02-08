# CRM Locations Management - Implementation Guide
## Truficient Admin Dashboard

> **Feature:** Customer location management with Google Maps and property data lookup  
> **Created:** February 2026  
> **Integrates With:** Existing CRM System (crm_customers, crm_locations)

---

## Overview

This implementation **enhances** your existing CRM locations system with:

✅ Google Places address autocomplete
✅ Interactive Google Maps display
✅ **"Lookup Property Data" button** (manual trigger)
✅ County auto-population
✅ Equipment tracking per location
✅ Service history management

**Important:** This builds on the existing `crm_locations` table documented in CRM-SYSTEM.md

---

## Quick Start (30 minutes)

### 1. Google Maps API Setup (5 min)

1. [Google Cloud Console](https://console.cloud.google.com/)
2. Enable: Maps JavaScript API, Places API, Maps Embed API, Geocoding API
3. Create API Key & restrict to your domains
4. Add to `.env`:
```env
VITE_GOOGLE_MAPS_API_KEY=your_key_here
```
5. Add to Supabase:
```bash
supabase secrets set GOOGLE_MAPS_API_KEY=your_key_here
```

### 2. Run Database Migration (5 min)

File: `supabase_migration_crm_locations.sql`

This migration:
- Adds missing columns to existing `crm_locations` table (if it exists)
- Creates `crm_location_equipment` table
- Creates `crm_location_service_history` table
- Adds indexes and RLS policies

**Run in Supabase SQL Editor**

### 3. Deploy Edge Function (5 min)

```bash
# Create directory
mkdir -p supabase/functions/lookup-property-data

# Copy edge function code (provided separately)
# File: lookup_property_data_edge_function.ts
cp lookup_property_data_edge_function.ts supabase/functions/lookup-property-data/index.ts

# Deploy
supabase functions deploy lookup-property-data
```

### 4. Copy React Components (10 min)

Files to copy to your Lovable project:

```
src/
├── types/
│   └── crmLocations.ts          ← Type definitions
├── pages/
│   └── admin/
│       └── Locations.tsx         ← Main locations page
└── components/
    └── admin/
        └── locations/
            ├── AddLocationDialog.tsx
            ├── LocationDetailsDialog.tsx
            ├── GooglePlacesAutocomplete.tsx
            └── LocationMapEmbed.tsx
```

### 5. Update Navigation (5 min)

**File:** `src/components/admin/adminNavConfig.ts`

Add to **System** section (or create **CRM** section):

```typescript
{
  title: "Locations",
  icon: MapPin, // from lucide-react
  href: "/admin/locations",
  requiredRole: "admin"
}
```

**File:** Router configuration

```typescript
<Route path="/admin/locations" element={<Locations />} />
```

---

## Database Structure

### Enhanced crm_locations Table

**New columns added** (via ALTER TABLE in migration):

| Column | Type | Purpose |
|--------|------|---------|
| `google_place_id` | TEXT | Google Places reference |
| `formatted_address` | TEXT | Full formatted address |
| `latitude` | DECIMAL(10,8) | GPS coordinates |
| `longitude` | DECIMAL(11,8) | GPS coordinates |
| `lot_size_sqft` | INTEGER | Lot size |
| `bedrooms` | INTEGER | Number of bedrooms |
| `bathrooms` | DECIMAL(3,1) | Number of bathrooms |
| `gate_code` | TEXT | Gate/access code |
| `access_notes` | TEXT | Special access instructions |
| `parking_instructions` | TEXT | Where to park |
| `property_data_source` | TEXT | Data source tracking |
| `property_data_updated_at` | TIMESTAMPTZ | Last lookup timestamp |

**Existing columns** (already in crm_locations):
- customer_id, location_name, location_type, building_type
- address_line1, address_line2, city, county, state, zip_code
- square_footage, year_built, stories
- is_primary, is_active
- created_at, updated_at

### New Tables

**crm_location_equipment** - HVAC equipment at locations
**crm_location_service_history** - Service records

See migration SQL for full schemas.

---

## Property Data Lookup - How It Works

### Button-Triggered Lookup Flow

```
User enters/selects address
        ↓
User clicks "Lookup Property Data" button
        ↓
Edge function queries free APIs:
  1. US Census/ACS (year built estimates)
  2. Google Geocoding (county extraction)  
  3. County Assessor APIs (DFW - future)
        ↓
Returns best available data
        ↓
Form fields auto-fill (user can override)
        ↓
Save to database
```

### Data Sources & Accuracy

| Source | Data Provided | Accuracy | Cost |
|--------|--------------|----------|------|
| US Census ACS | Year built (ZIP avg) | Low (neighborhood) | FREE |
| Google Geocoding | County | High | FREE |
| County Assessors | Sq ft, year, stories | High (official) | FREE (future) |

**Current limitations:**
- Census data is neighborhood averages, not property-specific
- Not all properties will return data
- Manual entry always available as fallback

### Future Enhancements (Optional)

To add paid APIs for better automated data:

**ATTOM Data API** - $0.10-0.50/lookup
- 158 million properties
- Exact sq ft, year built, stories, lot size
- [attomdata.com](https://www.attomdata.com/)

**Estated API** - Varies
- 150+ data points per property
- [estated.com](https://estated.com/)

---

## Component Details

### Main Page: Locations.tsx

Features:
- Location list with filters (search, customer, type)
- Stats cards (total, residential, commercial, primary)
- Add/edit/delete locations
- View details dialog
- Integration with existing CRM customers

### AddLocationDialog.tsx

Features:
- Customer selection dropdown
- "Use Billing Address" quick-fill
- Google Places autocomplete
- **"Lookup Property Data" button**
- Google Maps preview
- Property details fields
- Access information (gate code, notes, parking)
- Primary location checkbox

### LocationMapEmbed.tsx

Displays:
- Interactive Google Map
- Address marker
- Coordinates display
- Link to open in Google Maps

### GooglePlacesAutocomplete.tsx

Provides:
- Address search as you type
- Auto-fills all address fields
- Extracts county from Google
- Sets lat/lng for map display

---

## Integration Points

### With Existing CRM Customers

```typescript
// Locations page fetches customers
const { data: customers } = useQuery({
  queryKey: ['crm_customers'],
  queryFn: async () => {
    const { data } = await supabase
      .from('crm_customers')
      .select('*')
      .order('last_name');
    return data;
  },
});

// Locations joined with customers
const { data: locations } = useQuery({
  queryKey: ['crm_locations'],
  queryFn: async () => {
    const { data } = await supabase
      .from('crm_locations')
      .select(`
        *,
        customer:crm_customers(*)
      `);
    return data;
  },
});
```

### With Jobs System (Future)

Jobs reference locations via `location_id`:

```sql
SELECT 
  j.*,
  l.address_line1,
  l.city,
  l.gate_code,
  l.access_notes
FROM crm_jobs j
JOIN crm_locations l ON j.location_id = l.id
WHERE j.id = $1;
```

Techs can see:
- Service address
- Gate codes
- Parking instructions
- Equipment at location

---

## API Costs (Current Implementation)

**Total: $0/month**

Google Maps APIs (FREE tier):
- Maps JavaScript API: $200 credit/month
- Places Autocomplete: $200 credit/month
- Maps Embed: Unlimited FREE
- Geocoding: $200 credit/month

Typical usage (100 locations/month):
- Autocomplete: ~100 requests = ~$5 credit used
- Maps display: FREE (embed)
- Geocoding: ~100 requests = ~$5 credit used
- **Total: ~$10 credit used of $200 available = $0 cost**

For 1,000 locations/month:
- Still within free tier (~$100 credit used)
- Actual cost: $0

**Only pay if you exceed $200/month in API calls**

---

## Testing Checklist

### 1. Database Migration
- [ ] Run SQL migration
- [ ] Verify crm_locations has new columns
- [ ] Verify crm_location_equipment table exists
- [ ] Check RLS policies enabled

### 2. Edge Function
- [ ] Function deployed
- [ ] GOOGLE_MAPS_API_KEY secret set
- [ ] Test manual invocation

### 3. Frontend
- [ ] Components copied to correct paths
- [ ] Types file imported correctly
- [ ] Navigation link works
- [ ] Route renders page

### 4. End-to-End Test
- [ ] Open /admin/locations
- [ ] Click "Add Location"
- [ ] Select customer
- [ ] Type address (autocomplete works)
- [ ] Address auto-fills
- [ ] County populates
- [ ] Map displays
- [ ] Click "Lookup Property Data"
- [ ] Data fills (or error handled gracefully)
- [ ] Manually edit fields
- [ ] Save location
- [ ] Location appears in list
- [ ] View location details
- [ ] Delete test location

---

## Troubleshooting

### Maps Not Loading
**Issue:** "Loading Google Maps..." indefinitely

**Fix:**
1. Check VITE_GOOGLE_MAPS_API_KEY in .env
2. Verify APIs enabled in Google Cloud Console
3. Check browser console for errors
4. Verify API key domain restrictions

### County Not Auto-Populating
**Issue:** County field empty after address selection

**Expected:** This is normal - only Google Places autocomplete sets county
**Workaround:** Manually enter county if not populated

### Property Lookup Returns No Data
**Issue:** "No Data Found" after clicking button

**Expected Behavior:** Free APIs have limited coverage
**Solution:** 
- Manually enter property details
- Or: Implement paid API (ATTOM, Estated)
- Data not required to save location

### Edge Function Error
**Issue:** Property lookup fails

**Debug:**
1. Check Supabase function logs
2. Verify GOOGLE_MAPS_API_KEY secret set
3. Check function deployment status
4. Test with curl/Postman

---

## File Reference

| File | Destination | Purpose |
|------|------------|---------|
| `supabase_migration_crm_locations.sql` | Supabase SQL Editor | Database schema |
| `lookup_property_data_edge_function.ts` | `supabase/functions/lookup-property-data/index.ts` | Property lookup logic |
| `crmLocations_types.ts` | `src/types/crmLocations.ts` | TypeScript types |
| `Locations_page.tsx` | `src/pages/admin/Locations.tsx` | Main page |
| `AddLocationDialog.tsx` | `src/components/admin/locations/` | Add dialog |
| `LocationDetailsDialog.tsx` | `src/components/admin/locations/` | View dialog |
| `GooglePlacesAutocomplete.tsx` | `src/components/admin/locations/` | Address search |
| `LocationMapEmbed.tsx` | `src/components/admin/locations/` | Map display |

---

## Next Steps

After basic implementation:

1. **Equipment Management** - Track HVAC units per location
2. **Service History** - Log maintenance and repairs
3. **County Assessor Integration** - Add DFW county APIs for better data
4. **Photo Uploads** - Add location and equipment photos
5. **WorkEdge Integration** - Sync with field app
6. **Paid API Option** - Implement ATTOM/Estated for automation

---

## Support

Questions or need help with:
- County assessor API integration (Dallas CAD, Collin CAD, etc.)
- Paid property data APIs (ATTOM, Estated)
- Equipment management features
- Service history tracking
- Mobile optimization
- WorkEdge.pro integration

Just ask!

---

## Summary

**What You're Getting:**
- ✅ Google Maps integration for locations
- ✅ Property lookup button (manual trigger)
- ✅ Equipment and service tracking tables
- ✅ FREE implementation (no monthly costs)
- ✅ Integrates with existing CRM system
- ✅ Ready for future enhancements

**Time to Implement:** 30 minutes  
**Cost:** $0/month  
**Maintenance:** Minimal
