# Admin New Question Set Page

## Route
`/admin/question-sets/new`

## Purpose
Admin page for creating a new question set (curated question bundle).

## Features
- Question set form
- Exam selection
- Optional subtest selection
- Name and description input
- Question selection (search and add)
- Question ordering (drag to reorder)
- Remove questions from set
- Save as draft or publish
- Form validation

## Data Schema

### Prefetched Query Data
```typescript
interface AdminExamList {
  exams: Array<{
    id: string;
    code: string;
    name: string;
    type: "utbk" | "tka";
  }>;
}

interface AdminSubtestList {
  subtests: Array<{
    id: string;
    code: string;
    name: string;
    examId: string;
    exam: {
      id: string;
      code: string;
      name: string;
    };
  }>;
}
```

## Props Passed to Component
```typescript
// No props - new question set form
interface Props {
  // None
}
```

## Component Used
- `AdminQuestionSetNewPage` from `@/features/admin/components/admin-question-set-new-page`

## Server Functions Used
- `requireAdminUserPage()` from `@/features/admin/server/require-admin-user`
- `getAdminExamsAction()` from `@/features/admin/server/get-admin-exams`
- `getAdminSubtestsAction()` from `@/features/admin/server/get-admin-subtests`
- `createAdminQuestionSetAction(data)` from `@/features/admin/server/create-admin-question-set`

## Authentication
**Required**: Yes (admin only) - redirects to `/signin` if not authenticated
