# Practice Results Page

## Route
`/practice/[attemptId]/results`

## Purpose
Results page showing the outcome of a completed practice session with score breakdown and answer review.

## Features
- Final score and accuracy
- Correct/wrong/blank breakdown
- Per-question results
- Review answers with explanations
- Time spent per question
- Back to practice catalog

## Data Schema

### Prefetched Query Data
```typescript
// Same session data as practice session page
interface PracticeSession {
  // ... see /practice/[attemptId]/page.md for full interface
  status: "completed"; // Only completed sessions
  results: {
    totalQuestions: number;
    correctCount: number;
    wrongCount: number;
    blankCount: number;
    accuracy: number;
    avgTimePerQuestion: number;
  };
}
```

### URL Parameters
```typescript
interface RouteParams {
  attemptId: string; // UUID of the completed practice attempt
}
```

## Props Passed to Component
```typescript
interface PracticeResultsPageProps {
  attemptId: string; // UUID from URL
}
```

## Component Used
- `PracticeResultsPage` from `@/features/practice/components/practice-results-page`

## Server Functions Used
- `requireAuth()` from `@/lib/auth`
- `getPracticeSession({ attemptId })` from `@/features/practice/server/get-practice-session`

## Authentication
**Required**: Yes - redirects to `/signin` if not authenticated
