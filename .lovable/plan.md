
# Add County Appraisal District Links

## Summary
Add a collapsible section with quick links to county appraisal district websites. This provides a manual fallback when the RentCast API doesn't return property data.

## Location in UI
The links will appear in the **Property Details** section, right below the "Lookup Property Data" button and property data source indicator. They'll be styled as small, subtle links so they don't clutter the form.

## Counties Included

| County | Appraisal District URL |
|--------|------------------------|
| Dallas | dallascad.org |
| Collin | collincad.org |
| Denton | dentoncad.com |
| Tarrant | tad.org |
| Rockwall | rockwallcad.com |
| Hunt | hunt-cad.org |
| Kaufman | kaufman-cad.org |
| Grayson | graysonappraisal.org |

## Design
- Small text with "Can't find data? Try these appraisal districts:" header
- Horizontal list of county links that wrap on mobile
- Links open in new tab
- Subtle styling (muted text, small font) so it doesn't distract from main form

## Technical Changes

**File: `src/components/admin/locations/AddLocationDialog.tsx`**

Add a constant for county appraisal links at the top of the file:
```typescript
const COUNTY_APPRAISAL_LINKS = [
  { county: 'Dallas', url: 'https://www.dallascad.org' },
  { county: 'Collin', url: 'https://www.collincad.org' },
  { county: 'Denton', url: 'https://www.dentoncad.com' },
  { county: 'Tarrant', url: 'https://www.tad.org' },
  { county: 'Rockwall', url: 'https://www.rockwallcad.com' },
  { county: 'Hunt', url: 'https://www.hunt-cad.org' },
  { county: 'Kaufman', url: 'https://www.kaufman-cad.org' },
  { county: 'Grayson', url: 'https://www.graysonappraisal.org' },
];
```

Add the links section in the JSX after the property data source display (around line 740):
```tsx
{/* County Appraisal District Links */}
<div className="text-xs text-muted-foreground mt-2 pt-2 border-t">
  <p className="mb-1">Can't find data? Try these appraisal districts:</p>
  <div className="flex flex-wrap gap-x-3 gap-y-1">
    {COUNTY_APPRAISAL_LINKS.map(({ county, url }) => (
      <a
        key={county}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:underline"
      >
        {county}
      </a>
    ))}
  </div>
</div>
```

## Files Modified

| File | Changes |
|------|---------|
| `src/components/admin/locations/AddLocationDialog.tsx` | Add county links constant + render links section |

## Result
After implementation, users will see a row of county appraisal district links at the bottom of the Property Details section. Clicking any link opens that county's appraisal website in a new tab where they can manually look up property information.
