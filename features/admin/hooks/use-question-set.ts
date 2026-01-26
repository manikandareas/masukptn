"use client";

import { useQuery } from '@tanstack/react-query'

import { getAdminQuestionSetAction } from '@/features/admin/server/get-admin-question-set'

export type QuestionSetWithQuestions = Awaited<ReturnType<typeof getAdminQuestionSetAction>>

export function adminQuestionSetQueryKey(id: string) {
  return ['admin-question-set', id] as const
}

async function fetchAdminQuestionSet(id: string): Promise<QuestionSetWithQuestions> {
  return getAdminQuestionSetAction({ id })
}

export function useQuestionSet(id: string) {
  return useQuery({
    queryKey: adminQuestionSetQueryKey(id),
    queryFn: () => fetchAdminQuestionSet(id),
    enabled: !!id,
  })
}
