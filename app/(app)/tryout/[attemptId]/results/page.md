# Tryout Results Page

## Route
`/tryout/[attemptId]/results`

## Purpose
Results page showing the outcome of a completed tryout session with overall score, per-section breakdown, and performance metrics.

## Features
- Final score and accuracy
- Correct/wrong/blank breakdown
- Per-section performance
- Total time spent
- Comparison with benchmarks
- Review answers button
- Back to tryout catalog

## Data Schema

### Prefetched Query Data
```typescript
// Same session data as tryout session page
interface TryoutSession {
  // ... see /tryout/[attemptId]/page.md for full interface
  status: "completed"; // Only completed sessions
  results: {
    totalQuestions: number;
    correctCount: number;
    wrongCount: number;
    blankCount: number;
    accuracy: number;
    avgTimePerQuestion: number;
    perSection?: Array<{
      subtestId: string;
      subtestName: string;
      correct: number;
      total: number;
      accuracy: number;
      timeSeconds: number;
    }>;
  };
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
interface TryoutResultsPageProps {
  attemptId: string; // UUID from URL
}
```

## Component Used
- `TryoutResultsPage` from `@/features/tryout/components/tryout-results-page`

## Server Functions Used
- `requireAuth()` from `@/lib/auth`
- `getTryoutSession({ attemptId })` from `@/features/tryout/server/get-tryout-session`

## Authentication
**Required**: Yes - redirects to `/signin` if not authenticated
