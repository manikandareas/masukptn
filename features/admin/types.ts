import { z } from 'zod'

// ============================================================================
// Answer Key Schemas
// ============================================================================

export const singleChoiceAnswerKeySchema = z.object({
  type: z.literal('single_choice'),
  correct: z.string().min(1, 'Correct answer is required').regex(/^[A-E]$/, 'Must be a letter A-E'),
})

export const complexSelectionAnswerKeySchema = z.object({
  type: z.literal('complex_selection'),
  rows: z.array(z.object({ correct: z.string().min(1, 'Answer is required') })).min(1, 'At least one row required'),
})

export const fillInAnswerKeySchema = z.object({
  type: z.literal('fill_in'),
  accepted: z.array(z.string().min(1, 'Answer cannot be empty')).min(1, 'At least one accepted answer required'),
  caseSensitive: z.boolean().optional(),
  regex: z.string().optional(),
})

export const answerKeySchema = z.discriminatedUnion('type', [
  singleChoiceAnswerKeySchema,
  complexSelectionAnswerKeySchema,
  fillInAnswerKeySchema,
])

// ============================================================================
// Explanation Schema
// ============================================================================

export const explanationSchema = z.object({
  level1: z.string(),
  level1WrongOptions: z.record(z.string(), z.string()).optional(),
  level2: z.array(z.string()).optional(),
})

// For publishing, L1 is required
export const publishExplanationSchema = z.object({
  level1: z.string().min(1, 'Level 1 explanation is required for publishing'),
  level1WrongOptions: z.record(z.string(), z.string()).optional(),
  level2: z.array(z.string()).optional(),
})

// ============================================================================
// Question Schemas
// ============================================================================

export const questionTypeSchema = z.enum(['single_choice', 'complex_selection', 'fill_in'])
export const difficultySchema = z.enum(['easy', 'medium', 'hard'])
export const contentStatusSchema = z.enum(['draft', 'published'])

export const complexOptionSchema = z.object({
  statement: z.string(),
  choices: z.array(z.string()),
})

export const questionSchema = z.object({
  subtestId: z.string().uuid('Invalid subtest ID'),
  questionType: questionTypeSchema,
  stimulus: z.string().nullable().default(null),
  stem: z.string().min(1, 'Question stem is required'),
  options: z.array(z.string()).nullable().default(null),
  complexOptions: z.array(complexOptionSchema).nullable().default(null),
  answerKey: answerKeySchema,
  explanation: explanationSchema,
  difficulty: difficultySchema.default('medium'),
  topicTags: z.array(z.string()).default([]),
  sourceYear: z.number().int().min(2000).max(2100).nullable().default(null),
  sourceInfo: z.string().max(255).nullable().default(null),
  status: contentStatusSchema.default('draft'),
})

export const updateQuestionSchema = questionSchema.partial().extend({
  id: z.string().uuid(),
})

// ============================================================================
// Question Set Schemas
// ============================================================================

export const questionSetSchema = z.object({
  examId: z.string().uuid('Invalid exam ID'),
  subtestId: z.string().uuid().nullable().default(null),
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().nullable().default(null),
  status: contentStatusSchema.default('draft'),
})

export const updateQuestionSetSchema = questionSetSchema.partial().extend({
  id: z.string().uuid(),
})

export const updateQuestionSetItemsSchema = z.object({
  questionSetId: z.string().uuid(),
  questionIds: z.array(z.string().uuid()),
})

// ============================================================================
// Filter Schemas
// ============================================================================

export const questionFiltersSchema = z.object({
  subtestId: z.string().uuid().optional(),
  status: contentStatusSchema.optional(),
  difficulty: difficultySchema.optional(),
  questionType: questionTypeSchema.optional(),
  search: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
})

export const questionSetFiltersSchema = z.object({
  examId: z.string().uuid().optional(),
  subtestId: z.string().uuid().optional(),
  status: contentStatusSchema.optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
})

// ============================================================================
// Delete Schema
// ============================================================================

export const deleteSchema = z.object({
  id: z.string().uuid(),
})

// ============================================================================
// Type Exports
// ============================================================================

