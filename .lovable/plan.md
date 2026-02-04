

## Add Google OAuth with Invite-Only Admin Access

### Overview

Add Google authentication to the admin login page while ensuring **only invited users** (those already in your `user_roles` table) can access the admin area. This means:

- Users can sign in with Google
- But they must be pre-invited (have a role in `user_roles`) to access the admin dashboard
- No self-signup - you control who gets access

---

### How It Works

```text
┌─────────────────────────────────────────────────────────────────────┐
│                         Login Flow                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  User clicks "Sign in with Google"                                  │
│           │                                                         │
│           ▼                                                         │
│  Google OAuth completes → User created in auth.users                │
│           │                                                         │
│           ▼                                                         │
│  Check: Does user have a role in user_roles table?                  │
│           │                                                         │
│     ┌─────┴─────┐                                                   │
│     │           │                                                   │
│    YES          NO                                                  │
│     │           │                                                   │
│     ▼           ▼                                                   │
│  Dashboard   "Access Denied - Contact admin for access"             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

### Inviting Users (Your Workflow)

When you want to give someone admin access:

1. Go to Admin → Users
2. Click "Add User" (creates user with email/password) **OR**
3. Click "Invite Google User" → Enter their Google email → Select role
4. When they sign in with that Google email, they automatically get access

---

### Changes Summary

| File | Change |
|------|--------|
| `src/pages/admin/Login.tsx` | Add "Sign in with Google" button |
| `src/hooks/useAuth.ts` | Add `signInWithGoogle` function |
| `src/pages/admin/Users.tsx` | Add "Invite Google User" dialog (email + role only, no password) |
| `supabase/functions/admin-password-reset/index.ts` | Add `invite_google_user` action |

---

### Technical Details

#### 1. Configure Google OAuth

The Lovable Cloud managed Google OAuth will be used - no additional Google Cloud Console setup required from you.

#### 2. Login Page Changes

Add a Google sign-in button below the existing email/password form:

```text
┌─────────────────────────────────────────────────────┐
│                  🔧 Admin Login                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Email: [________________________]                  │
│  Password: [____________________]                   │
│                                                     │
│         [ Sign In ]                                 │
│                                                     │
│  ─────────────── OR ───────────────                 │
│                                                     │
│         [ 🔵 Sign in with Google ]                  │
│                                                     │
│         [ Go to Home Page ]                         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

#### 3. useAuth Hook Updates

Add a new `signInWithGoogle` function that uses the Lovable Cloud OAuth:

```typescript
const signInWithGoogle = async () => {
  const { error } = await lovable.auth.signInWithOAuth("google", {
    redirect_uri: window.location.origin + "/admin",
  });
  return { error };
};
```

#### 4. Invite Google User Flow

New dialog in Admin → Users:

```text
┌─────────────────────────────────────────────────────┐
│           Invite Google User                        │
├─────────────────────────────────────────────────────┤
│                                                     │
│  This will pre-authorize a Google account to        │
│  access the admin dashboard.                        │
│                                                     │
│  Google Email: [user@gmail.com___________]          │
│                                                     │
│  Role: [ Admin ▼ ]                                  │
│                                                     │
│  Note: The user will sign in with their Google      │
│  account. They won't need a password.               │
│                                                     │
│         [ Cancel ]  [ Send Invite ]                 │
│                                                     │
└─────────────────────────────────────────────────────┘
```

#### 5. Edge Function: Invite Action

Add new action to `admin-password-reset`:

```typescript
else if (action === 'invite_google_user') {
  // Create user with a random secure password (they'll use Google OAuth)
  const { data: newUser, error } = await adminClient.auth.admin.createUser({
    email: email,
    email_confirm: true,
    // No password - they must use Google
  });
  
  // Assign role
  await adminClient.from('user_roles').insert({
    user_id: newUser.user.id,
    role: role,
  });
}
```

---

### Linking Existing Users to Google

For your 4 existing users:
- If they already use the same email for their password login as their Google account, Google OAuth will automatically link to their existing account
- The `user_roles` table already has their permissions, so they'll have immediate access
- They can use either email/password OR Google to sign in

---

### Security Considerations

1. **No Self-Signup**: The `ProtectedRoute` already checks `hasAccess` (role exists in `user_roles`). Users without a role see "Access Denied"

2. **Role Verification**: Happens server-side via the `useUserRole` hook querying the database

3. **OAuth Security**: Google handles the authentication; we only authorize based on your `user_roles` table

4. **Dual Auth Support**: Keep email/password as a fallback (useful if Google is down or for service accounts)

---

### Files to Modify

| File | Action |
|------|--------|
| Run `supabase--configure-social-auth` tool | Configure Google OAuth with Lovable Cloud |
| `src/pages/admin/Login.tsx` | Add Google sign-in button with divider |
| `src/hooks/useAuth.ts` | Add `signInWithGoogle` function using lovable module |
| `src/pages/admin/Users.tsx` | Add "Invite Google User" dialog |
| `supabase/functions/admin-password-reset/index.ts` | Add `invite_google_user` action |

---

### Testing After Implementation

1. Sign out if logged in
2. Go to `/admin/login`
3. Click "Sign in with Google"
4. Verify you're redirected to admin dashboard (since your email has a role)
5. Try with an email NOT in user_roles - should see "Access Denied"

