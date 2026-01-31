# Tryout Session Page

## Route
`/tryout/[attemptId]`

## Purpose
Active tryout session page where users answer questions in timed sections simulating real UTBK/TKA exam conditions.

## Features
- Section-based question flow
- Server-enforced countdown timer
- Current section indicator
- Question display with markdown rendering
- Answer input (single choice, complex selection, or fill-in)
- Question navigation within section
- Submit section button
- Auto-submit on timeout
- Server-side time validation

## Data Schema

### Prefetched Query Data
```typescript
interface TryoutSession {
  id: string;
  userId: string;
  mode: "tryout";
  status: "in_progress" | "completed" | "abandoned";
  timeMode: "relaxed" | "timed";
  subtestId: string | null;
  questionSetId: string | null;
  blueprintId: string;
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
    perSection?: Array<{
      subtestId: string;
      subtestName: string;
      correct: number;
      total: number;
      accuracy: number;
      timeSeconds: number;
    }>;
  } | null;
  createdAt: Date;
  updatedAt: Date;
  items: TryoutSessionItem[];
  blueprint: TryoutBlueprint;
  serverTime: string;
}

interface TryoutSessionItem {
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

interface TryoutBlueprint {
  id: string;
  examId: string;
  version: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  sections: TryoutBlueprintSection[];
}

interface TryoutBlueprintSection {
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

### URL Parameters
```typescript
interface RouteParams {
  attemptId: string; // UUID of the tryout attempt
}
```

## Props Passed to Component
```typescript
interface TryoutSessionPageProps {
  attemptId: string; // UUID from URL
}
```

## Component Used
- `TryoutSessionPage` from `@/features/tryout/components/tryout-session-page`

## Server Functions Used
- `requireAuth()` from `@/lib/auth`
- `getTryoutSession({ attemptId })` from `@/features/tryout/server/get-tryout-session`

## Authentication
**Required**: Yes - redirects to `/signin` if not authenticated
