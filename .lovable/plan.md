

## Fix Multiple GoTrueClient Instances and Mobile Auth Issues

### Root Cause Analysis

The investigation found **two critical issues**:

| Issue | Impact |
|-------|--------|
| **No AuthContext/Provider** | Each component calling `useAuth()` creates its own `onAuthStateChange` subscription |
| **React StrictMode double rendering** | Components mount twice, creating duplicate auth listeners |

Currently, `useAuth()` is called in **8 different components**, each setting up its own independent auth listener:
- `ProtectedRoute.tsx`
- `AdminSidebar.tsx`
- `AdminHeader.tsx`
- `MobileAdminNav.tsx`
- `Login.tsx`
- `Settings.tsx`
- `BlogPostEditor.tsx`
- `useUserRole.ts` (which then calls `useAuth()` internally)

This results in **multiple concurrent subscriptions** to auth state changes, causing race conditions especially on mobile devices with slower localStorage access.

---

### Solution: Create Auth Context with Single Subscription

```text
BEFORE (Current - Broken)               AFTER (Fixed)
─────────────────────────────           ───────────────────────────
                                        
  ┌─────────────┐                          ┌─────────────────┐
  │ Component A │──┐                       │  AuthProvider   │ ← Single subscription
  └─────────────┘  │                       └────────┬────────┘
                   │                                │
  ┌─────────────┐  ├──▶ onAuthStateChange   ┌──────┴──────┐
  │ Component B │──┤     (MULTIPLE!)        │  AuthContext │
  └─────────────┘  │                        └──────┬──────┘
                   │                               │
  ┌─────────────┐  │                    ┌──────────┼──────────┐
  │ Component C │──┘                    │          │          │
  └─────────────┘                       ▼          ▼          ▼
                                   Component  Component  Component
```

---

### Files to Create

| File | Purpose |
|------|---------|
| `src/contexts/AuthContext.tsx` | AuthProvider with single auth subscription + context |

### Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/useAuth.ts` | Convert to use context instead of direct subscription |
| `src/App.tsx` | Wrap app with AuthProvider |

---

### Implementation Details

**1. Create AuthContext.tsx**

```typescript
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    isAdmin: false,
  });

  // Single checkAdminRole function
  const checkAdminRole = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();
      return !error && data !== null;
    } catch {
      return false;
    }
  }, []);

  // SINGLE auth subscription for the entire app
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Sync update - no setTimeout needed when using context
        if (session?.user) {
          const isAdmin = await checkAdminRole(session.user.id);
          setAuthState({
            session,
            user: session.user,
            isAdmin,
            loading: false,
          });
        } else {
          setAuthState({
            session: null,
            user: null,
            isAdmin: false,
            loading: false,
          });
        }
      }
    );

    // Check existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const isAdmin = await checkAdminRole(session.user.id);
        setAuthState({
          session,
          user: session.user,
          isAdmin,
          loading: false,
        });
      } else {
        setAuthState({
          session: null,
          user: null,
          isAdmin: false,
          loading: false,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [checkAdminRole]);

  // Auth methods...
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const signInWithGoogle = async () => {
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/admin",
    });
    return { error: error ?? null };
  };

  return (
    <AuthContext.Provider value={{ ...authState, signIn, signUp, signOut, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

**2. Update useAuth.ts**

Convert to a thin wrapper that uses the context:

```typescript
import { useAuthContext } from '@/contexts/AuthContext';

// Re-export for backwards compatibility
export const useAuth = useAuthContext;
```

**3. Update App.tsx**

Wrap the app with AuthProvider:

```typescript
import { AuthProvider } from '@/contexts/AuthContext';

const App = () => (
  <AuthProvider>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        {/* ... rest of app ... */}
      </QueryClientProvider>
    </ThemeProvider>
  </AuthProvider>
);
```

---

### Why This Fixes the Issues

| Problem | Solution |
|---------|----------|
| Multiple `onAuthStateChange` listeners | Single listener in AuthProvider |
| Race conditions on localStorage | One source of truth for auth state |
| React StrictMode double mount | Context persists across re-renders |
| Mobile stuck spinner | Synchronous state updates from context |

---

### Additional Optimization: useUserRole

The `useUserRole` hook also calls `useAuth()` internally. With the context pattern, this becomes efficient:

```typescript
// useUserRole.ts - no changes needed, it will automatically
// use the shared context instead of creating its own subscription
export const useUserRole = () => {
  const { user } = useAuth(); // Now uses context
  // ... rest of hook
};
```

---

### Testing Checklist

After implementation:

1. **Desktop**: Test email/password login and Google OAuth
2. **Mobile**: Test both login methods - should no longer hang
3. **Console**: Verify no "Multiple GoTrueClient instances" warnings
4. **Navigation**: Test navigating between admin pages while logged in

