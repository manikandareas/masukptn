# Sign In Page

## Route
`/signin`

## Purpose
Authentication page where users can sign in to their existing MasukPTN account.

## Features
- Sign in form with email/password
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
- `SignInForm` from `@/features/auth/components/sign-in-form`

## Server Functions Used
- `getUser()` from `@/lib/auth`

## Authentication
- **Required**: No (this is the auth page)
- **Behavior**: Redirects to `/dashboard` if already authenticated
