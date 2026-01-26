"use client";

import { useQuery } from '@tanstack/react-query'

import { getAdminQuestionAction } from '@/features/admin/server/get-admin-question'

export type QuestionWithSubtest = Awaited<ReturnType<typeof getAdminQuestionAction>>

export function adminQuestionQueryKey(id: string) {
  return ['admin-question', id] as const
}

async function fetchAdminQuestion(id: string): Promise<QuestionWithSubtest> {
  return getAdminQuestionAction({ id })
}

export function useQuestion(id: string) {
  return useQuery({
    queryKey: adminQuestionQueryKey(id),
    queryFn: () => fetchAdminQuestion(id),
    enabled: !!id,
  })
}
