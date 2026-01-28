"use client";

import { useEffect, useMemo } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
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
import { HugeiconsIcon } from '@hugeicons/react'
import { Add01Icon, Delete02Icon, Upload04Icon, ArrowDown01Icon, Alert02Icon } from '@hugeicons/core-free-icons'

import { MarkdownEditor } from './markdown-editor'
import { AnswerKeyEditor } from './answer-key-editor'
import { ExplanationEditor } from './explanation-editor'
import { TagInput } from './tag-input'
import {
  questionFormSchema,
  validateForPublish,
  type QuestionFormValues,
  type QuestionType,
  type Difficulty,
  type ContentStatus,
} from '../types'

// Subtest type from the API
export type SubtestOption = {
  id: string
  code: string
  name: string
  exam?: {
    id: string
    code: string
    name: string
  }
}

interface QuestionFormProps {
  question?: QuestionFormValues & { id?: string; status?: ContentStatus }
  subtests: SubtestOption[]
  onSubmit: (data: QuestionFormValues) => Promise<void>
  onPublish?: () => Promise<void>
  onUnpublish?: () => Promise<void>
  onDelete?: () => Promise<void>
  isSubmitting?: boolean
  isPublishing?: boolean
  suggestedTags?: string[]
}

const QUESTION_TYPES: { value: QuestionType; label: string; description: string }[] = [
  { value: 'single_choice', label: 'Single Choice', description: 'A-E single selection' },
  { value: 'complex_selection', label: 'Complex Selection', description: 'Table-based multi-row' },
  { value: 'fill_in', label: 'Fill In', description: 'Short answer/rumpang' },
]

const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
]

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E'] as const

