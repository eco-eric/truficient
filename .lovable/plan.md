

# Fix Bach's Timezone — Force CST in Briefing & Schedule Tools

## Problem
Bach is displaying appointment times shifted by ~6 hours because both the `assistant-briefing` and `ai-assistant` edge functions compute "today" and query date boundaries using UTC instead of Central Time (America/Chicago). The calendar UI correctly uses CST via `buildCSTDateTime`, but the AI backend does not.

## What Changes

### 1. `assistant-briefing` edge function
- Replace UTC-based `todayStr` / `tomorrowStr` computation with CST-aware date strings
- Replace query boundaries (`${todayStr}T00:00:00`) with proper CST-to-UTC converted timestamps so the right day's appointments are returned
- Convert `start_datetime` and `end_datetime` values to CST-formatted display strings before returning them to the AI

### 2. `ai-assistant` edge function — `executeGetSchedule`
- Same fix: compute "today" in CST, build query boundaries in CST-aware UTC
- Format `time_start` / `time_end` in CST before returning to the AI model

## Technical Details

Both edge functions will add a small CST utility (same logic as the frontend `cstTimezone.ts`):

```typescript
const TZ = "America/Chicago";

function getCSTDateStr(d: Date): string {
  return d.toLocaleDateString("en-CA", { timeZone: TZ }); // "YYYY-MM-DD"
}

function toCSTBoundary(dateStr: string, time: string): string {
  // Build UTC ISO from CST wall-clock time
  const naive = new Date(`${dateStr}T${time}:00`);
  const utcParts = new Date(naive.toLocaleString("en-US", { timeZone: "UTC", hour12: false }));
  const cstParts = new Date(naive.toLocaleString("en-US", { timeZone: TZ, hour12: false }));
  const offset = utcParts.getTime() - cstParts.getTime();
  return new Date(new Date(`${dateStr}T${time}:00Z`).getTime() + offset).toISOString();
}

function formatTimeCST(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    timeZone: TZ,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
```

### Changes in `assistant-briefing/index.ts`:
- Line 65-66: Use `getCSTDateStr(now)` for `todayStr` and `tomorrowStr`
- Lines 87-88, 99-100: Use `toCSTBoundary(todayStr, "00:00")` and `toCSTBoundary(todayStr, "23:59")` for query filters
- Lines 255-265: Add formatted CST time strings (e.g., `time_display: "9:00 AM"`) to each appointment object so the AI shows correct local times

### Changes in `ai-assistant/index.ts` (`executeGetSchedule`):
- Line 528: Use `getCSTDateStr(new Date())` instead of `new Date().toISOString().split("T")[0]`
- Lines 535-536: Use CST boundary conversion for query filters  
- Lines 546-556: Add CST-formatted times to the returned schedule data and group by CST date

### System prompt update
- Add a note in the AI system prompt: "All appointment times are in Central Time (CST/CDT). Display them as-is without conversion."

