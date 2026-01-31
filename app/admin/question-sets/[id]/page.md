# Admin Edit Question Set Page

## Route
`/admin/question-sets/[id]`

## Purpose
Admin page for editing an existing question set.

## Features
- Pre-populated question set form
- All fields from new question set page
- Existing questions listed
- Add/remove/reorder questions
- Save changes (as draft or publish)
- Delete question set action
- Form validation

## Data Schema

### Prefetched Query Data
```typescript
interface AdminQuestionSetDetail {
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
  questions: Array<{
    id: string;
    questionSetId: string;
    questionId: string;
    sortOrder: number;
    createdAt: Date;
    updatedAt: Date;
    question: {
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
    };
  }>;
}
```

### URL Parameters
```typescript
interface RouteParams {
  id: string; // UUID of the question set to edit
}
```

## Props Passed to Component
```typescript
interface AdminQuestionSetEditPageProps {
  questionSetId: string; // UUID from URL
}
```

## Component Used
- `AdminQuestionSetEditPage` from `@/features/admin/components/admin-question-set-edit-page`

## Server Functions Used
- `requireAdminUserPage()` from `@/features/admin/server/require-admin-user`
- `getAdminQuestionSetAction({ questionSetId })` from `@/features/admin/server/get-admin-question-set`
- `getAdminExamsAction()` from `@/features/admin/server/get-admin-exams`
- `getAdminSubtestsAction()` from `@/features/admin/server/get-admin-subtests`
- `updateAdminQuestionSetAction({ questionSetId, data })` from `@/features/admin/server/update-admin-question-set`

## Authentication
**Required**: Yes (admin only) - redirects to `/signin` if not authenticated
