'use server'

import {
  getRecentAttempts,
  getUserPerformanceTrend,
  getUserSubtestPerformance,
  getUserSummaryStats,
} from '@/data-access/queries/analytics'
import { createSupabaseServerClient } from '@/lib/supabase/server'

import type {
  Recommendation,
  RecentAttempt,
  UserAnalytics,
} from '@/features/analytics/types'

const MIN_SAMPLE_SIZE = 10
const LOW_ACCURACY_THRESHOLD = 65
const TRYOUT_REVIEW_THRESHOLD = 80

async function requireAuthUser() {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user) {
    throw new Error('Unauthorized')
  }

  return data.user
}

function buildRecommendations(params: {
  summary: UserAnalytics['summary']
  subtests: UserAnalytics['subtestPerformance']
  recentAttempts: RecentAttempt[]
}): Recommendation[] {
  const { summary, subtests, recentAttempts } = params

  if (summary.totalQuestions === 0) {
    return [
      {
        id: 'start-practice',
        title: 'Start your first practice set',
        description: 'Pick a curated set to build your baseline accuracy.',
        action: {
          label: 'Browse practice',
          to: '/practice',
        },
      },
      {
        id: 'start-tryout',
        title: 'Try a timed UTBK simulation',
        description: 'Experience the real flow and get a benchmark score.',
        action: {
          label: 'Open tryout',
          to: '/tryout',
        },
      },
    ]
  }

  const recommendations: Recommendation[] = []

  const lastTryout = recentAttempts.find(
    (attempt) => attempt.mode === 'tryout' && attempt.status === 'completed',
  )

  if (lastTryout && lastTryout.accuracy < TRYOUT_REVIEW_THRESHOLD) {
    recommendations.push({
      id: 'review-last-tryout',
      title: 'Review your last tryout',
      description:
        'Revisit the mistakes from your most recent tryout and rework them in practice.',
      action: {
        label: 'Open review',
        to: '/tryout/:attemptId/review',
        params: { attemptId: lastTryout.id },
      },
    })
  }

  const weakestSubtest = [...subtests]
    .filter((item) => item.totalQuestions >= MIN_SAMPLE_SIZE)
    .sort((a, b) => a.accuracy - b.accuracy)[0]

  if (weakestSubtest && weakestSubtest.accuracy < LOW_ACCURACY_THRESHOLD) {
    recommendations.push({
      id: `focus-${weakestSubtest.subtestId}`,
      title: `Focus on ${weakestSubtest.subtestName}`,
      description: `Accuracy is ${Math.round(
        weakestSubtest.accuracy,
      )}%. Drill 20 questions to lift this section.`,
      action: {
        label: 'Open practice',
        to: '/practice',
      },
    })
  }

  if (recommendations.length === 0) {
    recommendations.push({
      id: 'keep-momentum',
      title: 'Keep the momentum',
      description: 'Your accuracy is steady. Mix a practice set with one tryout.',
      action: {
        label: 'Start practice',
        to: '/practice',
      },
    })
  }

  return recommendations.slice(0, 3)
}

export async function getUserAnalytics(): Promise<UserAnalytics> {
  const user = await requireAuthUser()

  const [summary, subtestPerformance, last7Days, last30Days, attempts] =
    await Promise.all([
      getUserSummaryStats(user.id),
      getUserSubtestPerformance(user.id),
      getUserPerformanceTrend(user.id, 7),
      getUserPerformanceTrend(user.id, 30),
      getRecentAttempts(user.id, 5),
    ])

  const recentAttempts: RecentAttempt[] = attempts.map((attempt) => ({
    id: attempt.attemptId,
    mode: attempt.mode,
    status: attempt.status,
    createdAt: attempt.createdAt.toISOString(),
    completedAt: attempt.completedAt ? attempt.completedAt.toISOString() : null,
    totalQuestions: attempt.totalQuestions,
    accuracy: attempt.accuracy,
    label:
      attempt.questionSetName ??
      attempt.blueprintName ??
      attempt.subtestName ??
      (attempt.mode === 'tryout' ? 'Tryout session' : 'Practice session'),
  }))

  const recommendations = buildRecommendations({
    summary,
    subtests: subtestPerformance,
    recentAttempts,
  })

  return {
    summary,
    subtestPerformance,
    trends: {
      last7Days,
      last30Days,
    },
    recentAttempts,
    recommendations,
  }
}
