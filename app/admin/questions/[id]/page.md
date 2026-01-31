# Admin Edit Question Page

## Route
`/admin/questions/[id]`

## Purpose
Admin page for editing an existing question in the question bank.

## Features
- Pre-populated question form
- All fields from new question page
- Save changes (as draft or publish)
- Delete question action
- Form validation

## Data Schema

### Prefetched Query Data
```typescript
interface AdminQuestionDetail {
  id: string;
  subtestId: string;
  stimulus: string | null;
  stem: string;
  options: string[] | null;
  complexOptions: Array<{ statement: string; choices: string[] }> | null;
  questionType: "single_choice" | "complex_selection" | "fill_in";
  answerKey:
    | { type: "single_choice"; correct: string }
    | { type: "complex_selection"; rows: Array<{ correct: string }> }
    | { type: "fill_in"; accepted: string[]; caseSensitive?: boolean; regex?: string };
  explanation: {
    level1: string;
    level1WrongOptions?: Record<string, string>;
    level2?: string[];
  };
  difficulty: "easy" | "medium" | "hard";
  topicTags: string[];
  sourceYear: number | null;
  sourceInfo: string | null;
  status: "draft" | "published";
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

### URL Parameters
```typescript
interface RouteParams {
  id: string; // UUID of the question to edit
}
```

## Props Passed to Component
```typescript
interface AdminQuestionEditPageProps {
  questionId: string; // UUID from URL
}
```

## Component Used
- `AdminQuestionEditPage` from `@/features/admin/components/admin-question-edit-page`

## Server Functions Used
- `requireAdminUserPage()` from `@/features/admin/server/require-admin-user`
- `getAdminQuestionAction({ questionId })` from `@/features/admin/server/get-admin-question`
- `getAdminSubtestsAction()` from `@/features/admin/server/get-admin-subtests`
- `updateAdminQuestionAction({ questionId, data })` from `@/features/admin/server/update-admin-question`

## Authentication
**Required**: Yes (admin only) - redirects to `/signin` if not authenticated
