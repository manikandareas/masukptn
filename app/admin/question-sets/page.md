# Admin Question Sets List Page

## Route
`/admin/question-sets`

## Purpose
Admin page for listing, filtering, and managing question sets (curated question bundles).

## Features
- Paginated question set list
- Filter by exam, subtest, status
- Question count per set
- Edit question set action
- Delete question set action
- Create new question set button
- Status indicators (draft/published)

## Data Schema

### Prefetched Query Data
```typescript
interface AdminQuestionSetListResponse {
  questionSets: AdminQuestionSetListItem[];
  totalCount: number;
  filters: QuestionSetFiltersAdmin;
}

interface AdminQuestionSetListItem {
  id: string;
  examId: string;
  subtestId: string | null;
  name: string;
  description: string | null;
  status: "draft" | "published";
  createdAt: Date;
  updatedAt: Date;
  exam: {
    id: string;
    code: string;
    name: string;
    description: string | null;
    type: "utbk" | "tka";
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
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
  } | null;
  questionCount: number;
}

interface QuestionSetFiltersAdmin {
  examId?: string;
  subtestId?: string;
  status?: "draft" | "published";
  limit?: number;
  offset?: number;
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
- `AdminQuestionSetsPage` from `@/features/admin/components/admin-question-sets-page`

## Server Functions Used
- `requireAdminUserPage()` from `@/features/admin/server/require-admin-user`
- `getAdminQuestionSetsAction(filters)` from `@/features/admin/server/get-admin-question-sets`

## Authentication
**Required**: Yes (admin only) - redirects to `/signin` if not authenticated
