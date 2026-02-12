

## Adjust Bach Toggle Button and Textarea Layout

### 1. Move the chat bubble (toggle button) up
The toggle button currently sits at `bottom-6 right-6` (24px from bottom). Since the input area is now taller (~120px + padding), the button overlaps with it. Move it higher so it clears the input area.

**File: `src/components/admin/assistant/AssistantToggle.tsx`**
- Change desktop positioning from `bottom-6 right-6` to `bottom-52 right-6` (approximately 208px from the bottom, clearing the expanded input area)
- Change mobile positioning from `bottom-5 right-5` to `bottom-48 right-5`

### 2. Ensure the textarea starts above the toggle button
The input area container needs bottom padding/margin so the textarea content area sits above the floating toggle button. Since the toggle is positioned fixed and independent of the panel, we need to adjust the panel's input section to account for the toggle's position when the panel is open. 

Actually, looking more carefully at the screenshot: when the panel is open, the toggle (X button) sits on top of the bottom-right corner of the input area. The simplest fix is to move the toggle button upward so it's above the input container, just outside the panel's bottom edge.

**File: `src/components/admin/assistant/AssistantToggle.tsx`**
- Desktop: change `bottom-6 right-6` to `bottom-48 right-6` (~192px from bottom, above the input area)
- Mobile: change `bottom-5 right-5` to `bottom-44 right-5`

### Files to modify
- `src/components/admin/assistant/AssistantToggle.tsx` -- move toggle button position upward

