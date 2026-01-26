"use client";

import { useQuery } from '@tanstack/react-query'

import { getAdminExamsAction } from '@/features/admin/server/get-admin-exams'
import { getAdminQuestionSetsAction } from '@/features/admin/server/get-admin-question-sets'
import { getAdminSubtestsForSetsAction } from '@/features/admin/server/get-admin-subtests-for-sets'
import type { QuestionSetFilters } from '../types'
import type { ExamOption, SubtestOptionForSet } from '../components'

export type QuestionSetsResponse = Awaited<ReturnType<typeof getAdminQuestionSetsAction>>

export function adminQuestionSetsQueryKey(filters: QuestionSetFilters) {
  return ['admin-question-sets', filters] as const
}

async function fetchAdminQuestionSets(filters: QuestionSetFilters): Promise<QuestionSetsResponse> {
  return getAdminQuestionSetsAction(filters)
}

export function useAdminQuestionSets(filters: QuestionSetFilters) {
  return useQuery({
    queryKey: adminQuestionSetsQueryKey(filters),
    queryFn: () => fetchAdminQuestionSets(filters),
  })
}

// Exams for filters
export const adminExamsQueryKey = ['admin-exams']

async function fetchAdminExams(): Promise<ExamOption[]> {
  return getAdminExamsAction()
}

export function useAdminExams() {
  return useQuery({
    queryKey: adminExamsQueryKey,
    queryFn: fetchAdminExams,
    staleTime: 5 * 60 * 1000, // 5 minutes - exams don't change often
  })
}

// Subtests for filters (with examId)
export const adminSubtestsForSetsQueryKey = ['admin-subtests-for-sets']

async function fetchAdminSubtestsForSets(): Promise<SubtestOptionForSet[]> {
  return getAdminSubtestsForSetsAction()
}

export function useAdminSubtestsForSets() {
  return useQuery({
    queryKey: adminSubtestsForSetsQueryKey,
    queryFn: fetchAdminSubtestsForSets,
    staleTime: 5 * 60 * 1000, // 5 minutes - subtests don't change often
  })
}
