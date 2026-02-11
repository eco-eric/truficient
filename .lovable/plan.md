

## Notification Center and Task Management System -- Phase 1 (Foundation)

This is a large feature, so it will be implemented in phases following your specification document. Phase 1 covers the database foundation, the Command Center on the dashboard, task CRUD, notification feed, and the bell icon in the header.

---

### What Gets Built

1. **3 new database tables**: `admin_tasks`, `admin_notifications`, `admin_notification_preferences` with RLS policies and indexes
2. **5 database triggers**: Auto-create notifications on new submissions (ductless, ducted, contact), pipeline stage changes, and job stage changes
3. **Command Center card** at the top of the Dashboard with 4 summary stat badges + a 2x2 grid of panels (My Tasks, Notifications, Today's Schedule, Lead Assignments)
4. **Notification bell** in the AdminHeader with unread badge and dropdown
5. **Full /admin/tasks page** with filtering, table view, and task detail dialog
6. **Realtime subscriptions** so notifications and tasks update live without refresh
7. **Nav update**: "Tasks" link added under Overview in the sidebar

---

### Database Changes (Migration)

**Tables:**

- `admin_tasks` -- Task management with fields for title, description, priority (low/medium/high/urgent), status (todo/in_progress/done/cancelled), due_date, polymorphic links to customers/jobs/submissions/pipeline entries, auto-generation tracking (source, source_event), and tags
- `admin_notifications` -- Notification feed with user targeting (NULL = broadcast), category, title, message, icon/color, link_url, read/dismissed state, and related entity links
- `admin_notification_preferences` -- Per-user settings for category toggles and sound preferences

**RLS Policies:**
- Tasks: Users see tasks assigned to them OR created by them; admins/super_admins see all
- Notifications: Users see their own + broadcasts (user_id IS NULL)
- Preferences: Users see/edit only their own row

**Triggers (5 total):**
- `notify_new_submission()` on INSERT to `ductless_estimate_submissions`, `ducted_estimate_submissions`, `contact_submissions` -- creates broadcast notification + auto-task
- `notify_pipeline_change()` on UPDATE of `stage_id` on `crm_pipeline_entries` -- creates broadcast notification
- `notify_job_stage_change()` on UPDATE of `current_stage_id` on `crm_jobs` -- creates broadcast notification

**Realtime:**
- Enable realtime on `admin_notifications` and `admin_tasks`

---

### New Files

| File | Purpose |
|------|---------|
| `src/components/admin/command-center/CommandCenter.tsx` | Main container card for the dashboard top section |
| `src/components/admin/command-center/CommandCenterStats.tsx` | 4 summary stat badges row |
| `src/components/admin/command-center/TaskPanel.tsx` | My Tasks list panel |
| `src/components/admin/command-center/TaskItem.tsx` | Individual task row component |
| `src/components/admin/command-center/TaskCreateDialog.tsx` | Quick-create task dialog |
| `src/components/admin/command-center/NotificationPanel.tsx` | Notifications feed panel |
| `src/components/admin/command-center/NotificationItem.tsx` | Individual notification row |
| `src/components/admin/command-center/SchedulePanel.tsx` | Today's Schedule panel |
| `src/components/admin/command-center/LeadAssignmentPanel.tsx` | Unassigned leads panel |
| `src/components/admin/notifications/NotificationBell.tsx` | Header bell icon with unread badge |
| `src/components/admin/notifications/NotificationDropdown.tsx` | Bell click dropdown |
| `src/components/admin/notifications/useNotifications.ts` | Realtime notification hook |
| `src/hooks/useTasks.ts` | Task CRUD hook |
| `src/pages/admin/Tasks.tsx` | Full tasks management page |

---

### Modified Files

| File | Change |
|------|--------|
| `src/pages/admin/Dashboard.tsx` | Add `<CommandCenter />` above `<StatsCards />` |
| `src/components/admin/AdminHeader.tsx` | Add `<NotificationBell />` next to "View Site" button |
| `src/components/admin/adminNavConfig.ts` | Add "Tasks" nav item under Overview section |
| `src/App.tsx` | Add route for `/admin/tasks` |

---

### Styling

- Command Center card: white background, subtle shadow, navy (#1e3a5f) top border accent
- Task priority badges: low=gray, medium=blue, high=orange, urgent=red
- Notification category colors: lead=blue, pipeline=yellow, job=green, team=purple, system=red, general=gray
- Responsive: 2x2 grid becomes single column on mobile
- Bell badge: red circle with white text count

---

### Technical Details

**useNotifications hook:**
- Fetches initial notifications (last 50, user's + broadcasts, not dismissed)
- Subscribes to Supabase Realtime INSERT events on `admin_notifications` filtered to current user + broadcasts
- Exposes: `notifications`, `unreadCount`, `markAsRead()`, `markAllRead()`, `dismiss()`

**useTasks hook:**
- Fetches tasks assigned to current user, sorted by overdue first then due_date ASC
- CRUD operations: `createTask()`, `updateTask()`, `completeTask()`, `deleteTask()`
- Joins customer/job data for display

**Command Center Stats:**
- Queries counts in parallel: unread notifications, tasks due (today + overdue), today's appointments, unassigned leads (last 48h)
- Each badge is clickable, scrolling to or highlighting its corresponding panel

**Lead Assignments Panel:**
- Queries recent submissions (48h) from ductless/ducted/contact tables
- Cross-references against `crm_customers` to find unconverted leads
- Quick actions: Assign, View, Convert (reuses existing ConvertToCustomerDialog)

