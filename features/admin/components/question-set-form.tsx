"use client";

import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  ArrowDown01Icon,
  ArrowUp01Icon,
  Delete02Icon,
  Upload04Icon,
  Alert02Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
} from '@/components/ui/field'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { QuestionPicker, type QuestionPickerQuestion } from './question-picker'
import type { ContentStatus } from '../types'

// Form schema for question set
const questionSetFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().optional(),
  examId: z.string().min(1, 'Exam is required'),
  subtestId: z.string().optional().nullable(),
})

export type QuestionSetFormValues = z.infer<typeof questionSetFormSchema>

export type ExamOption = {
  id: string
  code: string
  name: string
}

export type SubtestOption = {
  id: string
  code: string
  name: string
  examId: string
}

// Question in the set with its metadata
export type QuestionInSet = QuestionPickerQuestion & {
  sortOrder?: number
}

interface QuestionSetFormProps {
  questionSet?: QuestionSetFormValues & {
    id?: string
    status?: ContentStatus
    questions?: QuestionInSet[]
  }
  exams: ExamOption[]
  subtests: SubtestOption[]
  onSubmit: (data: QuestionSetFormValues, questionIds: string[]) => Promise<void>
  onPublish?: () => Promise<void>
  onUnpublish?: () => Promise<void>
  onDelete?: () => Promise<void>
  isSubmitting?: boolean
  isPublishing?: boolean
}

const difficultyColors: Record<string, string> = {
  easy: 'bg-green-500/10 text-green-600 dark:text-green-400',
  medium: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  hard: 'bg-red-500/10 text-red-600 dark:text-red-400',
}

