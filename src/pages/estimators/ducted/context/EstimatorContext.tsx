import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import type {
  DuctedEstimatorState,
  CustomerInfo,
  PricingTotals,
  HomeType,
  HomeLayout,
  SystemCount,
  Coverage,
  SquareFootage,
  AtticInsulation,
  WindowType,
  HomeAge,
  HotColdSpots,
  TempPreference,
  HeatingType,
} from "../types";

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
  bestTimeToCall: null,
  wantsBackupQuote: false,
  notes: "",
};

const INITIAL_TOTALS: PricingTotals = {
  equipmentCost: 0,
  installationCost: 0,
  addonsCost: 0,
  subtotal: 0,
  taxAmount: 0,
  finalTotal: 0,
  monthlyFinancing: 0,
};

const INITIAL_STATE: DuctedEstimatorState = {
  currentStep: 0,
  // Zip code gate
  zipCode: "",
  zipCity: null,
  zipState: null,
  isInServiceArea: null,
  // Home info
  homeType: null,
  homeLayout: null,
  // System details
  systemCount: 1,
  coverage: null,
  squareFootage: null,
  // Insulation & efficiency factors
  atticInsulation: null,
  windowType: null,
  homeAge: null,
  // Usage patterns
  hotColdSpots: null,
  winterTemp: null,
  summerTemp: null,
  // Equipment selection
  heatingType: null,
  selectedTonnage: null,
  scannedEquipmentInfo: null,
  efficiencyTierId: null,
  selectedEquipmentId: null,
  recommendedTonnage: null,
  // Add-ons
  selectedAddonIds: [],
  // Customer
  customerInfo: INITIAL_CUSTOMER_INFO,
  // Totals
  totals: INITIAL_TOTALS,
  // Partial submission tracking
  partialSubmissionId: null,
};

interface EstimatorContextValue {
  state: DuctedEstimatorState;
  // Navigation
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  // Zip code gate setters
  setZipCode: (zipCode: string) => void;
  setZipLocation: (city: string | null, state: string | null) => void;
  setIsInServiceArea: (value: boolean | null) => void;
  // Home info setters
  setHomeType: (type: HomeType | null) => void;
  setHomeLayout: (layout: HomeLayout | null) => void;
  // System details setters
  setSystemCount: (count: SystemCount) => void;
  setCoverage: (coverage: Coverage | null) => void;
  setSquareFootage: (sqft: SquareFootage | null) => void;
  // Insulation & efficiency factor setters
  setAtticInsulation: (value: AtticInsulation | null) => void;
  setWindowType: (value: WindowType | null) => void;
  setHomeAge: (value: HomeAge | null) => void;
  // Usage pattern setters
  setHotColdSpots: (value: HotColdSpots | null) => void;
  setWinterTemp: (temp: TempPreference | null) => void;
  setSummerTemp: (temp: TempPreference | null) => void;
  // Equipment selection setters
  setHeatingType: (type: HeatingType | null) => void;
  setSelectedTonnage: (tonnage: number | null) => void;
  setScannedEquipmentInfo: (info: { brand?: string; tonnage?: number; model?: string; equipmentType?: string } | null) => void;
  setEfficiencyTierId: (id: string | null) => void;
  setSelectedEquipmentId: (id: string | null) => void;
  setRecommendedTonnage: (tonnage: number | null) => void;
  // Add-ons
  toggleAddon: (addonId: string) => void;
  setSelectedAddonIds: (ids: string[]) => void;
  // Customer info
  setCustomerInfo: (info: Partial<CustomerInfo>) => void;
  // Totals
  setTotals: (totals: PricingTotals) => void;
  // Partial submission
  setPartialSubmissionId: (id: string | null) => void;
  // Reset
  resetEstimator: () => void;
}

const EstimatorContext = createContext<EstimatorContextValue | null>(null);

