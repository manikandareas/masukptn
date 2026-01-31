# Admin Questions List Page

## Route
`/admin/questions`

## Purpose
Admin page for listing, filtering, and managing all questions in the question bank.

## Features
- Paginated question list
- Filter by subtest, status, difficulty, question type
- Search by question stem
- Edit question action
- Delete question action
- Create new question button
- Status indicators (draft/published)

## Data Schema

### Prefetched Query Data
```typescript
interface AdminQuestionListResponse {
  questions: AdminQuestionListItem[];
  totalCount: number;
  filters: QuestionFiltersAdmin;
}

interface AdminQuestionListItem {
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

interface QuestionFiltersAdmin {
  subtestId?: string;
  status?: "draft" | "published";
  difficulty?: "easy" | "medium" | "hard";
  questionType?: "single_choice" | "complex_selection" | "fill_in";
  search?: string;
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
- `AdminQuestionsPage` from `@/features/admin/components/admin-questions-page`

## Server Functions Used
- `requireAdminUserPage()` from `@/features/admin/server/require-admin-user`
- `getAdminQuestionsAction(filters)` from `@/features/admin/server/get-admin-questions`
- `getAdminSubtestsAction()` from `@/features/admin/server/get-admin-subtests`

## Authentication
**Required**: Yes (admin only) - redirects to `/signin` if not authenticated
