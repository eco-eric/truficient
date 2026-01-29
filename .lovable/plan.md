
## Ducted Estimator Flow Restructuring

### Summary of Changes

You want to:
1. Move the customer info form from Step 9 to a new Step 6 (collecting contact info earlier)
2. Keep Step 8 but show a read-only summary of customer info instead of the form
3. Auto-populate the ZIP code from the initial entry
4. Add abandoned cart capture after the new customer info step

This is all possible and a great approach for lead capture!

---

### Current vs New Step Flow

| Step | Current Flow | New Flow |
|------|--------------|----------|
| 0 | ZIP Code Gate | ZIP Code Gate |
| 1 | Home Type | Home Type |
| 2 | Home Details | Home Details |
| 3 | Insulation Factors | Insulation Factors |
| 4 | Usage Patterns | Usage Patterns |
| 5 | Heating Type | Heating Type |
| 6 | System Size | **Customer Info Form** (NEW) |
| 7 | Efficiency Tier | System Size |
| 8 | Quote Results | Efficiency Tier |
| 9 | Customer Info Form | Quote Results (with read-only customer summary) |
| 10 | Thank You | Thank You |

---

### Implementation Details

#### 1. Create New Step 6: Customer Info Form (Early Capture)

A new step file `Step6CustomerInfo.tsx` that contains:
- Name, Email, Phone, Address fields (the form portion only)
- ZIP code auto-populated from state.zipCode
- City auto-populated from state.zipCity
- No pricing display (just the form)
- Validation before proceeding

#### 2. Rename/Shift Existing Steps

| Old File | New File |
|----------|----------|
| Step6SystemSize.tsx | Step7SystemSize.tsx |
| Step7EfficiencyTier.tsx | Step8EfficiencyTier.tsx |
| Step8QuoteResults.tsx | Step9QuoteResults.tsx |
| Step9CustomerInfo.tsx | Refactored to Step9QuoteResults |
| Step10ThankYou.tsx | Step10ThankYou.tsx (no change) |

#### 3. Modify Step 9 (Quote Results) to Show Read-Only Customer Summary

Add a read-only card at the bottom of the quote results showing:
- Customer name
- Email
- Phone
- Address

With an "Edit" button that navigates back to Step 6 if they need to change info.

#### 4. Abandoned Cart Capture Strategy

After Step 6 (customer info), we have valid contact details. Two options:

**Option A: Save as "partial" submission immediately (Recommended)**
- Insert a database record with `status: 'partial'` right after Step 6
- Include all home details + customer info collected so far
- If they complete the full flow, update the record to `status: 'new'`
- This gives you a list of abandoned carts in the admin panel

**Option B: Browser-based capture with beforeunload**
- Store customer info in localStorage
- On page unload, trigger an API call to save partial data
- Less reliable than Option A

I recommend **Option A** for reliability.

---

### Database Changes

Add a new status value to track partial submissions:
- Add `status: 'partial'` option alongside 'new', 'contacted', etc.
- This allows filtering abandoned carts in the admin panel

---

### Files to Create/Modify

| File | Action |
|------|--------|
| `src/pages/estimators/ducted/steps/Step6CustomerInfo.tsx` | **Create** - New customer info form step |
| `src/pages/estimators/ducted/steps/Step7SystemSize.tsx` | **Rename** from Step6 + update step number |
| `src/pages/estimators/ducted/steps/Step8EfficiencyTier.tsx` | **Rename** from Step7 + update step number |
| `src/pages/estimators/ducted/steps/Step9QuoteResults.tsx` | **Rename** from Step8 + add read-only customer summary |
| `src/pages/estimators/ducted/steps/Step10ThankYou.tsx` | No change (already correct step number) |
| `src/pages/estimators/ducted/steps/Step9CustomerInfo.tsx` | **Delete** (form moves to Step6, submission logic moves to Step9) |
| `src/pages/estimators/ducted/DuctedEstimator.tsx` | Update step labels and switch statement |
| `src/pages/estimators/ducted/context/EstimatorContext.tsx` | Add `partialSubmissionId` to track if we already saved a partial |

---

### New Step 6 Customer Info Features

- Auto-populate ZIP from `state.zipCode`
- Auto-populate City from `state.zipCity`
- State locked to "TX"
- Form validation same as current
- On "Continue" - save partial submission to database, then proceed

---

### Step 9 Quote Results Updates

After showing the quote and equipment options, add:

```
┌─────────────────────────────────────────┐
│ Your Contact Information                │
│                                         │
│ Name: John Smith                        │
│ Email: john@example.com                 │
│ Phone: (555) 123-4567                   │
│ Address: 123 Main St, Dallas, TX 75248  │
│                                         │
│                          [Edit] button  │
└─────────────────────────────────────────┘
```

The "Edit" button navigates back to Step 6.

---

### Submission Flow Update

1. **Step 6 (Customer Info)**: Save partial submission with status `'partial'`
2. **Step 9 (Quote Results)**: "Get Your Quote" button proceeds to Step 10
3. **Step 10 (Thank You)**: Before showing thank you:
   - Update the partial submission with final quote details
   - Change status from `'partial'` to `'new'`
   - Trigger GHL sync and notifications

This ensures you capture leads even if they abandon after providing contact info.

---

### Progress Labels Update

```typescript
const STEP_LABELS = [
  "Location",      // 0
  "Home Type",     // 1
  "Home Details",  // 2
  "Insulation",    // 3
  "Comfort",       // 4
  "Heating Type",  // 5
  "Contact Info",  // 6 (NEW)
  "System Size",   // 7
  "Efficiency",    // 8
  "Your Quote",    // 9
  "Thank You",     // 10
];
```

---

### Admin Panel Enhancement (Optional)

The existing submissions table will automatically show partial submissions. You could add:
- A filter for "Abandoned" (status = 'partial')
- Visual indicator for incomplete submissions
- Re-engagement actions

---

### Summary

This restructuring:
1. Captures customer info earlier (Step 6)
2. Creates a partial submission immediately for abandoned cart tracking
3. Shows a read-only summary in the quote step for confirmation
4. Auto-populates ZIP from the initial entry
5. Maintains the full quote flow with all current functionality
