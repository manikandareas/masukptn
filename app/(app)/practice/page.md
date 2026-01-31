# Practice Home Page

## Route
`/practice`

## Purpose
Practice catalog page showing available question sets organized by exam type for self-paced practice sessions.

## Features
- List of active exams (UTBK, TKA)
- Question sets grouped by exam
- Question count per set
- Subtest filtering
- Search functionality
- Start practice session action

## Data Schema

### Prefetched Query Data
```typescript
interface PracticeCatalog {
  exams: PracticeCatalogExam[];
}

interface PracticeCatalogExam {
  id: string;
  code: string;
  name: string;
  description: string | null;
  type: "utbk" | "tka";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  questionSets: PracticeCatalogQuestionSet[];
}

interface PracticeCatalogQuestionSet {
  id: string;
  examId: string;
  subtestId: string | null;
  name: string;
  description: string | null;
  status: "draft" | "published";
  createdAt: Date;
  updatedAt: Date;
  subtest: {
    id: string;
    code: string;
    name: string;
    examId: string;
    sortOrder: number;
  } | null;
  questionCount: number;
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
- `PracticeHomePage` from `@/features/practice/components/practice-home-page`

## Server Functions Used
- `requireAuth()` from `@/lib/auth`
- `getPracticeCatalog()` from `@/features/practice/server/get-practice-catalog`

## Authentication
**Required**: Yes - redirects to `/signin` if not authenticated
