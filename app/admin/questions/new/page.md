# Admin New Question Page

## Route
`/admin/questions/new`

## Purpose
Admin page for creating a new question in the question bank.

## Features
- Question form with markdown editor
- Subtest selection
- Question type selection (single choice, complex selection, fill-in)
- Difficulty selection
- Answer key input based on question type
- Explanation input (level 1 and optional level 2)
- Topic tags input
- Source information
- Save as draft or publish
- Form validation

## Data Schema

### Prefetched Query Data
```typescript
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
// No props - new question form
interface Props {
  // None
}
```

## Component Used
- `AdminQuestionNewPage` from `@/features/admin/components/admin-question-new-page`

## Server Functions Used
- `requireAdminUserPage()` from `@/features/admin/server/require-admin-user`
- `getAdminSubtestsAction()` from `@/features/admin/server/get-admin-subtests`
- `createAdminQuestionAction(data)` from `@/features/admin/server/create-admin-question`

## Authentication
**Required**: Yes (admin only) - redirects to `/signin` if not authenticated
