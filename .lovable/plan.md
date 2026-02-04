

## Add Notes Field to Estimator Customer Info Steps

### Overview

Add an optional "Additional Notes" textarea to both the Ductless and Ducted estimator customer information steps. This field will appear after the address section and prompt customers to share:
- Details about their current HVAC setup
- Hot and cold spots in their home
- Unusual noises or issues
- Dust and allergen concerns
- Any coupon codes from ads

---

### Files to Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/pages/estimators/ductless/types/index.ts` | MODIFY | Add `notes` field to CustomerInfo interface |
| `src/pages/estimators/ductless/context/QuoteContext.tsx` | MODIFY | Initialize `notes` field in INITIAL_CUSTOMER_INFO |
| `src/pages/estimators/ductless/steps/CustomerInfoStep.tsx` | MODIFY | Add notes textarea after address fields |
| `src/pages/estimators/ductless/steps/QuoteSummary.tsx` | MODIFY | Include notes in submission data and GHL sync |
| `src/pages/estimators/ducted/types/index.ts` | MODIFY | Add `notes` field to CustomerInfo interface |
| `src/pages/estimators/ducted/context/EstimatorContext.tsx` | MODIFY | Initialize `notes` field |
| `src/pages/estimators/ducted/steps/Step8CustomerInfo.tsx` | MODIFY | Add notes textarea after address fields |
| `src/pages/estimators/ducted/steps/Step10QuoteResults.tsx` | MODIFY | Include notes in submission and GHL sync |
| `supabase/functions/sync-ghl-contact/index.ts` | MODIFY | Add `notes` field to ContactData and map to GHL custom field |

---

### UI Design: Notes Field

The notes section will appear after the City/State/ZIP row with a helpful prompt:

```
┌─────────────────────────────────────────────────────────────────┐
│ City        State    ZIP                                        │
│ [Dallas   ] [TX]     [75248]                                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 📝 Additional Notes (Optional)                                  │
├─────────────────────────────────────────────────────────────────┤
│ Help us prepare for your visit by sharing:                      │
│ • Your current HVAC setup (brand, age, type)                    │
│ • Hot/cold spots or comfort issues                              │
│ • Unusual noises or concerns                                    │
│ • Any promo codes from our ads                                  │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │                                                             │ │
│ │                                                             │ │
│ │ Placeholder: "e.g., My AC is 15 years old and the upstairs │ │
│ │ bedroom is always too hot. I saw your SUMMER100 code..."   │ │
│ │                                                             │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

### Implementation Details

#### 1. Type Updates

**Ductless types** (`src/pages/estimators/ductless/types/index.ts`):
```typescript
export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  // ... existing fields
  notes?: string;  // NEW: Optional customer notes
}
```

**Ducted types** (`src/pages/estimators/ducted/types/index.ts`):
```typescript
export interface CustomerInfo {
  // ... existing fields
  notes?: string;  // NEW: Optional customer notes
}
```

#### 2. Context Updates

Initialize the notes field as empty string in both contexts.

#### 3. CustomerInfoStep UI Component

Add after the City/State/ZIP row:

```tsx
import { Textarea } from "@/components/ui/textarea";
import { FileText } from "lucide-react";

// After the address grid...
{/* Additional Notes */}
<div className="grid gap-2 mt-5">
  <Label htmlFor="notes" className="flex items-center gap-2">
    <FileText className="h-4 w-4 text-muted-foreground" />
    Additional Notes <span className="text-muted-foreground text-xs">(Optional)</span>
  </Label>
  <p className="text-xs text-muted-foreground mb-2">
    Help us prepare by sharing details about your current setup, comfort issues 
    (hot/cold spots, noises, dust/allergens), or any promo codes from our ads.
  </p>
  <Textarea
    id="notes"
    value={state.customerInfo.notes || ""}
    onChange={(e) => setCustomerInfo({ notes: e.target.value })}
    placeholder="e.g., My AC is 15 years old and making a strange noise. The upstairs bedroom is always too hot in summer. I saw promo code SUMMER100 in your ad..."
    rows={4}
    maxLength={1000}
    className="resize-none"
  />
  <p className="text-xs text-muted-foreground text-right">
    {(state.customerInfo.notes?.length || 0)}/1000
  </p>
</div>
```

#### 4. Submission Data Updates

Include notes in the database submission:

```typescript
// In QuoteSummary.tsx / Step10QuoteResults.tsx
const submissionData = {
  // ... existing fields
  customer_notes: state.customerInfo.notes?.trim() || null,
};
```

#### 5. GHL Sync Updates

**Edge function** (`sync-ghl-contact/index.ts`):
```typescript
interface ContactData {
  // ... existing fields
  notes?: string;
}

// In the custom fields mapping
if (contactData.notes) {
  customFields.push({
    key: 'customer_notes',
    field_value: contactData.notes,
  });
}
```

**Estimator payloads**:
```typescript
// Add to the GHL sync body
notes: state.customerInfo.notes || undefined,
```

---

### Database Consideration

The notes can be stored in the existing `customer_address` or a new column. Options:

**Option A (Simpler):** Store in existing JSON/text columns
- Ductless: Add to `selected_rooms` JSON or create `customer_notes` column
- Ducted: Already has flexible structure

**Option B (Recommended):** Add `customer_notes` column to both tables

```sql
ALTER TABLE ductless_estimate_submissions 
ADD COLUMN customer_notes TEXT;

ALTER TABLE ducted_estimate_submissions 
ADD COLUMN customer_notes TEXT;
```

---

### GHL Custom Field Requirement

A custom field should be created in GHL:

| Field Key | Field Name | Field Type |
|-----------|------------|------------|
| `customer_notes` | Customer Notes | Multi-Line Text |

---

### Testing Checklist

1. Fill out ductless estimator with notes - verify notes appear in submission
2. Fill out ducted estimator with notes - verify notes appear in submission
3. Verify notes sync to GHL custom field
4. Test with empty notes (should not break anything)
5. Test character limit (1000 chars)
6. Verify notes appear in admin submission detail view

