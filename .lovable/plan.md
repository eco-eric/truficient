
# Fix Bach's Timezone — Force CST in Briefing & Schedule Tools

## Status: ✅ COMPLETED

## What Was Done

### 1. `assistant-briefing` edge function
- ✅ Added CST utility functions (`getCSTDateStr`, `toCSTBoundary`, `formatTimeCST`, `formatDateCST`)
- ✅ Replaced UTC-based `todayStr`/`tomorrowStr` with CST-aware date strings
- ✅ Query boundaries now use CST-to-UTC converted timestamps
- ✅ Added `time_display` and `end_time_display` fields to appointment objects

### 2. `ai-assistant` edge function — `executeGetSchedule`
- ✅ Compute "today" in CST via `getCSTDateStr`
- ✅ Query boundaries use `toCSTBoundary` for correct day filtering
- ✅ Group appointments by CST date (not UTC date)
- ✅ Added `time_display` and `end_time_display` to schedule data

### 3. System prompt
- ✅ Added instruction: "All appointment times are in Central Time. Display time_display fields directly."
