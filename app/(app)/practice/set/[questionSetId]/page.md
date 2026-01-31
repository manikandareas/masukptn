# Practice Set Detail Page

## Route
`/practice/set/[questionSetId]`

## Purpose
Detail page for a specific question set showing information about the set and options to start a practice session.

## Features
- Question set details (name, description, question count)
- Time mode selection (relaxed/timed)
- Start practice session button
- Back to catalog navigation

## Data Schema

### Prefetched Query Data
```typescript
// Same catalog data as practice home
interface PracticeCatalog {
  exams: PracticeCatalogExam[];
}
// See /practice page for full interface
```

### URL Parameters
```typescript
interface RouteParams {
  questionSetId: string; // UUID of the question set
}
```

## Props Passed to Component
```typescript
interface PracticeSetDetailPageProps {
  questionSetId: string; // UUID from URL
}
```

## Component Used
- `PracticeSetDetailPage` from `@/features/practice/components/practice-set-detail-page`

## Server Functions Used
- `requireAuth()` from `@/lib/auth`
- `getPracticeCatalog()` from `@/features/practice/server/get-practice-catalog`

## Authentication
**Required**: Yes - redirects to `/signin` if not authenticated
