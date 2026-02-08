

# Admin System Documentation Management

## Overview

Create a super_admin-only feature within Settings to manage markdown documentation files that can be exported for use with external AI assistants like Claude. This provides a centralized location for viewing and downloading comprehensive system documentation.

---

## Feature Requirements

1. **Documentation Viewer** - Display existing documentation files from the `/docs` folder
2. **Export Capability** - Download individual or combined documentation as markdown
3. **Super Admin Only** - Restrict access to `super_admin` role exclusively
4. **Settings Integration** - Add as a new section within the Settings page

---

## Implementation Approach

### Option A: Static Documentation Viewer (Recommended)

Since the documentation already exists in `/docs/*.md`, we can create a component that:
- Lists available documentation files with preview
- Allows downloading individual files or a combined export
- No database storage needed (files exist in codebase)

### Option B: Dynamic Documentation Manager

If you want the ability to edit/create documentation from the admin panel:
- Store documentation in a database table
- Add CRUD operations for markdown files
- Requires more complexity

**Recommendation:** Option A - The existing `/docs` folder already contains excellent documentation. We'll create a viewer/exporter that leverages these files.

---

## Technical Implementation

### 1. Create Documentation Viewer Component

**File:** `src/components/admin/settings/SystemDocumentation.tsx`

```typescript
// Component that displays available documentation
// - Lists all doc sections (Admin Dashboard, Ducted Estimator, etc.)
// - Preview modal for each doc
// - Download individual docs
// - "Export All" button for combined download
```

### 2. Update Settings Page

**File:** `src/pages/admin/Settings.tsx`

Add a new Card section after the existing cards that:
- Only renders when `isSuperAdmin === true`
- Contains the documentation viewer component
- Shows file list with download buttons

### 3. Documentation Data Structure

Hardcoded list of available documentation (since these files exist in the codebase):

| Document | Path | Description |
|----------|------|-------------|
| Admin Dashboard | `docs/ADMIN-DASHBOARD.md` | Dashboard architecture, RBAC, navigation |
| Ducted Estimator | `docs/DUCTED-ESTIMATOR.md` | Ducted HVAC estimator flow and pricing |
| Ductless Estimator | `docs/DUCTLESS-ESTIMATOR.md` | Mini-split estimator configuration |
| GHL Integration | `docs/GHL-INTEGRATION.md` | GoHighLevel CRM sync documentation |
| Financing | `docs/FINANCING-INTEGRATION.md` | Synchrony financing integration |
| System Pricing | `docs/SYSTEM-PRICING-DATABASE.md` | Equipment and pricing database |

### 4. Export Functionality

Two export options:
1. **Individual Download** - Download single doc file
2. **Combined Export** - Merge all docs into one file with table of contents

Combined export format:
```markdown
# Truficient Admin System Documentation
Generated: [timestamp]

## Table of Contents
1. Admin Dashboard
2. Ducted Estimator
3. Ductless Estimator
4. GHL Integration
5. Financing Integration
6. System Pricing Database

---

[Full content of each document separated by horizontal rules]
```

---

## UI Design

### Settings Page Addition

```
┌─────────────────────────────────────────────────────────────────┐
│  📄 System Documentation                    [SUPER ADMIN ONLY]  │
│                                                                  │
│  Export technical documentation for external AI assistants.     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Available Documentation:                                        │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ 📘 Admin Dashboard                           [Download]   │  │
│  │    Dashboard architecture, RBAC, navigation structure      │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ 📗 Ducted Estimator                          [Download]   │  │
│  │    Multi-step HVAC estimator with pricing engine          │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ 📙 Ductless Estimator                        [Download]   │  │
│  │    Mini-split zone configuration and BTU calculations     │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ 📕 GHL Integration                           [Download]   │  │
│  │    GoHighLevel CRM sync and lead management               │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ 📓 Financing Integration                     [Download]   │  │
│  │    Synchrony financing plans and payment calculations     │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ 📔 System Pricing Database                   [Download]   │  │
│  │    Equipment systems and price book management            │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  [📦 Download All Documentation (Combined)]                     │
│                                                                  │
│  Generates a single file with all docs for Claude/ChatGPT       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Access Control

The section will only render for super_admin users:

```typescript
// In Settings.tsx
const { isSuperAdmin } = useUserRole();

// Only super_admin can see this section
{isSuperAdmin && (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <FileText className="h-5 w-5" />
        System Documentation
      </CardTitle>
      <CardDescription>
        Export technical documentation for external AI assistants
      </CardDescription>
    </CardHeader>
    <CardContent>
      <SystemDocumentation />
    </CardContent>
  </Card>
)}
```

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/components/admin/settings/SystemDocumentation.tsx` | Create | Documentation viewer component |
| `src/pages/admin/Settings.tsx` | Modify | Add documentation section for super_admin |

---

## Implementation Notes

### Documentation Content

The existing `/docs` folder contains 6 comprehensive markdown files totaling ~2,000 lines of documentation covering:

- **Admin Dashboard** (345 lines) - Layout, navigation, RBAC, dashboard components
- **Ducted Estimator** (599 lines) - Step flow, tonnage calculation, pricing engine, GHL sync
- **Ductless Estimator** (672 lines) - Zone configuration, BTU calculations, tier pricing
- **GHL Integration** (408 lines) - Edge functions, sync workflow, custom fields
- **Financing** (427 lines) - Synchrony plans, payment factor calculations
- **System Pricing** (499 lines) - Equipment database, Excel import, RLS policies

### Download Implementation

Since we can't directly access the filesystem in the browser, we'll:
1. Embed the documentation content directly in the component (hardcoded)
2. Generate download using Blob and URL.createObjectURL()
3. Trigger download via a temporary anchor element

```typescript
const downloadDocument = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
```

---

## Summary

| Aspect | Detail |
|--------|--------|
| **Access** | Super Admin only |
| **Location** | Settings page (new section) |
| **Documents** | 6 existing docs from /docs folder |
| **Actions** | Individual download, combined export |
| **New Files** | 1 new component |
| **Modified Files** | Settings.tsx |
| **Database Changes** | None |

