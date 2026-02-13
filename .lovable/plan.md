

## Auto-Sync Google Calendars Every 2 Hours

Right now the only way to refresh your calendar list is by clicking "Sync Calendars" manually. We'll set up an automatic background job that runs every 2 hours so the calendar data stays fresh without any manual action.

### What Changes

**1. Enable required database extensions**
- Enable `pg_cron` and `pg_net` extensions (needed for scheduled background jobs)

**2. Create a scheduled cron job**
- Schedule `google-calendar-sync` with the `sync-calendars` action to run every 2 hours
- The job calls the existing edge function -- no new backend code needed

**3. Update the Calendar Settings page**
- Show when the next auto-sync is expected (based on `last_synced_at` + 2 hours)
- Keep the manual "Sync Calendars" button for on-demand refreshes
- Add a small note like "Calendars auto-sync every 2 hours" so you know it's working in the background

### Technical Details

- The cron job uses `pg_cron` + `pg_net` to make an HTTP POST to the edge function URL every 2 hours
- Since `google-calendar-sync` has `verify_jwt = false`, the cron call can authenticate with the anon key in the Authorization header
- The edge function already handles the `sync-calendars` action, so no changes are needed there
- A single SQL migration enables the extensions and creates the scheduled job

### Files to modify
1. **New SQL migration** -- enable `pg_cron`, `pg_net`, and create the cron schedule
2. `src/pages/admin/CalendarSettings.tsx` -- add auto-sync status indicator

