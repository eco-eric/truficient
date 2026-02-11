

# Add Training Resources to Admin Financing Page

## What's Being Added
A "Training Resources" section below the financing plans table with two cards:
1. **Submit Sales Slip** -- Embedded video player (MP4)
2. **Synchrony Transaction Process** -- Viewable/downloadable PDF

## File Changes

### 1. Add uploaded files to the project
- `user-uploads://Submit_Sales_Slip_-_May_2025.mp4` copied to `public/training/Submit_Sales_Slip_-_May_2025.mp4`
- `user-uploads://Syncrony_Transaction_Process.pdf` copied to `public/training/Syncrony_Transaction_Process.pdf`

### 2. Update `src/pages/admin/FinancingOptions.tsx`
Add a "Training Resources" section after the plans table:

- Two responsive cards in a grid
- **Card 1**: Inline `<video>` player with controls for the sales slip MP4
- **Card 2**: PDF icon with "Open" and "Download" buttons for the Synchrony transaction PDF
- Uses existing `Card`, `CardHeader`, `CardTitle`, `CardContent`, and `Button` components plus `Video`, `FileText`, `Download` icons from lucide-react

