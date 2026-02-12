

## Fix: Bach Assistant Chat Resets on Navigation

### Problem
The `AssistantProvider` (which holds all chat messages) lives inside `AdminLayout`. Since each admin page independently renders its own `<AdminLayout>`, navigating between pages unmounts and remounts the provider, destroying the conversation.

### Solution
Lift `AssistantProvider` out of `AdminLayout` and into a new persistent wrapper route for all admin pages.

### Technical Steps

**1. Create `AdminRouteLayout` component (new file)**
- A small wrapper component that renders `AssistantProvider` around an `<Outlet />`
- Also includes the `AssistantToggle` and `AIAssistantPanel` (moved from `AdminLayout`)
- This component stays mounted as long as you're on any `/admin/*` route

**2. Update `AdminLayout.tsx`**
- Remove `AssistantProvider`, `AssistantToggle`, and `AIAssistantPanel` imports and usage
- `AdminLayout` becomes purely the sidebar + header + content shell (no assistant state)

**3. Update `App.tsx` route structure**
- Group all admin routes under a parent route that uses `AdminRouteLayout` as its `element`
- All current admin routes become `children` of this parent route
- This ensures `AssistantProvider` mounts once and persists across all admin navigation

```text
Before:
  /admin/dashboard  --> ProtectedRoute > AdminDashboard > AdminLayout > AssistantProvider (new instance)
  /admin/customers  --> ProtectedRoute > AdminCustomers > AdminLayout > AssistantProvider (new instance)

After:
  /admin/*  --> AdminRouteLayout (AssistantProvider lives here, mounted once)
    /admin/dashboard  --> ProtectedRoute > AdminDashboard > AdminLayout (no provider)
    /admin/customers  --> ProtectedRoute > AdminCustomers > AdminLayout (no provider)
```

No changes to Bach's UI, behavior, or edge function -- just where the state lives in the component tree.

