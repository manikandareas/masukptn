# Admin Edit Imported Question Page

## Route
`/admin/imports/[id]/questions/[questionId]`

## Purpose
Admin page for editing a specific draft question from a question import before saving it to the question bank.

## Features
- Pre-populated question form with AI-extracted content
- All fields from edit question page
- Subtest selection
- Question type selection
- Answer key editing
- Explanation editing
- Save draft question action
- Form validation

## Data Schema

### Prefetched Query Data
```typescript
interface QuestionImportQuestionDetail {
  id: string;
  importId: string;
  subtestId: string | null;
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
  sortOrder: number;
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
  } | null;
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
  id: string; // UUID of the question import
  questionId: string; // UUID of the draft question
}
```

## Props Passed to Component
```typescript
interface AdminImportQuestionEditPageProps {
  importId: string; // UUID from URL
  questionId: string; // UUID from URL
}
```

## Component Used
- `AdminImportQuestionEditPage` from `@/features/admin/components/admin-import-question-edit-page`

## Server Functions Used
- `requireAdminUserPage()` from `@/features/admin/server/require-admin-user`
- `getAdminImportQuestionAction({ importId, questionId })` from `@/features/admin/server/get-admin-import-question`
- `getAdminSubtestsAction()` from `@/features/admin/server/get-admin-subtests`
- `updateAdminImportQuestionAction({ importId, questionId, data })` from `@/features/admin/server/update-admin-import-question`

## Authentication
**Required**: Yes (admin only) - redirects to `/signin` if not authenticated
