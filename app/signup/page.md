# Sign Up Page

## Route
`/signup`

## Purpose
Registration page where new users can create an account to start using MasukPTN.

## Features
- Sign up form with email/password
- Redirects authenticated users to `/dashboard`
- Guest access protection (redirects logged-in users)

## Data Schema

### Prefetched Query Data
```typescript
// User session check via Supabase auth
interface UserSession {
  user?: {
    id: string;
    email: string;
    // ... other Supabase auth user fields
  } | null;
}
```

## Props Passed to Component
```typescript
// No props - server component handles auth check
interface Props {
  // None - auth check performed server-side
}
```

## Component Used
- `SignUpForm` from `@/features/auth/components/sign-up-form`

## Server Functions Used
- `getUser()` from `@/lib/auth`

## Authentication
- **Required**: No (this is the auth page)
- **Behavior**: Redirects to `/dashboard` if already authenticated
