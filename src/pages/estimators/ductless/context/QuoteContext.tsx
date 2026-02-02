import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import type { QuoteState, RoomConfig, CustomerInfo, PricingTotals } from "../types";

const INITIAL_CUSTOMER_INFO: CustomerInfo = {
  name: "",
  email: "",
  phone: "",
  address: "",
  streetAddress: "",
  formattedAddress: "",
  city: "",
  county: "",
  state: "",
  zipCode: "",
  placeId: "",
};

const INITIAL_TOTALS: PricingTotals = {
  subtotal: 0,
  taxAmount: 0,
  rebates: 0,
  finalTotal: 0,
  monthlyFinancing: 0,
  perZonePrices: [],
  totalSavings: 0,
};

const INITIAL_STATE: QuoteState = {
  currentStep: 0,
  selectedRooms: [],
  unitTypeId: null,
  systemTierId: null,
  selectedAddonIds: [],
  customerInfo: INITIAL_CUSTOMER_INFO,
  totals: INITIAL_TOTALS,
  applyUnitTypeToAll: true,
};

interface QuoteContextValue {
  state: QuoteState;
  // Navigation
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  // Room management
  addRoom: (room: RoomConfig) => void;
  updateRoom: (id: string, updates: Partial<RoomConfig>) => void;
  removeRoom: (id: string) => void;
  setSelectedRooms: (rooms: RoomConfig[]) => void;
  // Equipment selections
  setUnitTypeId: (id: string | null) => void;
  setSystemTierId: (id: string | null) => void;
  setApplyUnitTypeToAll: (value: boolean) => void;
  // Add-ons
  toggleAddon: (addonId: string) => void;
  setSelectedAddonIds: (ids: string[]) => void;
  // Customer info
  setCustomerInfo: (info: Partial<CustomerInfo>) => void;
  // Totals
  setTotals: (totals: PricingTotals) => void;
  // Reset
  resetQuote: () => void;
}

const QuoteContext = createContext<QuoteContextValue | null>(null);

export const QuoteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<QuoteState>(INITIAL_STATE);

  // Navigation
  const goToStep = useCallback((step: number) => {
    setState((prev) => ({ ...prev, currentStep: step }));
  }, []);

  const nextStep = useCallback(() => {
    setState((prev) => ({ ...prev, currentStep: prev.currentStep + 1 }));
  }, []);

  const prevStep = useCallback(() => {
    setState((prev) => ({ ...prev, currentStep: Math.max(0, prev.currentStep - 1) }));
  }, []);

  // Room management
  const addRoom = useCallback((room: RoomConfig) => {
    setState((prev) => ({
      ...prev,
      selectedRooms: [...prev.selectedRooms, room],
    }));
  }, []);

  const updateRoom = useCallback((id: string, updates: Partial<RoomConfig>) => {
    setState((prev) => ({
      ...prev,
      selectedRooms: prev.selectedRooms.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    }));
  }, []);

  const removeRoom = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      selectedRooms: prev.selectedRooms.filter((r) => r.id !== id),
    }));
  }, []);

  const setSelectedRooms = useCallback((rooms: RoomConfig[]) => {
    setState((prev) => ({ ...prev, selectedRooms: rooms }));
  }, []);

  // Equipment selections
  const setUnitTypeId = useCallback((id: string | null) => {
    setState((prev) => ({ ...prev, unitTypeId: id }));
  }, []);

  const setSystemTierId = useCallback((id: string | null) => {
    setState((prev) => ({ ...prev, systemTierId: id }));
  }, []);

  const setApplyUnitTypeToAll = useCallback((value: boolean) => {
    setState((prev) => ({ ...prev, applyUnitTypeToAll: value }));
  }, []);

  // Add-ons
  const toggleAddon = useCallback((addonId: string) => {
    setState((prev) => {
      const isSelected = prev.selectedAddonIds.includes(addonId);
      return {
        ...prev,
        selectedAddonIds: isSelected
          ? prev.selectedAddonIds.filter((id) => id !== addonId)
          : [...prev.selectedAddonIds, addonId],
      };
    });
  }, []);

  const setSelectedAddonIds = useCallback((ids: string[]) => {
    setState((prev) => ({ ...prev, selectedAddonIds: ids }));
  }, []);

  // Customer info
  const setCustomerInfo = useCallback((info: Partial<CustomerInfo>) => {
    setState((prev) => ({
      ...prev,
      customerInfo: { ...prev.customerInfo, ...info },
    }));
  }, []);

  // Totals
  const setTotals = useCallback((totals: PricingTotals) => {
    setState((prev) => ({ ...prev, totals }));
  }, []);

  // Reset
  const resetQuote = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  const value = useMemo<QuoteContextValue>(
    () => ({
      state,
      goToStep,
      nextStep,
      prevStep,
      addRoom,
      updateRoom,
      removeRoom,
      setSelectedRooms,
      setUnitTypeId,
      setSystemTierId,
      setApplyUnitTypeToAll,
      toggleAddon,
      setSelectedAddonIds,
      setCustomerInfo,
      setTotals,
      resetQuote,
    }),
    [
      state,
      goToStep,
      nextStep,
      prevStep,
      addRoom,
      updateRoom,
      removeRoom,
      setSelectedRooms,
      setUnitTypeId,
      setSystemTierId,
      setApplyUnitTypeToAll,
      toggleAddon,
      setSelectedAddonIds,
      setCustomerInfo,
      setTotals,
      resetQuote,
    ]
  );

  return <QuoteContext.Provider value={value}>{children}</QuoteContext.Provider>;
};

export const useQuote = (): QuoteContextValue => {
  const ctx = useContext(QuoteContext);
  if (!ctx) {
    throw new Error("useQuote must be used within a QuoteProvider");
  }
  return ctx;
};
