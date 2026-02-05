 import { useAuthContext } from '@/contexts/AuthContext';
 
 // Re-export for backwards compatibility - all components using useAuth()
 // will now share a single auth subscription via the AuthContext
 export const useAuth = useAuthContext;