export function QuestionForm({
  question,
  subtests,
  onSubmit,
  onPublish,
  onUnpublish,
  onDelete,
  isSubmitting = false,
  isPublishing = false,
  suggestedTags = [],
}: QuestionFormProps) {
  const isEditMode = !!question?.id

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: question ?? {
      subtestId: '',
      questionType: 'single_choice',
      stimulus: '',
      stem: '',
      options: ['', '', '', '', ''],
      complexOptions: [],
      answerKey: { type: 'single_choice', correct: '' },
      explanation: { level1: '', level1WrongOptions: {}, level2: [] },
      difficulty: 'medium',
      topicTags: [],
      sourceYear: undefined,
      sourceInfo: '',
    },
    mode: 'onBlur', // Validate on blur for better UX
  })

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty, isSubmitted },
  } = form

  const questionType = watch('questionType')
  const options = watch('options') ?? []
  const complexOptions = watch('complexOptions') ?? []
  const status = question?.status ?? 'draft'
  const topicTags = watch('topicTags') ?? []

  // Collect all validation errors for summary display
  const validationErrors = useMemo(() => {
    const errorList: string[] = []
    
    if (errors.subtestId) {
      errorList.push('Subtest is required')
    }
    if (errors.stem) {
      errorList.push('Question stem is required')
    }
    if (errors.answerKey) {
      const answerKeyError = errors.answerKey as { message?: string }
      errorList.push(answerKeyError.message || 'Answer key is not properly configured')
    }
    
    return errorList
  }, [errors])

  // Check publish readiness (for draft questions)
  const formValues = watch()
  const publishValidation = useMemo(() => {
    return validateForPublish(formValues)
  }, [formValues])

  // Complex options field array
  const {
    fields: complexFields,
    append: appendComplex,
    remove: removeComplex,
  } = useFieldArray({
    control,
    name: 'complexOptions',
  })


  // Reset answer key when question type changes
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'questionType') {
        const newType = value.questionType as QuestionType
        if (newType === 'single_choice') {
          setValue('answerKey', { type: 'single_choice', correct: '' })
        } else if (newType === 'complex_selection') {
          setValue('answerKey', { type: 'complex_selection', rows: [] })
        } else if (newType === 'fill_in') {
          setValue('answerKey', { type: 'fill_in', accepted: [''] })
        }
      }
    })
    return () => subscription.unsubscribe()
  }, [watch, setValue])

  const handleFormSubmit = handleSubmit(async (data) => {
    await onSubmit(data)
  })

  // Group subtests by exam
  const subtestsByExam = subtests.reduce((acc, subtest) => {
    const examName = subtest.exam?.name ?? "Unknown Exam"
    if (!acc[examName]) {
      acc[examName] = []
    }
    acc[examName].push(subtest)
    return acc
  }, {} as Record<string, SubtestOption[]>)

  return (
    <form onSubmit={handleFormSubmit} className="flex flex-col gap-6">
      {/* Status Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant={status === 'published' ? 'default' : 'secondary'}>
            {status}
          </Badge>
          {isDirty && (
            <span className="text-[10px] text-muted-foreground">Unsaved changes</span>
          )}
          {/* Publish readiness indicator for draft questions */}
          {status === 'draft' && !isDirty && (
            publishValidation.valid ? (
              <span className="text-[10px] text-green-600 dark:text-green-400">Ready to publish</span>
            ) : (
              <span className="text-[10px] text-amber-600 dark:text-amber-400">Not ready to publish</span>
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
              disabled={isPublishing || !publishValidation.valid}
              title={!publishValidation.valid ? publishValidation.errors.join(', ') : undefined}
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

      {/* Publish Readiness Errors (for draft questions) */}
      {status === 'draft' && !publishValidation.valid && isEditMode && (
        <Alert>
          <AlertDescription>
            <p className="font-medium mb-1 text-xs">To publish this question, please address:</p>
            <ul className="list-disc list-inside text-xs space-y-0.5 text-muted-foreground">
              {publishValidation.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Validation Error Summary */}
      {isSubmitted && validationErrors.length > 0 && (
        <Alert variant="destructive">
          <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} className="size-4" />
          <AlertDescription>
            <p className="font-medium mb-1">Please fix the following errors before saving:</p>
            <ul className="list-disc list-inside text-xs space-y-0.5">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <Separator />

      {/* Basic Info Section */}
      <FieldGroup>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Subtest Selection */}
          <Field>
            <FieldLabel className="text-xs font-mono text-muted-foreground uppercase">
              Subtest
            </FieldLabel>
            <Select
              value={watch('subtestId')}
              onValueChange={(v) => setValue('subtestId', v ?? '', { shouldValidate: true })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select subtest..." />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(subtestsByExam).map(([examName, examSubtests]) => (
                  <div key={examName}>
                    <div className="px-2 py-1.5 text-[10px] font-medium text-muted-foreground uppercase">
                      {examName}
                    </div>
                    {examSubtests.map((subtest) => (
                      <SelectItem key={subtest.id} value={subtest.id}>
                        {subtest.code.toUpperCase()} - {subtest.name}
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
            {errors.subtestId && <FieldError>{errors.subtestId.message}</FieldError>}
          </Field>

          {/* Question Type Selection */}
          <Field>
            <FieldLabel className="text-xs font-mono text-muted-foreground uppercase">
              Question Type
            </FieldLabel>
            <Select
              value={questionType}
              onValueChange={(v) => setValue('questionType', (v ?? 'single_choice') as QuestionType, { shouldValidate: true })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select type..." />
              </SelectTrigger>
              <SelectContent>
                {QUESTION_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <span>{type.label}</span>
                    <span className="text-muted-foreground ml-2">({type.description})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.questionType && <FieldError>{errors.questionType.message}</FieldError>}
          </Field>
        </div>
      </FieldGroup>

      <Separator />


      {/* Content Section */}
      <FieldGroup>
        {/* Stimulus (Optional) */}
        <MarkdownEditor
          value={watch('stimulus') ?? ''}
          onChange={(v) => setValue('stimulus', v)}
          label="Stimulus (Optional)"
          placeholder="Enter passage or context for the question..."
          minHeight="min-h-[100px]"
        />

        {/* Stem (Required) */}
        <MarkdownEditor
          value={watch('stem')}
          onChange={(v) => setValue('stem', v, { shouldValidate: true })}
          label="Question Stem"
          placeholder="Enter the question text..."
          minHeight="min-h-[120px]"
          error={errors.stem?.message}
        />
      </FieldGroup>

      <Separator />

      {/* Options Section - varies by question type */}
      <FieldGroup>
        {questionType === 'single_choice' && (
          <Field>
            <FieldLabel className="text-xs font-mono text-muted-foreground uppercase">
              Options (A-E)
            </FieldLabel>
            <FieldDescription>
              Enter the answer options. Leave blank for options you do not need.
            </FieldDescription>
            <div className="flex flex-col gap-2 mt-2">
              {OPTION_LETTERS.map((letter, index) => (
                <div key={letter} className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground w-6">{letter}.</span>
                  <Input
                    placeholder={`Option ${letter}`}
                    className="flex-1 font-mono"
                    {...register(`options.${index}`)}
                  />
                </div>
              ))}
            </div>
          </Field>
        )}

        {questionType === 'complex_selection' && (
          <Field>
            <FieldLabel className="text-xs font-mono text-muted-foreground uppercase">
              Complex Options
            </FieldLabel>
            <FieldDescription>
              Add statements with their possible choices (e.g., Benar/Salah).
            </FieldDescription>
            <div className="flex flex-col gap-3 mt-2">
              {complexFields.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 border border-dashed border-border/60 bg-muted/20 py-6">
                  <p className="text-xs text-muted-foreground">No statements added yet</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendComplex({ statement: '', choices: ['Benar', 'Salah'] })}
                  >
                    <HugeiconsIcon icon={Add01Icon} strokeWidth={2} data-icon="inline-start" />
                    Add Statement
                  </Button>
                </div>
              ) : (
                <>
                  {complexFields.map((field, index) => (
                    <div key={field.id} className="border border-border/60 p-3">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-[11px] font-mono text-muted-foreground">
                          Statement {index + 1}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => removeComplex(index)}
                        >
                          <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} className="size-3" />
                        </Button>
                      </div>
                      <Textarea
                        placeholder="Enter statement..."
                        className="font-mono min-h-[60px] mb-2"
                        {...register(`complexOptions.${index}.statement`)}
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground">Choices:</span>
                        <Input
                          placeholder="e.g., Benar, Salah"
                          className="flex-1 font-mono text-[11px]"
                          value={complexOptions[index]?.choices?.join(', ') ?? ''}
                          onChange={(e) => {
                            const choices = e.target.value.split(',').map((c) => c.trim())
                            setValue(`complexOptions.${index}.choices`, choices)
                          }}
                        />
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendComplex({ statement: '', choices: ['Benar', 'Salah'] })}
                    className="w-fit"
                  >
                    <HugeiconsIcon icon={Add01Icon} strokeWidth={2} data-icon="inline-start" />
                    Add Statement
                  </Button>
                </>
              )}
            </div>
          </Field>
        )}

        {questionType === 'fill_in' && (
          <Field>
            <FieldLabel className="text-xs font-mono text-muted-foreground uppercase">
              Fill-in Instructions
            </FieldLabel>
            <FieldDescription>
              The answer key below will define accepted answers. No options needed here.
            </FieldDescription>
          </Field>
        )}
      </FieldGroup>

      <Separator />


      {/* Answer Key Section */}
      <FieldGroup>
        <AnswerKeyEditor
          control={control}
          questionType={questionType}
          options={options}
          complexOptions={complexOptions}
        />
        {errors.answerKey && (
          <FieldError>{(errors.answerKey as { message?: string })?.message}</FieldError>
        )}
      </FieldGroup>

      <Separator />

      {/* Explanation Section */}
      <FieldGroup>
        <ExplanationEditor
          control={control}
          register={register}
          options={options}
          errors={errors.explanation as { level1?: { message?: string } }}
        />
      </FieldGroup>

      <Separator />

      {/* Metadata Section */}
      <FieldGroup>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Difficulty */}
          <Field>
            <FieldLabel className="text-xs font-mono text-muted-foreground uppercase">
              Difficulty
            </FieldLabel>
            <Select
              value={watch('difficulty')}
              onValueChange={(v) => setValue('difficulty', (v ?? 'medium') as Difficulty)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select difficulty..." />
              </SelectTrigger>
              <SelectContent>
                {DIFFICULTIES.map((d) => (
                  <SelectItem key={d.value} value={d.value}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          {/* Source Year */}
          <Field>
            <FieldLabel className="text-xs font-mono text-muted-foreground uppercase">
              Source Year
            </FieldLabel>
            <Input
              type="number"
              placeholder="e.g., 2024"
              min={2000}
              max={2100}
              {...register('sourceYear', { valueAsNumber: true })}
            />
            {errors.sourceYear && <FieldError>{errors.sourceYear.message}</FieldError>}
          </Field>

          {/* Source Info */}
          <Field>
            <FieldLabel className="text-xs font-mono text-muted-foreground uppercase">
              Source Info
            </FieldLabel>
            <Input
              placeholder="e.g., UTBK 2024 Paket A"
              {...register('sourceInfo')}
            />
          </Field>
        </div>

        {/* Topic Tags */}
        <TagInput
          value={topicTags}
          onChange={(tags) => setValue('topicTags', tags)}
          suggestions={suggestedTags}
          label="Topic Tags"
          description="Add tags to help categorize and filter questions"
          placeholder="Add tag..."
        />
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
              Delete Question
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
            {isSubmitting ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Question'}
          </Button>
        </div>
      </div>
    </form>
  )
}