function truncateStem(stem: string, maxLength = 50): string {
  const plainText = stem
    .replace(/[#*_`~\[\]()]/g, '')
    .replace(/\n/g, ' ')
    .trim()

  if (plainText.length <= maxLength) return plainText
  return `${plainText.slice(0, maxLength)}...`
}

export function QuestionSetForm({
  questionSet,
  exams,
  subtests,
  onSubmit,
  onPublish,
  onUnpublish,
  onDelete,
  isSubmitting = false,
  isPublishing = false,
}: QuestionSetFormProps) {
  const isEditMode = !!questionSet?.id
  const status = questionSet?.status ?? 'draft'

  // Local state for questions in the set
  const [questions, setQuestions] = useState<QuestionInSet[]>(
    questionSet?.questions ?? []
  )

  const form = useForm<QuestionSetFormValues>({
    resolver: zodResolver(questionSetFormSchema),
    defaultValues: questionSet ?? {
      name: '',
      description: '',
      examId: '',
      subtestId: null,
    },
    mode: 'onBlur',
  })

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = form

  const examId = watch('examId')
  const subtestId = watch('subtestId')

  // Filter subtests by selected exam
  const filteredSubtests = useMemo(() => {
    if (!examId) return []
    return subtests.filter((s) => s.examId === examId)
  }, [subtests, examId])

  // Check for unpublished questions in the set
  const unpublishedQuestions = useMemo(() => {
    return questions.filter((q) => q.status === 'draft')
  }, [questions])

  const hasUnpublishedQuestions = unpublishedQuestions.length > 0

  // Publish validation
  const canPublish = useMemo(() => {
    return questions.length > 0
  }, [questions])

  // Track if questions have changed
  const questionsChanged = useMemo(() => {
    const originalIds = (questionSet?.questions ?? []).map((q) => q.id)
    const currentIds = questions.map((q) => q.id)
    if (originalIds.length !== currentIds.length) return true
    return originalIds.some((id, index) => id !== currentIds[index])
  }, [questionSet?.questions, questions])

  const handleFormSubmit = handleSubmit(async (data) => {
    const questionIds = questions.map((q) => q.id)
    await onSubmit(data, questionIds)
  })

  const handleAddQuestions = (newQuestions: QuestionPickerQuestion[]) => {
    setQuestions((prev) => [...prev, ...newQuestions])
  }

  const handleRemoveQuestion = (questionId: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== questionId))
  }

  const handleMoveUp = (index: number) => {
    if (index === 0) return
    setQuestions((prev) => {
      const next = [...prev]
      const temp = next[index - 1]
      next[index - 1] = next[index]
      next[index] = temp
      return next
    })
  }

  const handleMoveDown = (index: number) => {
    if (index === questions.length - 1) return
    setQuestions((prev) => {
      const next = [...prev]
      const temp = next[index + 1]
      next[index + 1] = next[index]
      next[index] = temp
      return next
    })
  }

  const handleExamChange = (value: string | null) => {
    setValue('examId', value ?? '', { shouldValidate: true })
    // Reset subtest when exam changes
    setValue('subtestId', null)
  }

  const excludeIds = useMemo(() => questions.map((q) => q.id), [questions])

  return (
    <form onSubmit={handleFormSubmit} className="flex flex-col gap-6">
      {/* Status Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant={status === 'published' ? 'default' : 'secondary'}>
            {status}
          </Badge>
          {(isDirty || questionsChanged) && (
            <span className="text-[10px] text-muted-foreground">Unsaved changes</span>
          )}
          {/* Publish readiness indicator */}
          {status === 'draft' && !isDirty && !questionsChanged && (
            canPublish ? (
              <span className="text-[10px] text-green-600 dark:text-green-400">Ready to publish</span>
            ) : (
              <span className="text-[10px] text-amber-600 dark:text-amber-400">Add questions to publish</span>
            )
          )}
        </div>
        <div className="flex items-center gap-2">
          {isEditMode && status === 'draft' && onPublish && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onPublish}
              disabled={isPublishing || !canPublish}
              title={!canPublish ? 'Add at least one question to publish' : undefined}
            >
              <HugeiconsIcon icon={Upload04Icon} strokeWidth={2} data-icon="inline-start" />
              Publish
            </Button>
          )}
          {isEditMode && status === 'published' && onUnpublish && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onUnpublish}
              disabled={isPublishing}
            >
              <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={2} data-icon="inline-start" />
              Unpublish
            </Button>
          )}
        </div>
      </div>

      {/* Warning for unpublished questions */}
      {hasUnpublishedQuestions && (
        <Alert>
          <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} className="size-4" />
          <AlertDescription>
            <p className="font-medium mb-1 text-xs">This set contains {unpublishedQuestions.length} unpublished question{unpublishedQuestions.length !== 1 ? 's' : ''}</p>
            <p className="text-xs text-muted-foreground">
              Unpublished questions will not be visible to students even if this set is published.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* Empty set warning for publishing */}
      {status === 'draft' && questions.length === 0 && isEditMode && (
        <Alert>
          <AlertDescription>
            <p className="text-xs">Add at least one question to publish this question set.</p>
          </AlertDescription>
        </Alert>
      )}

      <Separator />

      {/* Basic Info Section */}
      <FieldGroup>
        <Field>
          <FieldLabel className="text-xs font-mono text-muted-foreground uppercase">
            Name
          </FieldLabel>
          <Input
            placeholder="Enter question set name..."
            className="font-mono"
            {...register('name')}
          />
          {errors.name && <FieldError>{errors.name.message}</FieldError>}
        </Field>

        <Field>
          <FieldLabel className="text-xs font-mono text-muted-foreground uppercase">
            Description (Optional)
          </FieldLabel>
          <Textarea
            placeholder="Enter a description for this question set..."
            className="font-mono min-h-[80px]"
            {...register('description')}
          />
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Exam Selection */}
          <Field>
            <FieldLabel className="text-xs font-mono text-muted-foreground uppercase">
              Exam
            </FieldLabel>
            <Select
              value={examId}
              onValueChange={handleExamChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select exam..." />
              </SelectTrigger>
              <SelectContent>
                {exams.map((exam) => (
                  <SelectItem key={exam.id} value={exam.id}>
                    {exam.code.toUpperCase()} - {exam.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.examId && <FieldError>{errors.examId.message}</FieldError>}
          </Field>

          {/* Subtest Selection (Optional) */}
          <Field>
            <FieldLabel className="text-xs font-mono text-muted-foreground uppercase">
              Subtest (Optional)
            </FieldLabel>
            <Select
              value={subtestId ?? 'none'}
              onValueChange={(v) => setValue('subtestId', v === 'none' ? null : v)}
              disabled={!examId || filteredSubtests.length === 0}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select subtest..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No specific subtest</SelectItem>
                {filteredSubtests.map((subtest) => (
                  <SelectItem key={subtest.id} value={subtest.id}>
                    {subtest.code.toUpperCase()} - {subtest.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldDescription>
              Leave empty for mixed-subtest sets
            </FieldDescription>
          </Field>
        </div>
      </FieldGroup>

      <Separator />

      {/* Questions Section */}
      <FieldGroup>
        <div className="flex items-center justify-between">
          <div>
            <FieldLabel className="text-xs font-mono text-muted-foreground uppercase">
              Questions
            </FieldLabel>
            <FieldDescription>
              {questions.length} question{questions.length !== 1 ? 's' : ''} in this set
            </FieldDescription>
          </div>
          <QuestionPicker
            examId={examId}
            subtestId={subtestId ?? undefined}
            excludeIds={excludeIds}
            onSelect={handleAddQuestions}
          />
        </div>

        {questions.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 border border-dashed border-border/60 bg-muted/20 py-12">
            <p className="text-xs text-muted-foreground">No questions added yet</p>
            <QuestionPicker
              examId={examId}
              subtestId={subtestId ?? undefined}
              excludeIds={excludeIds}
              onSelect={handleAddQuestions}
              trigger={
                <Button variant="outline" size="sm">
                  Add your first question
                </Button>
              }
            />
          </div>
        ) : (
          <div className="border border-border/60">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-12 text-center">#</TableHead>
                  <TableHead className="w-[45%]">Question</TableHead>
                  <TableHead>Subtest</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24 text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questions.map((question, index) => (
                  <TableRow key={question.id}>
                    <TableCell className="text-center text-[11px] text-muted-foreground font-mono">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-mono text-[10px]">
                      {truncateStem(question.stem)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[9px] uppercase">
                        {question.subtest.code}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 text-[9px] font-medium ${difficultyColors[question.difficulty]}`}
                      >
                        {question.difficulty}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={question.status === 'published' ? 'default' : 'secondary'}
                        className="text-[9px]"
                      >
                        {question.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="h-6 w-6"
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0}
                        >
                          <HugeiconsIcon icon={ArrowUp01Icon} strokeWidth={2} className="size-3" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="h-6 w-6"
                          onClick={() => handleMoveDown(index)}
                          disabled={index === questions.length - 1}
                        >
                          <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={2} className="size-3" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="h-6 w-6 text-destructive hover:text-destructive"
                          onClick={() => handleRemoveQuestion(question.id)}
                        >
                          <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} className="size-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </FieldGroup>

      <Separator />

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div>
          {isEditMode && onDelete && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={onDelete}
            >
              Delete Question Set
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => window.history.back()}
          >
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Question Set'}
          </Button>
        </div>
      </div>
    </form>
  )
}
