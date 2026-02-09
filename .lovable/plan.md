

# Job Detail Page Enhancements

## 1. Inline Notes Editing

Currently the Notes card (lines 396-416) only appears when notes already exist, with no way to add them from the detail page.

**Changes to `src/pages/admin/JobDetail.tsx`:**
- Remove the conditional wrapper so the Notes card always shows
- Add `useState` for `internalNotes` and `customerNotes`, initialized from `job` data
- Replace static text with `Textarea` fields
- Add a "Save Notes" button with a `useMutation` that updates `crm_jobs.internal_notes` and `crm_jobs.customer_notes`

---

## 2. Job Location -- Clickable + Changeable from Customer Locations

Currently the location section (lines 329-344) shows a static address with no interaction.

**Changes to `src/pages/admin/JobDetail.tsx`:**
- Add a query to fetch all `crm_locations` where `customer_id` matches the job's customer
- Make the current location address clickable -- opens Google Maps in a new tab
- Add a dropdown/select below to change the job's location to any of the customer's locations
- Add a mutation to update `crm_jobs.location_id`

---

## 3. WorkEdge "Open" Link in Empty Media State

Currently the "Open in WorkEdge" button (lines 331-345 of WorkEdgePanel) only shows when media exists. When media is empty (lines 263-275), there's no link.

**Changes to `src/components/admin/jobs/WorkEdgePanel.tsx`:**
- Add the "Open in WorkEdge" link button to the empty media state (after the "Sync from WorkEdge" button)

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/admin/JobDetail.tsx` | Always-visible notes with inline editing; customer locations query + dropdown; clickable location link |
| `src/components/admin/jobs/WorkEdgePanel.tsx` | Add "Open in WorkEdge" button to empty media state |

---

## Technical Details

### Notes Mutation
```typescript
const updateNotesMutation = useMutation({
  mutationFn: async (notes: { internal_notes: string; customer_notes: string }) => {
    const { error } = await supabase.from('crm_jobs').update(notes).eq('id', id);
    if (error) throw error;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['crm_job', id] });
    toast.success('Notes saved');
  }
});
```

### Customer Locations Query
```typescript
const { data: customerLocations = [] } = useQuery({
  queryKey: ['crm_locations_for_customer', job?.customer?.id],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('crm_locations')
      .select('id, address_line1, city, state, zip_code, is_primary')
      .eq('customer_id', job.customer.id)
      .is('deleted_at', null);
    if (error) throw error;
    return data;
  },
  enabled: !!job?.customer?.id
});
```

### Update Location Mutation
```typescript
const updateLocationMutation = useMutation({
  mutationFn: async (locationId: string) => {
    const { error } = await supabase.from('crm_jobs').update({ location_id: locationId }).eq('id', id);
    if (error) throw error;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['crm_job', id] });
    toast.success('Job location updated');
  }
});
```

### Clickable Location
The current location address will open Google Maps when clicked:
```tsx
<a
  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`}
  target="_blank"
  rel="noopener noreferrer"
  className="hover:underline cursor-pointer"
>
  {job.location.address_line1}
</a>
```