export type AnswerKey = z.infer<typeof answerKeySchema>
export type SingleChoiceAnswerKey = z.infer<typeof singleChoiceAnswerKeySchema>
export type ComplexSelectionAnswerKey = z.infer<typeof complexSelectionAnswerKeySchema>
export type FillInAnswerKey = z.infer<typeof fillInAnswerKeySchema>
export type Explanation = z.infer<typeof explanationSchema>
export type QuestionType = z.infer<typeof questionTypeSchema>
export type Difficulty = z.infer<typeof difficultySchema>
export type ContentStatus = z.infer<typeof contentStatusSchema>
export type ComplexOption = z.infer<typeof complexOptionSchema>
export type QuestionFormData = z.infer<typeof questionSchema>
export type UpdateQuestionData = z.infer<typeof updateQuestionSchema>
export type QuestionSetFormData = z.infer<typeof questionSetSchema>
export type UpdateQuestionSetData = z.infer<typeof updateQuestionSetSchema>
export type QuestionFilters = z.infer<typeof questionFiltersSchema>
export type QuestionSetFilters = z.infer<typeof questionSetFiltersSchema>


// ============================================================================
// Form-specific Types (without defaults for react-hook-form compatibility)
// ============================================================================

// Shared answer key validation refinement
function refineAnswerKey(
  data: {
    questionType: z.infer<typeof questionTypeSchema>
    answerKey: AnswerKey
    complexOptions?: z.infer<typeof complexOptionSchema>[]
  },
  ctx: z.RefinementCtx,
) {
  if (data.questionType === 'single_choice') {
    if (data.answerKey.type !== 'single_choice') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Answer key type must match question type',
        path: ['answerKey'],
      })
    } else if (!data.answerKey.correct || data.answerKey.correct.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Correct answer is required',
        path: ['answerKey'],
      })
    }
  } else if (data.questionType === 'complex_selection') {
    if (data.answerKey.type !== 'complex_selection') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Answer key type must match question type',
        path: ['answerKey'],
      })
    } else {
      const rows = data.answerKey.rows || []
      const complexOptions = data.complexOptions || []

      if (complexOptions.length > 0 && rows.length !== complexOptions.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Answer key must have an answer for each statement',
          path: ['answerKey'],
        })
      }

      const hasEmptyRows = rows.some((row) => !row.correct || row.correct.trim() === '')
      if (hasEmptyRows) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'All rows must have a correct answer selected',
          path: ['answerKey'],
        })
      }
    }
  } else if (data.questionType === 'fill_in') {
    if (data.answerKey.type !== 'fill_in') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Answer key type must match question type',
        path: ['answerKey'],
      })
    } else {
      const accepted = data.answerKey.accepted || []
      const hasValidAnswers = accepted.some((a) => a && a.trim() !== '')
      if (!hasValidAnswers) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'At least one accepted answer is required',
          path: ['answerKey'],
        })
      }
    }
  }
}

// Base schema without refinements for form field validation
const questionFormBaseSchema = z.object({
  subtestId: z.string().min(1, 'Subtest is required'),
  questionType: questionTypeSchema,
  stimulus: z.string().optional(),
  stem: z.string().min(1, 'Question stem is required'),
  options: z.array(z.string()).optional(),
  complexOptions: z.array(complexOptionSchema).optional(),
  answerKey: answerKeySchema,
  explanation: explanationSchema,
  difficulty: difficultySchema,
  topicTags: z.array(z.string()),
  sourceYear: z.number().int().min(2000).max(2100).optional().nullable(),
  sourceInfo: z.string().max(255).optional(),
})

// Full schema with cross-field validation
export const questionFormSchema = questionFormBaseSchema.superRefine((data, ctx) => {
  refineAnswerKey(
    { questionType: data.questionType, answerKey: data.answerKey, complexOptions: data.complexOptions },
    ctx,
  )
})

// Schema for publishing validation (requires L1 explanation)
export const questionPublishSchema = questionFormBaseSchema
  .extend({
    explanation: publishExplanationSchema,
  })
  .superRefine((data, ctx) => {
    refineAnswerKey(
      { questionType: data.questionType, answerKey: data.answerKey, complexOptions: data.complexOptions },
      ctx,
    )
  })

export type QuestionFormValues = z.infer<typeof questionFormBaseSchema>

// Helper function to validate question for publishing
export function validateForPublish(data: QuestionFormValues): { valid: boolean; errors: string[] } {
  const result = questionPublishSchema.safeParse(data)

  if (result.success) {
    return { valid: true, errors: [] }
  }

  const errors = result.error.issues.map((issue) => {
    const path = issue.path.length > 0 ? issue.path.join('.') : 'form'
    return `${path}: ${issue.message}`
  })

  return {
    valid: false,
    errors,
  }
}
