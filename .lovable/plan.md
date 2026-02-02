

## Fix Abandoned Cart Capture for Ducted Estimator

### Problem Summary

The partial submission (abandoned cart) tracking is **not working** because:

1. **Only triggers on "Continue" click** - The partial submission code only runs when the user clicks the Continue button in Step 8
2. **No exit detection** - There are no event listeners to capture when users:
   - Click the Truficient logo to go home
   - Close the browser tab
   - Navigate away using browser back button
   - Switch to another app on mobile
3. **Database confirms the issue** - All 10+ ducted submissions have `status: "new"` (completed flow) with zero `status: "partial"` records

---

### Root Cause Analysis

| Scenario | Current Behavior | Expected Behavior |
|----------|-----------------|-------------------|
| User clicks Continue on Step 8 | Creates partial submission, then proceeds | Works (if code runs) |
| User closes browser tab | Nothing saved | Should save partial |
| User clicks Truficient logo | Navigates to home, nothing saved | Should save partial |
| User presses browser back button | Navigates away, nothing saved | Should save partial |
| User switches mobile apps | Nothing saved | Should save partial |

---

### Solution Architecture

```text
+----------------------------------------------------------+
|                  DuctedEstimator.tsx                      |
|  +----------------------------------------------------+  |
|  |  AbandonedCartTracker Component (NEW)              |  |
|  |  - Listens for visibilitychange, beforeunload      |  |
|  |  - Watches currentStep and customerInfo            |  |
|  |  - Auto-saves partial when user exits after Step 8 |  |
|  +----------------------------------------------------+  |
|                                                          |
|  +----------------------------------------------------+  |
|  |  Step8CustomerInfo.tsx                             |  |
|  |  - Continue button: saves partial, then proceeds   |  |
|  |  - Data exposed to context for tracker to access   |  |
|  +----------------------------------------------------+  |
+----------------------------------------------------------+
```

---

### Files to Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/pages/estimators/ducted/DuctedEstimator.tsx` | MODIFY | Add AbandonedCartTracker component |
| `src/pages/estimators/ducted/context/EstimatorContext.tsx` | MODIFY | Add helper to check if contact info is complete |
| `src/pages/estimators/ducted/steps/Step8CustomerInfo.tsx` | MINOR FIX | Ensure partial submission works correctly |

---

### Implementation Details

#### 1. Create Abandoned Cart Tracker Component

Add a new component inside `DuctedEstimator.tsx` that:
- Uses `useEffect` with `visibilitychange` and `beforeunload` event listeners
- Tracks when user has entered Step 8+ and filled contact info
- Auto-saves partial submission when user exits/hides page
- Uses refs to access latest state (avoids stale closure issues)

```typescript
// Inside DuctedEstimator.tsx

const AbandonedCartTracker: React.FC = () => {
  const { state } = useEstimator();
  const stateRef = useRef(state);
  
  // Keep ref updated with latest state
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const savePartialSubmission = async () => {
      const s = stateRef.current;
      
      // Only save if:
      // 1. User is on Step 8 or beyond (has seen contact form)
      // 2. Has entered at least some contact info (phone or email)
      // 3. No partial submission exists OR needs updating
      // 4. Submission hasn't been finalized (step < 11)
      
      if (s.currentStep >= 8 && s.currentStep < 11) {
        const hasContactInfo = s.customerInfo.phone || s.customerInfo.email;
        
        if (hasContactInfo && !s.partialSubmissionId) {
          // Save to database (fire-and-forget)
          await supabase.from("ducted_estimate_submissions").insert({
            customer_name: s.customerInfo.name?.trim() || "",
            customer_email: s.customerInfo.email?.trim() || "",
            customer_phone: s.customerInfo.phone?.trim() || null,
            // ... other fields
            status: "partial",
          });
        }
      }
    };

    // Handle page visibility changes (tab switch, minimize, close)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        savePartialSubmission();
      }
    };

    // Handle page unload (browser close, navigation)
    const handleBeforeUnload = () => {
      savePartialSubmission();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return null; // No UI, just tracking
};
```

#### 2. Update DuctedEstimator Component

Add the tracker inside the EstimatorProvider:

```typescript
const DuctedEstimator = () => {
  return (
    <EstimatorProvider>
      <AbandonedCartTracker />
      <EstimatorContent />
    </EstimatorProvider>
  );
};
```

#### 3. Handle Logo Click Navigation

Add navigation intercept for the Truficient logo in the compact header:

```typescript
// In DuctedEstimator.tsx compact header section
const handleLogoClick = (e: React.MouseEvent) => {
  // The AbandonedCartTracker will handle saving via beforeunload
  // Just let navigation proceed normally
};

// Or use react-router's useBlocker for confirmation dialog
```

---

### Event Handling Strategy

| Event | When it Fires | Action |
|-------|--------------|--------|
| `visibilitychange` (hidden) | Tab switch, app switch, minimize | Save partial async |
| `beforeunload` | Tab close, browser close, navigation | Save partial (sync or sendBeacon) |
| Continue button click | User proceeds to Step 9 | Save partial via existing code |

---

### Technical Considerations

1. **Use `navigator.sendBeacon`** for `beforeunload` events since async requests may be cancelled
2. **Debounce auto-saves** to avoid spamming database if user rapidly switches tabs
3. **Check `partialSubmissionId`** to update existing record vs creating duplicates
4. **Use refs for state access** to avoid stale closures in event handlers

---

### Testing Scenarios

After implementation, verify these scenarios create partial submissions:

1. Fill contact form on Step 8, then close browser tab
2. Fill contact form on Step 8, then click Truficient logo
3. Fill contact form on Step 8, then press browser back button
4. Fill contact form on Step 8, then click Continue (existing flow)
5. Get to Step 9, then close browser tab
6. On mobile: fill form, then switch apps

---

### Existing Step 8 Code Assessment

The current `Step8CustomerInfo.tsx` code at lines 81-159 has correct partial submission logic, but it only triggers on Continue button click. The fix adds automatic exit detection as a safety net.

The existing code correctly:
- Creates new partial submissions with `status: "partial"`
- Updates existing partial submissions using `partialSubmissionId`
- Stores the submission ID in context for Step 10 to update

---

### Expected Outcome

After implementation:
- Abandoned carts will appear in the new Admin dashboard view
- Partial submissions will show `status: "partial"` 
- Leads who complete the flow will have `status: "new"` (unchanged)
- No duplicate submissions from the same session