export const EstimatorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<DuctedEstimatorState>(INITIAL_STATE);

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

  // Zip code gate setters
  const setZipCode = useCallback((zipCode: string) => {
    setState((prev) => ({ ...prev, zipCode }));
  }, []);

  const setZipLocation = useCallback((city: string | null, state: string | null) => {
    setState((prev) => ({ ...prev, zipCity: city, zipState: state }));
  }, []);

  const setIsInServiceArea = useCallback((value: boolean | null) => {
    setState((prev) => ({ ...prev, isInServiceArea: value }));
  }, []);

  // Home info setters
  const setHomeType = useCallback((type: HomeType | null) => {
    setState((prev) => ({ ...prev, homeType: type }));
  }, []);

  const setHomeLayout = useCallback((layout: HomeLayout | null) => {
    setState((prev) => ({ ...prev, homeLayout: layout }));
  }, []);

  // System details setters
  const setSystemCount = useCallback((count: SystemCount) => {
    setState((prev) => ({ ...prev, systemCount: count }));
  }, []);

  const setCoverage = useCallback((coverage: Coverage | null) => {
    setState((prev) => ({ ...prev, coverage: coverage }));
  }, []);

  const setSquareFootage = useCallback((sqft: SquareFootage | null) => {
    setState((prev) => ({ ...prev, squareFootage: sqft }));
  }, []);

  // Insulation & efficiency factor setters
  const setAtticInsulation = useCallback((value: AtticInsulation | null) => {
    setState((prev) => ({ ...prev, atticInsulation: value }));
  }, []);

  const setWindowType = useCallback((value: WindowType | null) => {
    setState((prev) => ({ ...prev, windowType: value }));
  }, []);

  const setHomeAge = useCallback((value: HomeAge | null) => {
    setState((prev) => ({ ...prev, homeAge: value }));
  }, []);

  // Usage pattern setters
  const setHotColdSpots = useCallback((value: HotColdSpots | null) => {
    setState((prev) => ({ ...prev, hotColdSpots: value }));
  }, []);

  const setWinterTemp = useCallback((temp: TempPreference | null) => {
    setState((prev) => ({ ...prev, winterTemp: temp }));
  }, []);

  const setSummerTemp = useCallback((temp: TempPreference | null) => {
    setState((prev) => ({ ...prev, summerTemp: temp }));
  }, []);

  // Equipment selection setters
  const setHeatingType = useCallback((type: HeatingType | null) => {
    setState((prev) => ({ ...prev, heatingType: type }));
  }, []);

  const setSelectedTonnage = useCallback((tonnage: number | null) => {
    setState((prev) => ({ ...prev, selectedTonnage: tonnage }));
  }, []);

  const setScannedEquipmentInfo = useCallback((info: { brand?: string; tonnage?: number; model?: string; equipmentType?: string } | null) => {
    setState((prev) => ({ ...prev, scannedEquipmentInfo: info }));
  }, []);

  const setEfficiencyTierId = useCallback((id: string | null) => {
    setState((prev) => ({ ...prev, efficiencyTierId: id }));
  }, []);

  const setSelectedEquipmentId = useCallback((id: string | null) => {
    setState((prev) => ({ ...prev, selectedEquipmentId: id }));
  }, []);

  const setRecommendedTonnage = useCallback((tonnage: number | null) => {
    setState((prev) => ({ ...prev, recommendedTonnage: tonnage }));
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

  // Partial submission tracking
  const setPartialSubmissionId = useCallback((id: string | null) => {
    setState((prev) => ({ ...prev, partialSubmissionId: id }));
  }, []);

  // Reset
  const resetEstimator = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  const value = useMemo<EstimatorContextValue>(
    () => ({
      state,
      // Navigation
      goToStep,
      nextStep,
      prevStep,
      // Zip code gate
      setZipCode,
      setZipLocation,
      setIsInServiceArea,
      // Home info
      setHomeType,
      setHomeLayout,
      // System details
      setSystemCount,
      setCoverage,
      setSquareFootage,
      // Insulation & efficiency factors
      setAtticInsulation,
      setWindowType,
      setHomeAge,
      // Usage patterns
      setHotColdSpots,
      setWinterTemp,
      setSummerTemp,
      // Equipment selection
      setHeatingType,
      setSelectedTonnage,
      setScannedEquipmentInfo,
      setEfficiencyTierId,
      setSelectedEquipmentId,
      setRecommendedTonnage,
      // Add-ons
      toggleAddon,
      setSelectedAddonIds,
      // Customer info
      setCustomerInfo,
      // Totals
      setTotals,
      // Partial submission
      setPartialSubmissionId,
      // Reset
      resetEstimator,
    }),
    [
      state,
      goToStep,
      nextStep,
      prevStep,
      setZipCode,
      setZipLocation,
      setIsInServiceArea,
      setHomeType,
      setHomeLayout,
      setSystemCount,
      setCoverage,
      setSquareFootage,
      setAtticInsulation,
      setWindowType,
      setHomeAge,
      setHotColdSpots,
      setWinterTemp,
      setSummerTemp,
      setHeatingType,
      setSelectedTonnage,
      setScannedEquipmentInfo,
      setEfficiencyTierId,
      setSelectedEquipmentId,
      setRecommendedTonnage,
      toggleAddon,
      setSelectedAddonIds,
      setCustomerInfo,
      setTotals,
      setPartialSubmissionId,
      resetEstimator,
    ]
  );

  return <EstimatorContext.Provider value={value}>{children}</EstimatorContext.Provider>;
};

export const useEstimator = (): EstimatorContextValue => {
  const ctx = useContext(EstimatorContext);
  if (!ctx) {
    throw new Error("useEstimator must be used within an EstimatorProvider");
  }
  return ctx;
};
