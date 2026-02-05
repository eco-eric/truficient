import { useEffect, useRef, useCallback } from "react";
import type { QuoteState } from "../types";

/**
 * Hook that tracks abandoned carts for ductless estimator by saving partial 
 * submissions when users exit after filling out contact info (Step 1+) 
 * but before completing the flow (Step 8 ThankYou).
 * 
 * Uses visibilitychange and beforeunload events to detect when users leave.
 */
export const useAbandonedCartTracker = (
  state: QuoteState,
  setPartialSubmissionId: (id: string | null) => void
) => {
  // Use ref to avoid stale closure issues in event handlers
  const stateRef = useRef(state);
  const lastSavedRef = useRef<number>(0);

  // Keep ref updated with latest state
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Build submission data from current state
  const buildSubmissionData = useCallback((s: QuoteState) => {
    return {
      estimator_type: "ductless",
      // Customer info
      customer_name: s.customerInfo.name?.trim() || null,
      customer_email: s.customerInfo.email?.trim() || null,
      customer_phone: s.customerInfo.phone?.trim() || null,
      customer_address: s.customerInfo.streetAddress?.trim() || s.customerInfo.address?.trim() || null,
      customer_city: s.customerInfo.city?.trim() || null,
      customer_county: s.customerInfo.county?.trim() || null,
      customer_state: s.customerInfo.state?.trim() || null,
      customer_zip: s.customerInfo.zipCode?.trim() || null,
      google_place_id: s.customerInfo.placeId || null,
      notes: s.customerInfo.notes?.trim() || null,
      
      // Room/zone configuration
      selected_rooms: s.selectedRooms.length > 0 ? s.selectedRooms : null,
      zone_count: s.selectedRooms.length,
      
      // Equipment selections
      unit_type_id: s.unitTypeId || null,
      system_tier_id: s.systemTierId || null,
      selected_addons: s.selectedAddonIds.length > 0 ? s.selectedAddonIds : null,
      
      // Pricing
      subtotal: s.totals.subtotal || 0,
      tax_amount: s.totals.taxAmount || 0,
      rebates: s.totals.rebates || 0,
      final_total: s.totals.finalTotal || 0,
      
      // For updates
      partial_submission_id: s.partialSubmissionId || undefined,
    };
  }, []);

  // Check if user has entered enough contact info to save
  const hasMinimumContactInfo = useCallback((s: QuoteState): boolean => {
    // Must have at least email OR phone to be considered a valid partial lead
    const hasEmail = (s.customerInfo.email?.trim() || "").length > 0;
    const hasPhone = (s.customerInfo.phone?.replace(/\D/g, "") || "").length >= 10;
    return hasEmail || hasPhone;
  }, []);

  // Synchronous save using fetch with keepalive for beforeunload events
  const savePartialSubmission = useCallback(() => {
    const s = stateRef.current;
    
    // Only save if:
    // 1. User is on Step 1 or beyond (has seen contact form)
    // 2. User hasn't completed the flow (step < 8 ThankYou)
    // 3. Has entered at least some contact info
    // 4. Debounce - don't save more than once per 5 seconds
    
    const now = Date.now();
    if (
      s.currentStep < 1 || 
      s.currentStep >= 8 ||
      !hasMinimumContactInfo(s) ||
      now - lastSavedRef.current < 5000
    ) {
      return;
    }

    lastSavedRef.current = now;

    const submissionData = buildSubmissionData(s);

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl) {
      console.error("Missing VITE_SUPABASE_URL for abandoned cart save");
      return;
    }

    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/save-abandoned-cart`;

    // Use fetch with keepalive for reliable delivery during page unload
    try {
      fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
        keepalive: true,
      })
        .then(async (res) => {
          if (res.ok) {
            const result = await res.json();
            if (result.id && !s.partialSubmissionId) {
              setPartialSubmissionId(result.id);
              console.log("Ductless partial submission created:", result.id);
            } else {
              console.log("Ductless partial submission updated:", result.id);
            }
          }
        })
        .catch(e => console.error('Ductless abandoned cart save failed:', e));
      
      console.log("Ductless abandoned cart save initiated via Edge Function");
    } catch (e) {
      console.error("Failed to initiate ductless abandoned cart save:", e);
    }
  }, [buildSubmissionData, hasMinimumContactInfo, setPartialSubmissionId]);

  useEffect(() => {
    // Handle page visibility changes (tab switch, minimize, app switch on mobile)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        savePartialSubmission();
      }
    };

    // Handle page unload (browser close, navigation away, back button)
    const handleBeforeUnload = () => {
      savePartialSubmission();
    };

    // Handle page hide (more reliable on mobile)
    const handlePageHide = () => {
      savePartialSubmission();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [savePartialSubmission]);
};
