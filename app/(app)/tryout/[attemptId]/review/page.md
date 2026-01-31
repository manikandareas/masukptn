# Tryout Review Page

## Route
`/tryout/[attemptId]/review`

## Purpose
Answer review page for a completed tryout session, showing each question with user's answer, correct answer, and detailed explanations.

## Features
- Question list with answer status indicators
- Question detail with explanation
- User's answer vs correct answer
- Level 1 explanation (rationale)
- Level 2 explanation (step-by-step steps, if available)
- Time spent per question
- Navigation between questions
- Filter by correct/wrong/blank

## Data Schema

### Prefetched Query Data
```typescript
// Same session data as tryout session page
interface TryoutSession {
  // ... see /tryout/[attemptId]/page.md for full interface
  status: "completed"; // Only completed sessions
}
```

### URL Parameters
```typescript
interface RouteParams {
  attemptId: string; // UUID of the completed tryout attempt
}
```

## Props Passed to Component
```typescript
interface TryoutReviewPageProps {
  attemptId: string; // UUID from URL
}
```

## Component Used
- `TryoutReviewPage` from `@/features/tryout/components/tryout-review-page`

## Server Functions Used
- `requireAuth()` from `@/lib/auth`
- `getTryoutSession({ attemptId })` from `@/features/tryout/server/get-tryout-session`

## Authentication
**Required**: Yes - redirects to `/signin` if not authenticated
