"use client";

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createAdminQuestionAction } from '@/features/admin/server/create-admin-question'
import { deleteAdminQuestionAction } from '@/features/admin/server/delete-admin-question'
import { updateAdminQuestionAction } from '@/features/admin/server/update-admin-question'
import type { QuestionFormData } from '../types'
import { adminStatsQueryKey } from './use-admin-stats'

type QuestionResponse = Awaited<ReturnType<typeof updateAdminQuestionAction>>

type CreateQuestionInput = QuestionFormData
type UpdateQuestionInput = Partial<QuestionFormData> & { id: string }

async function createQuestion(data: CreateQuestionInput): Promise<QuestionResponse> {
  return createAdminQuestionAction(data)
}

async function updateQuestion({ id, ...data }: UpdateQuestionInput): Promise<QuestionResponse> {
  return updateAdminQuestionAction({ id, ...data })
}

async function deleteQuestion(id: string): Promise<{ success: boolean }> {
  return deleteAdminQuestionAction({ id })
}

async function publishQuestion(id: string): Promise<QuestionResponse> {
  return updateAdminQuestionAction({ id, status: 'published' })
}

async function unpublishQuestion(id: string): Promise<QuestionResponse> {
  return updateAdminQuestionAction({ id, status: 'draft' })
}

export function useCreateQuestion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createQuestion,
    onSuccess: () => {
      // Invalidate questions list and stats
      queryClient.invalidateQueries({ queryKey: ['admin-questions'] })
      queryClient.invalidateQueries({ queryKey: adminStatsQueryKey })
    },
  })
}

export function useUpdateQuestion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateQuestion,
    onSuccess: (data) => {
      // Invalidate questions list and the specific question
      queryClient.invalidateQueries({ queryKey: ['admin-questions'] })
      queryClient.invalidateQueries({ queryKey: ['admin-question', data.id] })
      queryClient.invalidateQueries({ queryKey: adminStatsQueryKey })
    },
  })
}

export function useDeleteQuestion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteQuestion,
    onSuccess: () => {
      // Invalidate questions list and stats
      queryClient.invalidateQueries({ queryKey: ['admin-questions'] })
      queryClient.invalidateQueries({ queryKey: adminStatsQueryKey })
    },
  })
}

export function usePublishQuestion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: publishQuestion,
    onSuccess: (data) => {
      // Invalidate questions list and the specific question
      queryClient.invalidateQueries({ queryKey: ['admin-questions'] })
      queryClient.invalidateQueries({ queryKey: ['admin-question', data.id] })
      queryClient.invalidateQueries({ queryKey: adminStatsQueryKey })
    },
  })
}

export function useUnpublishQuestion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: unpublishQuestion,
    onSuccess: (data) => {
      // Invalidate questions list and the specific question
      queryClient.invalidateQueries({ queryKey: ['admin-questions'] })
      queryClient.invalidateQueries({ queryKey: ['admin-question', data.id] })
      queryClient.invalidateQueries({ queryKey: adminStatsQueryKey })
    },
  })
}
