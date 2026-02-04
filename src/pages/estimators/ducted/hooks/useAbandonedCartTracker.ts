import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { DuctedEstimatorState } from "../types";

/**
 * Hook that tracks abandoned carts by saving partial submissions when users exit
 * after filling out contact info (Step 8+) but before completing the flow (Step 11).
 * 
 * Uses visibilitychange and beforeunload events to detect when users leave.
 */
export const useAbandonedCartTracker = (
  state: DuctedEstimatorState,
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
  const buildSubmissionData = useCallback((s: DuctedEstimatorState) => {
    // Build full address string
    const street = s.customerInfo.streetAddress?.trim() || "";
    const city = s.customerInfo.city?.trim() || "";
    const zip = s.customerInfo.zipCode?.trim() || "";
    const fullAddress = street && city && zip ? `${street}, ${city}, TX ${zip}` : "";

    return {
      // Customer info
      customer_name: s.customerInfo.name?.trim() || "",
      customer_email: s.customerInfo.email?.trim() || "",
      customer_phone: s.customerInfo.phone?.trim() || null,
      customer_address: fullAddress || null,
      best_time_to_call: s.customerInfo.bestTimeToCall || null,
      
      // Home details
      home_type: s.homeType || "single_family",
      home_layout: s.homeLayout || "1_story",
      square_footage: s.squareFootage || "1600_2000",
      hot_cold_spots: s.hotColdSpots || null,
      winter_temp: s.winterTemp || null,
      summer_temp: s.summerTemp || null,
      
      // System details
      heating_type: s.heatingType || "gas_system",
      coverage: s.coverage || "entire_home",
      system_count: s.systemCount || 1,
      
      // Status - partial for abandoned cart tracking
      status: "partial",
      ghl_sync_status: "pending",
    };
  }, []);

  // Check if user has entered enough contact info to save
  const hasMinimumContactInfo = useCallback((s: DuctedEstimatorState): boolean => {
    // Must have at least email OR phone to be considered a valid partial lead
    const hasEmail = (s.customerInfo.email?.trim() || "").length > 0;
    const hasPhone = (s.customerInfo.phone?.replace(/\D/g, "") || "").length >= 10;
    return hasEmail || hasPhone;
  }, []);

  // Save partial submission to database
  const savePartialSubmission = useCallback(async () => {
    const s = stateRef.current;
    
    // Only save if:
    // 1. User is on Step 8 or beyond (has seen contact form)
    // 2. User hasn't completed the flow (step < 11)
    // 3. Has entered at least some contact info
    // 4. Not already saving
    // 5. Debounce - don't save more than once per 5 seconds
    
    const now = Date.now();
    if (
      s.currentStep < 8 || 
      s.currentStep >= 11 ||
      !hasMinimumContactInfo(s) ||
      isSavingRef.current ||
      now - lastSavedRef.current < 5000
    ) {
      return;
    }

    isSavingRef.current = true;
    lastSavedRef.current = now;

    try {
      const submissionData = buildSubmissionData(s);

      if (s.partialSubmissionId) {
        // Update existing partial submission
        const { error } = await supabase
          .from("ducted_estimate_submissions")
          .update(submissionData)
          .eq("id", s.partialSubmissionId);

        if (error) {
          console.error("Failed to update partial submission:", error);
        } else {
          console.log("Partial submission updated via exit detection:", s.partialSubmissionId);
        }
      } else {
        // Create new partial submission
        const { data: insertedData, error } = await supabase
          .from("ducted_estimate_submissions")
          .insert(submissionData)
          .select("id")
          .single();

        if (error) {
          console.error("Failed to create partial submission:", error);
        } else if (insertedData) {
          console.log("Partial submission created via exit detection:", insertedData.id);
          setPartialSubmissionId(insertedData.id);
        }
      }
    } catch (error) {
      console.error("Error saving partial submission:", error);
    } finally {
      isSavingRef.current = false;
    }
  }, [buildSubmissionData, hasMinimumContactInfo, setPartialSubmissionId]);

  // Synchronous save using fetch with keepalive for beforeunload events
  // Uses Edge Function which doesn't require auth headers
  const savePartialSubmissionSync = useCallback(() => {
    const s = stateRef.current;
    
    // Same conditions as async version
    if (
      s.currentStep < 8 || 
      s.currentStep >= 11 ||
      !hasMinimumContactInfo(s)
    ) {
      return;
    }

    const submissionData = {
      ...buildSubmissionData(s),
      partial_submission_id: s.partialSubmissionId || undefined,
    };

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
      }).catch(e => console.error('Abandoned cart save failed:', e));
      
      console.log("Abandoned cart save initiated via Edge Function");
    } catch (e) {
      console.error("Failed to initiate abandoned cart save:", e);
    }
  }, [buildSubmissionData, hasMinimumContactInfo]);

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
