import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { ScannerState, ScannerAction, isDfwZipCode } from '../types';

const initialState: ScannerState = {
  step: 'zip',
  zipCode: '',
  email: '',
  modelNumber: '',
  serialNumber: '',
  imageBase64: null,
  isDfw: false,
  isProcessing: false,
  result: null,
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
    case 'SET_EMAIL':
      return { ...state, email: action.payload };
    case 'SET_MODEL_NUMBER':
      return { ...state, modelNumber: action.payload };
    case 'SET_SERIAL_NUMBER':
      return { ...state, serialNumber: action.payload };
    case 'SET_IMAGE':
      return { ...state, imageBase64: action.payload };
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
