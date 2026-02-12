

## Fix Bach Chat Input: Stale Text and Small Size

### Problem 1: Input sometimes retains previous text
After sending a message, `setInput('')` clears the React state, but the textarea's inline `style.height` (set by the auto-resize handler) is not reset. This can cause visual glitches. Additionally, the speech recognition transcript appending may leave partial text behind in edge cases.

**Fix:**
- After `setInput('')` in `handleSend`, also reset the textarea's inline height back to its default using `inputRef.current.style.height = 'auto'`
- This ensures the textarea visually resets after every send

### Problem 2: Chat entry area is too small
The textarea is currently capped at `max-h-[100px]` (about 4 lines) both in CSS and in the `onInput` auto-resize handler.

**Fix:**
- Increase `max-h-[100px]` to `max-h-[280px]` (approximately 14-15 lines at 14px font + padding)
- Update the `onInput` handler's `Math.min(target.scrollHeight, 100)` cap to `280`
- Increase `min-h-[40px]` to `min-h-[60px]` so it starts at about 3 lines for better visibility
- Set `rows={3}` instead of `rows={1}` so the initial render shows 3 lines

### Files to modify
- `src/components/admin/assistant/AIAssistantPanel.tsx`
  - In `handleSend`: add `inputRef.current.style.height = 'auto'` after `setInput('')`
  - On the textarea element (line 203-220): update `rows`, `max-h`, `min-h`, and the `onInput` height cap value
