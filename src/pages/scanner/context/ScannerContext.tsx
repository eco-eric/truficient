import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { ScannerState, ScannerAction, isDfwZipCode, AccumulatedScan } from '../types';

const MAX_SCANS = 5;

const initialState: ScannerState = {
  step: 'zip',
  zipCode: '',
  city: null,
  state: null,
  email: '',
  modelNumber: '',
  serialNumber: '',
  imageBase64: null,
  inputMethod: null,
  isDfw: false,
  isProcessing: false,
  result: null,
  results: [],
  error: null,
};

function scannerReducer(state: ScannerState, action: ScannerAction): ScannerState {
  switch (action.type) {
    case 'SET_ZIP_CODE':
      return { 
        ...state, 
        zipCode: action.payload,
        isDfw: isDfwZipCode(action.payload),
      };
    case 'SET_LOCATION':
      return { 
        ...state, 
        city: action.payload.city,
        state: action.payload.state,
      };
    case 'SET_EMAIL':
      return { ...state, email: action.payload };
    case 'SET_MODEL_NUMBER':
      return { ...state, modelNumber: action.payload };
    case 'SET_SERIAL_NUMBER':
      return { ...state, serialNumber: action.payload };
    case 'SET_IMAGE':
      return { ...state, imageBase64: action.payload };
    case 'SET_INPUT_METHOD':
      return { ...state, inputMethod: action.payload };
    case 'SET_IS_DFW':
      return { ...state, isDfw: action.payload };
    case 'GO_TO_STEP':
      return { ...state, step: action.payload, error: null };
    case 'START_PROCESSING':
      return { ...state, step: 'processing', isProcessing: true, error: null };
    case 'SET_RESULT':
      return { ...state, step: 'results', isProcessing: false, result: action.payload };
    case 'SET_ERROR':
      return { ...state, isProcessing: false, error: action.payload };
    case 'ADD_TO_RESULTS':
      if (!state.result || state.results.length >= MAX_SCANS) {
        return state;
      }
      // Check if this scan is already in results
      if (state.results.some(s => s.id === state.result?.id)) {
        return state;
      }
      const accumulatedScan: AccumulatedScan = {
        ...state.result,
        scannedAt: new Date(),
      };
      return { 
        ...state, 
        results: [...state.results, accumulatedScan],
      };
    case 'REMOVE_FROM_RESULTS':
      return {
        ...state,
        results: state.results.filter(s => s.id !== action.payload),
      };
    case 'SCAN_ANOTHER':
      // Keep zipCode, email, isDfw, and accumulated results
      // Clear current scan data and go to input-method
      return {
        ...state,
        step: 'input-method',
        modelNumber: '',
        serialNumber: '',
        imageBase64: null,
        inputMethod: null,
        isProcessing: false,
        result: null,
        error: null,
      };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

interface ScannerContextType {
  state: ScannerState;
  dispatch: React.Dispatch<ScannerAction>;
}

const ScannerContext = createContext<ScannerContextType | undefined>(undefined);

export function ScannerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(scannerReducer, initialState);

  return (
    <ScannerContext.Provider value={{ state, dispatch }}>
      {children}
    </ScannerContext.Provider>
  );
}

export function useScanner() {
  const context = useContext(ScannerContext);
  if (context === undefined) {
    throw new Error('useScanner must be used within a ScannerProvider');
  }
  return context;
}
