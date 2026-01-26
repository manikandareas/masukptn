import type {
  PerformanceTrendPoint,
  SubtestPerformance,
  UserSummaryStats,
} from '@/data-access/queries/analytics'

export type RecommendationAction =
  | {
      label: string
      to: '/practice' | '/tryout'
    }
  | {
      label: string
      to: '/tryout/:attemptId/review'
      params: { attemptId: string }
    }

export type Recommendation = {
  id: string
  title: string
  description: string
  action?: RecommendationAction
}

export type RecentAttempt = {
  id: string
  mode: 'practice' | 'tryout'
  status: 'in_progress' | 'completed' | 'abandoned'
  createdAt: string
  completedAt: string | null
  totalQuestions: number
  accuracy: number
  label: string
}

export type UserAnalytics = {
  summary: UserSummaryStats
  subtestPerformance: SubtestPerformance[]
  trends: {
    last7Days: PerformanceTrendPoint[]
    last30Days: PerformanceTrendPoint[]
  }
  recentAttempts: RecentAttempt[]
  recommendations: Recommendation[]
}
