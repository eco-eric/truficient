
# Add County Field to Location Form

## Current State

The `county` field already exists in:
- Database schema (`crm_locations.county`)
- Form state (line 89: `const [county, setCounty] = useState('')`)
- Reset function (line 151)
- Address selection handler (line 169: `setCounty(components.county)`)
- Save payload (line 252)

**Missing**: A visible input field in the form UI to display and edit the county value.

---

## Change Required

Add a County input field to the address section of the form, between the City/State/ZIP row and the Sq Ft/Year Built/Stories row.

### File: `src/pages/admin/Locations.tsx`

**Location**: After line 626 (closing of City/State/ZIP grid), before line 628 (TooltipProvider)

Add:
```typescript
<div className="space-y-2">
  <Label>County</Label>
  <Input
    value={county}
    onChange={(e) => setCounty(e.target.value)}
    placeholder="e.g., Dallas County"
  />
</div>
```

### Additional Updates

1. **Edit handler** (line 226): Load county from existing location
   ```typescript
   setCounty(location.county || '');
   ```

2. **Table display** (optional): Show county in the locations table for reference

---

## UI Preview

```text
┌─────────────────────────────────────────────────────────────────────┐
│ City *              State *           ZIP *                         │
│ ┌───────────────┐   ┌───────────────┐ ┌───────────────┐            │
│ │ Dallas        │   │ TX            │ │ 75201         │            │
│ └───────────────┘   └───────────────┘ └───────────────┘            │
│                                                                     │
│ County                                            ← NEW FIELD       │
│ ┌─────────────────────────────────────────────────────────────────┐│
│ │ Dallas County                                                   ││
│ └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│ Sq Ft                Year Built              Stories                │
│ ┌───────────────┐   ┌───────────────┐ ┌───────────────┐            │
│ │ 2,450  [Auto] │   │ 1998  [Auto]  │ │ 2     [Auto]  │            │
│ └───────────────┘   └───────────────┘ └───────────────┘            │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Benefits

| Benefit | Description |
|---------|-------------|
| **Visibility** | Users can see which county was auto-detected from Google Places |
| **Manual override** | Users can correct the county if autocomplete is wrong |
| **Property lookup** | County is used to route to the correct CAD API for property data |
| **Debugging** | Helps verify the property lookup is targeting the right county |

---

## Summary

| Change | Location |
|--------|----------|
| Add County input field | Lines 626-627 (new section) |
| Load county on edit | Line 226 (openEdit function) |
| Optional: Show in table | Add column to table display |
