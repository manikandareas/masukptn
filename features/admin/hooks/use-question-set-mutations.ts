"use client";

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createAdminQuestionSetAction } from '@/features/admin/server/create-admin-question-set'
import { deleteAdminQuestionSetAction } from '@/features/admin/server/delete-admin-question-set'
import { updateAdminQuestionSetAction } from '@/features/admin/server/update-admin-question-set'
import { updateAdminQuestionSetItemsAction } from '@/features/admin/server/update-admin-question-set-items'
import type { QuestionSetFormData } from '../types'
import { adminStatsQueryKey } from './use-admin-stats'

type QuestionSetResponse = Awaited<ReturnType<typeof updateAdminQuestionSetAction>>

type CreateQuestionSetInput = QuestionSetFormData
type UpdateQuestionSetInput = Partial<QuestionSetFormData> & { id: string }
type UpdateQuestionSetItemsInput = { id: string; questionIds: string[] }

async function createQuestionSet(data: CreateQuestionSetInput): Promise<QuestionSetResponse> {
  return createAdminQuestionSetAction(data)
}

async function updateQuestionSet({ id, ...data }: UpdateQuestionSetInput): Promise<QuestionSetResponse> {
  return updateAdminQuestionSetAction({ id, ...data })
}

async function updateQuestionSetItems({ id, questionIds }: UpdateQuestionSetItemsInput): Promise<QuestionSetResponse> {
  return updateAdminQuestionSetItemsAction({ id, questionIds })
}

async function deleteQuestionSet(id: string): Promise<{ success: boolean }> {
  return deleteAdminQuestionSetAction({ id })
}

async function publishQuestionSet(id: string): Promise<QuestionSetResponse> {
  return updateAdminQuestionSetAction({ id, status: 'published' })
}

async function unpublishQuestionSet(id: string): Promise<QuestionSetResponse> {
  return updateAdminQuestionSetAction({ id, status: 'draft' })
}

export function useCreateQuestionSet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createQuestionSet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-question-sets'] })
      queryClient.invalidateQueries({ queryKey: adminStatsQueryKey })
    },
  })
}

export function useUpdateQuestionSet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateQuestionSet,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-question-sets'] })
      queryClient.invalidateQueries({ queryKey: ['admin-question-set', data.id] })
      queryClient.invalidateQueries({ queryKey: adminStatsQueryKey })
    },
  })
}

export function useUpdateQuestionSetItems() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateQuestionSetItems,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-question-sets'] })
      queryClient.invalidateQueries({ queryKey: ['admin-question-set', data.id] })
    },
  })
}

export function useDeleteQuestionSet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteQuestionSet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-question-sets'] })
      queryClient.invalidateQueries({ queryKey: adminStatsQueryKey })
    },
  })
}

export function usePublishQuestionSet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: publishQuestionSet,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-question-sets'] })
      queryClient.invalidateQueries({ queryKey: ['admin-question-set', data.id] })
      queryClient.invalidateQueries({ queryKey: adminStatsQueryKey })
    },
  })
}

export function useUnpublishQuestionSet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: unpublishQuestionSet,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-question-sets'] })
      queryClient.invalidateQueries({ queryKey: ['admin-question-set', data.id] })
      queryClient.invalidateQueries({ queryKey: adminStatsQueryKey })
    },
  })
}
