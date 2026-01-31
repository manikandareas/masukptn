# Tryout Countdown Page

## Route
`/tryout/[attemptId]/countdown`

## Purpose
Pre-section countdown page shown before each section in a tryout session, allowing users to prepare before starting timed questions.

## Features
- Countdown timer (default 30 seconds)
- Section name and question count preview
- Time limit display for upcoming section
- Start section button (skip countdown)
- Auto-redirect when countdown ends

## Data Schema

### URL Parameters
```typescript
interface RouteParams {
  attemptId: string; // UUID of the tryout attempt
}
```

## Props Passed to Component
```typescript
interface TryoutCountdownPageProps {
  attemptId: string; // UUID from URL
}
```

## Component Used
- `TryoutCountdownPage` from `@/features/tryout/components/tryout-countdown-page`

## Server Functions Used
- `requireAuth()` from `@/lib/auth`
- `getTryoutSession({ attemptId })` from `@/features/tryout/server/get-tryout-session`

## Authentication
**Required**: Yes - redirects to `/signin` if not authenticated
