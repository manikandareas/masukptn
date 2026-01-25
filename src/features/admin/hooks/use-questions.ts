"use client";

import { useQuery } from '@tanstack/react-query'

import { getAdminQuestionsAction } from '@/features/admin/server/get-admin-questions'
import { getAdminSubtestsAction } from '@/features/admin/server/get-admin-subtests'
import type { QuestionFilters } from '../types'
import type { SubtestOption } from '../components'

export type QuestionsResponse = Awaited<ReturnType<typeof getAdminQuestionsAction>>

export function adminQuestionsQueryKey(filters: QuestionFilters) {
  return ['admin-questions', filters] as const
}

async function fetchAdminQuestions(filters: QuestionFilters): Promise<QuestionsResponse> {
  return getAdminQuestionsAction(filters)
}

export function useAdminQuestions(filters: QuestionFilters) {
  return useQuery({
    queryKey: adminQuestionsQueryKey(filters),
    queryFn: () => fetchAdminQuestions(filters),
  })
}

// Subtests for filters
export const adminSubtestsQueryKey = ['admin-subtests']

async function fetchAdminSubtests(): Promise<SubtestOption[]> {
  return getAdminSubtestsAction()
}

export function useAdminSubtests() {
  return useQuery({
    queryKey: adminSubtestsQueryKey,
    queryFn: fetchAdminSubtests,
    staleTime: 5 * 60 * 1000, // 5 minutes - subtests don't change often
  })
}
