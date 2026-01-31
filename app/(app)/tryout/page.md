# Tryout Home Page

## Route
`/tryout`

## Purpose
Tryout catalog page showing available exam blueprints for timed UTBK/TKA simulation sessions.

## Features
- List of active exams (UTBK, TKA)
- Blueprints grouped by exam
- Total questions per blueprint
- Total duration per blueprint
- Section breakdown preview
- Start tryout action

## Data Schema

### Prefetched Query Data
```typescript
interface TryoutCatalog {
  exams: TryoutCatalogExam[];
}

interface TryoutCatalogExam {
  id: string;
  code: string;
  name: string;
  description: string | null;
  type: "utbk" | "tka";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  blueprints: TryoutCatalogBlueprint[];
}

interface TryoutCatalogBlueprint {
  id: string;
  examId: string;
  version: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  sections: TryoutCatalogBlueprintSection[];
  totalQuestions: number;
  totalDurationSeconds: number;
}

interface TryoutCatalogBlueprintSection {
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

## Props Passed to Component
```typescript
// No props - data prefetched via React Query
interface Props {
  // None
}
```

## Component Used
- `TryoutHomePage` from `@/features/tryout/components/tryout-home-page`

## Server Functions Used
- `requireAuth()` from `@/lib/auth`
- `getTryoutCatalog()` from `@/features/tryout/server/get-tryout-catalog`

## Authentication
**Required**: Yes - redirects to `/signin` if not authenticated
