# Dashboard Page

## Route
`/dashboard`

## Purpose
User analytics dashboard showing performance statistics, trends, and personalized recommendations for study improvement.

## Features
- Summary statistics (total questions, accuracy, time spent)
- Subtest performance breakdown
- Performance trends (7-day and 30-day charts)
- Recent attempts list
- Personalized recommendations based on performance
- Actionable links to practice/tryout

## Data Schema

### Prefetched Query Data
```typescript
interface UserAnalytics {
  summary: UserSummaryStats;
  subtestPerformance: SubtestPerformance[];
  trends: {
    last7Days: PerformanceTrendPoint[];
    last30Days: PerformanceTrendPoint[];
  };
  recentAttempts: RecentAttempt[];
  recommendations: Recommendation[];
}

interface UserSummaryStats {
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  blankCount: number;
  accuracy: number;
  avgTimeSeconds: number;
  totalTimeSeconds: number;
}

interface SubtestPerformance {
  subtestId: string;
  subtestName: string;
  totalQuestions: number;
  correctCount: number;
  accuracy: number;
  avgTimeSeconds: number;
}

interface PerformanceTrendPoint {
  date: string;
  totalQuestions: number;
  correctCount: number;
  accuracy: number;
  avgTimeSeconds: number;
}

interface RecentAttempt {
  id: string;
  mode: "practice" | "tryout";
  status: "in_progress" | "completed" | "abandoned";
  createdAt: string;
  completedAt: string | null;
  totalQuestions: number;
  accuracy: number;
  label: string;
}

interface Recommendation {
  id: string;
  title: string;
  description: string;
  action?: RecommendationAction;
}

interface RecommendationAction =
  | { label: string; to: "/practice" | "/tryout" }
  | {
      label: string;
      to: "/tryout/:attemptId/review";
      params: { attemptId: string };
    };
```

## Props Passed to Component
```typescript
interface DashboardPageProps {
  userEmail: string; // User's email from auth session
}
```

## Component Used
- `DashboardPage` from `@/features/analytics/components/dashboard-page`

## Server Functions Used
- `requireAuth()` from `@/lib/auth`
- `getUserAnalytics()` from `@/features/analytics/server/get-user-analytics`

## Authentication
**Required**: Yes - redirects to `/signin` if not authenticated
