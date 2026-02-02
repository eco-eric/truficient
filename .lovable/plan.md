

## Add Abandoned Cart View to Admin Dashboard

### Overview

Create a dedicated Abandoned Cart admin page at `/admin/abandoned-carts` that displays leads who started but didn't complete the ducted estimator flow. These are users who submitted their contact info (Step 8) but never completed the final quote submission (Step 10).

---

### Current State

| Component | Status |
|-----------|--------|
| Ducted partial submissions | ✅ Implemented - saves with `status: "partial"` at Step 8 |
| Ductless partial submissions | ❌ Not implemented - only saves on final submit |
| Admin view for partial leads | ❌ Missing - no dedicated abandoned cart page |
| Status filter in UnifiedSubmissions | Partial - "partial" not in status dropdown |

Currently, all 10 ducted submissions have `status: "new"`, meaning users have been completing the full flow. The "partial" status would appear when a user abandons after Step 8.

---

### Page Layout

```text
+----------------------------------------------------------+
|  Admin Sidebar  |  ABANDONED CARTS                        |
|                 |  [Search] [Date Range] [Source Filter]  |
+-----------------+-----------------------------------------+
|                 |                                         |
|  Overview       |  STATS CARDS                            |
|  Submissions    |  +--------+ +--------+ +--------+       |
|  > Abandoned ←  |  | Today  | | 7 Days | | 30 Days|       |
|  DFW Watch      |  +--------+ +--------+ +--------+       |
|                 |                                         |
|  Content        |  TABLE                                  |
|  ...            |  Date | Customer | Email | Phone |      |
|                 |        Home Details | Source | Actions  |
|                 |                                         |
|                 |  [Detail Sheet on Row Click]            |
|                 |                                         |
+-----------------+-----------------------------------------+
```

---

### Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/pages/admin/AbandonedCarts.tsx` | CREATE | New admin page |
| `src/App.tsx` | MODIFY | Add route `/admin/abandoned-carts` |
| `src/components/admin/adminNavConfig.ts` | MODIFY | Add nav item under Overview |
| `src/pages/admin/UnifiedSubmissions.tsx` | MODIFY | Add "partial" to status dropdown |

---

### Page Features

#### 1. Stats Summary Cards
Display counts for different time periods:
- **Today**: Abandoned carts from today
- **Last 7 Days**: Weekly view
- **Last 30 Days**: Monthly view
- **Total**: All-time partial submissions

#### 2. Data Table Columns
| Column | Content |
|--------|---------|
| Date | Created timestamp |
| Customer | Name (or "Not provided") |
| Contact | Email + Phone |
| Home Details | Type, Size, Heating preference |
| Source | Ducted / Ductless (future) |
| Age | Time since abandonment (e.g., "2 hours ago") |
| Actions | View details, Mark as contacted |

#### 3. Detail Sheet (Side Panel)
When clicking a row:
- Full customer info (name, email, phone, address)
- Home configuration captured
- Best time to call preference
- Quick actions: Mark contacted, Convert to full lead, Send follow-up

#### 4. Filters
- **Search**: By name, email, or phone
- **Date Range**: Today, Last 7 days, Last 30 days, Custom
- **Source**: Ducted, Ductless (when implemented)

#### 5. Status Actions
- **Mark as Contacted**: Change status to "contacted" 
- **Convert to Lead**: Change status to "new" (moves to main submissions)
- **Mark as Junk**: Filter out test/spam entries

---

### Component Structure

```typescript
// src/pages/admin/AbandonedCarts.tsx

const AbandonedCarts = () => {
  // Query ducted submissions with status = 'partial'
  const { data: ductedPartials } = useQuery({
    queryKey: ['abandoned-carts', 'ducted'],
    queryFn: async () => {
      const { data } = await supabase
        .from('ducted_estimate_submissions')
        .select('*')
        .eq('status', 'partial')
        .order('created_at', { ascending: false });
      return data;
    }
  });

  // Future: Add ductless when implemented
  // const { data: ductlessPartials } = useQuery({...});

  return (
    <AdminLayout title="Abandoned Carts">
      {/* Stats Cards */}
      {/* Filters */}
      {/* Data Table */}
      {/* Detail Sheet */}
    </AdminLayout>
  );
};
```

---

### Navigation Update

Add to `adminNavConfig.ts` under Overview section:

```typescript
{
  title: 'Overview',
  items: [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, adminOnly: false },
    { label: 'Submissions', href: '/admin/submissions', icon: FileText, adminOnly: false },
    { label: 'Abandoned Carts', href: '/admin/abandoned-carts', icon: ShoppingCart, adminOnly: true }, // NEW
    { label: 'DFW Watch List', href: '/admin/dfw-watchlist', icon: Target, adminOnly: true },
  ],
},
```

---

### Route Addition

```typescript
// In App.tsx
import AdminAbandonedCarts from "./pages/admin/AbandonedCarts";

// Add route
{ path: "/admin/abandoned-carts", element: <ProtectedRoute><AdminAbandonedCarts /></ProtectedRoute> },
```

---

### UnifiedSubmissions Enhancement

Add "partial" to the status filter dropdown:

```typescript
<SelectContent>
  <SelectItem value="all">All Statuses</SelectItem>
  <SelectItem value="new">New</SelectItem>
  <SelectItem value="partial">Partial (Abandoned)</SelectItem>  // NEW
  <SelectItem value="contacted">Contacted</SelectItem>
  ...
</SelectContent>
```

---

### Mobile Responsiveness

| Section | Desktop | Tablet | Mobile |
|---------|---------|--------|--------|
| Stats | 4 cols | 2 cols | 2 cols |
| Table | Full | Scrollable | Card view |
| Detail Sheet | Side panel | Side panel | Full screen |

---

### Future Enhancements (Not in this scope)

1. **Ductless Abandoned Cart Tracking**: Add partial submission logic to ductless CustomerInfoStep
2. **Automated Follow-up**: Integration with GHL for automatic follow-up emails/SMS
3. **Dashboard Widget**: Show abandoned cart count on main dashboard
4. **Time-based Alerts**: Highlight leads abandoned within last hour (high conversion potential)

---

### Key Implementation Details

1. **Query Filter**: Use `status = 'partial'` to fetch only incomplete submissions
2. **Age Calculation**: Use `date-fns` formatDistanceToNow for "2 hours ago" style display
3. **Status Updates**: Reuse existing mutation patterns from UnifiedSubmissions
4. **Styling**: Match existing admin page patterns (navy theme, card layouts)
5. **Empty State**: Friendly message when no abandoned carts exist

