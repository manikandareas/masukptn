# Blueprint Detail Page

## Route
`/tryout/blueprint/[blueprintId]`

## Purpose
Detail page for a specific tryout blueprint showing section breakdown, timing, and options to start a timed tryout session.

## Features
- Blueprint details (name, version, description)
- Section list with question counts and durations
- Total questions and duration
- Start tryout button
- Back to catalog navigation

## Data Schema

### Prefetched Query Data
```typescript
// Tryout catalog data (same as tryout home)
interface TryoutCatalog {
  exams: TryoutCatalogExam[];
}

// Blueprint specific detail
interface BlueprintDetail {
  id: string;
  examId: string;
  version: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  sections: BlueprintSection[];
  totalQuestions: number;
  totalDurationSeconds: number;
}

interface BlueprintSection {
  id: string;
  blueprintId: string;
  subtestId: string;
  name: string;
  sortOrder: number;
  questionCount: number;
  durationSeconds: number;
  countdownSeconds: number;
  createdAt: Date;
  updatedAt: Date;
  subtest: {
    id: string;
    examId: string;
    code: string;
    name: string;
    description: string | null;
    sortOrder: number;
    isActive: boolean;
    isMandatory: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
}
```

### URL Parameters
```typescript
interface RouteParams {
  blueprintId: string; // UUID of the blueprint
}
```

## Props Passed to Component
```typescript
interface BlueprintDetailPageProps {
  blueprintId: string; // UUID from URL
}
```

## Component Used
- `BlueprintDetailPage` from `@/features/tryout/components/blueprint-detail-page`

## Server Functions Used
- `requireAuth()` from `@/lib/auth`
- `getTryoutCatalog()` from `@/features/tryout/server/get-tryout-catalog`
- `getBlueprintDetail({ blueprintId })` from `@/features/tryout/server/get-blueprint-detail`

## Authentication
**Required**: Yes - redirects to `/signin` if not authenticated
