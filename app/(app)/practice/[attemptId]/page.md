# Practice Session Page

## Route
`/practice/[attemptId]`

## Purpose
Active practice session page where users answer questions in a self-paced practice mode.

## Features
- Question display with markdown rendering
- Answer input (single choice, complex selection, or fill-in)
- Question navigation (previous/next)
- Progress indicator
- Timer (optional for timed mode)
- Submit session button
- Auto-save answers

## Data Schema

### Prefetched Query Data
```typescript
interface PracticeSession {
  id: string;
  userId: string;
  mode: "practice";
  status: "in_progress" | "completed" | "abandoned";
  timeMode: "relaxed" | "timed";
  subtestId: string | null;
  questionSetId: string | null;
  blueprintId: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  totalTimeSeconds: number | null;
  configSnapshot: {
    questionCount?: number;
    timeLimitSeconds?: number;
    currentSectionIndex?: number;
    sectionStartedAt?: string;
  } | null;
  results: {
    totalQuestions: number;
    correctCount: number;
    wrongCount: number;
    blankCount: number;
    accuracy: number;
    avgTimePerQuestion: number;
  } | null;
  createdAt: Date;
  updatedAt: Date;
  items: PracticeSessionItem[];
}

interface PracticeSessionItem {
  id: string;
  attemptId: string;
  questionId: string;
  userAnswer:
    | { type: "single_choice"; selected: string | null }
    | { type: "complex_selection"; rows: Array<{ selected: string | null }> }
    | { type: "fill_in"; value: string | null }
    | null;
  isCorrect: boolean | null;
  partialScore: number | null;
  timeSpentSeconds: number | null;
  answeredAt: Date | null;
  sortOrder: number;
  sectionIndex: number | null;
  createdAt: Date;
  updatedAt: Date;
  question: Question;
}

interface Question {
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
}
```

### URL Parameters
```typescript
interface RouteParams {
  attemptId: string; // UUID of the practice attempt
}
```

## Props Passed to Component
```typescript
interface PracticeSessionPageProps {
  attemptId: string; // UUID from URL
}
```

## Component Used
- `PracticeSessionPage` from `@/features/practice/components/practice-session-page`

## Server Functions Used
- `requireAuth()` from `@/lib/auth`
- `getPracticeSession({ attemptId })` from `@/features/practice/server/get-practice-session`

## Authentication
**Required**: Yes - redirects to `/signin` if not authenticated
