import { useEffect, useRef, useCallback } from "react";
import type { QuoteState } from "../types";

/**
 * Hook that tracks abandoned carts for the ductless estimator by saving partial 
 * submissions when users exit after filling out contact info (Step 1+) but before 
 * completing the flow (Step 8).
 * 
 * Uses visibilitychange and beforeunload events to detect when users leave.
 */
export const useDuctlessAbandonedCartTracker = (
  state: QuoteState,
  setPartialSubmissionId: (id: string | null) => void
) => {
  // Use ref to avoid stale closure issues in event handlers
  const stateRef = useRef(state);
  const isSavingRef = useRef(false);
  const lastSavedRef = useRef<number>(0);

  // Keep ref updated with latest state
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Build submission data from current state
  const buildSubmissionData = useCallback((s: QuoteState) => {
    return {
      estimator_type: 'ductless',
      // Customer info
      customer_name: s.customerInfo.name?.trim() || null,
      customer_email: s.customerInfo.email?.trim() || null,
      customer_phone: s.customerInfo.phone?.trim() || null,
      customer_address: s.customerInfo.formattedAddress || s.customerInfo.address || null,
      customer_city: s.customerInfo.city || null,
      customer_county: s.customerInfo.county || null,
      customer_state: s.customerInfo.state || null,
      customer_zip: s.customerInfo.zipCode || null,
      google_place_id: s.customerInfo.placeId || null,
      notes: s.customerInfo.notes || null,
      // Quote details
      zone_count: s.selectedRooms.length,
      unit_type_id: s.unitTypeId || null,
      system_tier_id: s.systemTierId || null,
      selected_rooms: s.selectedRooms.length > 0 ? s.selectedRooms : null,
      selected_addons: s.selectedAddonIds.length > 0 ? s.selectedAddonIds : null,
      // Pricing
      subtotal: s.totals.subtotal || 0,
      tax_amount: s.totals.taxAmount || 0,
      rebates: s.totals.rebates || 0,
      final_total: s.totals.finalTotal || 0,
      // Partial submission ID for updates
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
  // Uses Edge Function which doesn't require auth headers
  const savePartialSubmissionSync = useCallback(() => {
    const s = stateRef.current;
    
    // Only save if:
    // 1. User is on Step 1 or beyond (has seen contact form - ductless collects info at step 1)
    // 2. User hasn't completed the flow (step < 8 which is thank you)
    // 3. Has entered at least some contact info
    
    if (
      s.currentStep < 1 || 
      s.currentStep >= 8 ||
      !hasMinimumContactInfo(s)
    ) {
      return;
    }

    const submissionData = buildSubmissionData(s);

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl) {
      console.error("Missing VITE_SUPABASE_URL for abandoned cart save");
      return;
    }

    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/save-abandoned-cart`;

    // Use fetch with keepalive for reliable delivery during page unload
    // Edge Function doesn't require auth headers, solving the sendBeacon limitation
    try {
      fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
        keepalive: true, // Ensures request completes even during page unload
      }).catch(e => console.error('Ductless abandoned cart save failed:', e));
      
      console.log("Ductless abandoned cart save initiated via Edge Function");
    } catch (e) {
      console.error("Failed to initiate ductless abandoned cart save:", e);
    }
  }, [buildSubmissionData, hasMinimumContactInfo]);

  // Async save for visibility change (tab switch, minimize)
  const savePartialSubmission = useCallback(async () => {
    const s = stateRef.current;
    
    // Same conditions as sync version plus debounce
    const now = Date.now();
    if (
      s.currentStep < 1 || 
      s.currentStep >= 8 ||
      !hasMinimumContactInfo(s) ||
      isSavingRef.current ||
      now - lastSavedRef.current < 5000 // 5 second debounce
    ) {
      return;
    }

    isSavingRef.current = true;
    lastSavedRef.current = now;

    try {
      const submissionData = buildSubmissionData(s);

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl) {
        console.error("Missing VITE_SUPABASE_URL for abandoned cart save");
        return;
      }

      const edgeFunctionUrl = `${supabaseUrl}/functions/v1/save-abandoned-cart`;

      const response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Ductless partial submission saved:", result.id);
        
        // Store the ID for future updates
        if (result.id && !s.partialSubmissionId) {
          setPartialSubmissionId(result.id);
        }
      } else {
        console.error("Failed to save ductless partial submission:", await response.text());
      }
    } catch (error) {
      console.error("Error saving ductless partial submission:", error);
    } finally {
      isSavingRef.current = false;
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
      savePartialSubmissionSync();
    };

    // Handle page hide (more reliable on mobile)
    const handlePageHide = () => {
      savePartialSubmissionSync();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [savePartialSubmission, savePartialSubmissionSync]);
};
