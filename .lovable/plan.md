
# Remodel Project Workflow Stages + Drag-and-Drop Reordering

## Overview

This plan covers two enhancements:
1. Adding default workflow stages for the "Remodel Project" job type
2. Implementing drag-and-drop reordering for job stages in the Job Types & Stages configuration page

---

## Part 1: Remodel Project Workflow Stages

The newly created "Remodel Project" job type (ID: `70b9c694-51d7-4702-a49b-6747e098a9ce`) needs workflow stages defined. Based on typical HVAC remodel projects and the existing "Custom Home" stages pattern, here are the recommended stages:

| Order | Stage Name | Type | Color | Notify |
|-------|-----------|------|-------|--------|
| 1 | Consultation | initial | Blue | No |
| 2 | Design & Proposal | in_progress | Amber | No |
| 3 | Permit & Planning | in_progress | Purple | No |
| 4 | Demo & Prep | in_progress | Orange | No |
| 5 | Rough-In | in_progress | Cyan | No |
| 6 | Inspection | review | Pink | Yes |
| 7 | Trim-Out & Finish | in_progress | Teal | No |
| 8 | Final Walkthrough | review | Indigo | Yes |
| 9 | Complete | completed | Green | Yes |
| 10 | Cancelled | cancelled | Red | No |

---

## Part 2: Drag-and-Drop Stage Reordering

### Current State
- The stages list shows a grip handle icon (GripVertical) but it's purely decorative
- No drag-and-drop functionality is implemented
- Sort order can only be changed by manually editing each stage

### Implementation Approach

Following the established pattern from `LaborRates.tsx`, `Materials.tsx`, and `Gallery.tsx`, I will:

1. **Import dnd-kit dependencies** - DndContext, SortableContext, useSortable, sensors, and utilities

2. **Create a SortableStageRow component** - Extract the stage row into a draggable component with:
   - `useSortable` hook connected to stage ID
   - Transform/transition styles for smooth dragging
   - Visual feedback when dragging (opacity, highlight)

3. **Add drag sensors** - Configure PointerSensor and KeyboardSensor with activation constraints (to prevent accidental drags)

4. **Implement drag end handler** - On drop:
   - Reorder stages array using `arrayMove`
   - Batch update `sort_order` values in database
   - Invalidate queries to refresh UI

5. **Add visual cues** - Make the grip handle interactive and add cursor feedback

---

## Technical Details

### Files Modified

**src/pages/admin/JobTypesConfig.tsx**
- Add dnd-kit imports
- Add sensors configuration  
- Create `SortableStageRow` component
- Add `updateStagesOrderMutation` for batch sort_order updates
- Wrap stages list with `DndContext` and `SortableContext`
- Implement `handleDragEnd` function

### Database Operations

**Insert Remodel Project Stages** - Add 10 workflow stages to `crm_job_stages` table

**Update Sort Orders** - When reordering, batch update the `sort_order` column for affected stages

---

## User Experience

After implementation:
- Select "Remodel Project" from the job types list to see its 10 workflow stages
- Grab any stage by its grip handle and drag to reorder
- Visual feedback during drag (reduced opacity, highlighted border)
- Sort order persists immediately to database
- Works with keyboard navigation (Tab + Arrow keys) for accessibility
