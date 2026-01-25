"use client";

import { useController, type Control } from 'react-hook-form'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Field, FieldLabel, FieldError, FieldDescription } from '@/components/ui/field'
import { HugeiconsIcon } from '@hugeicons/react'
import { Add01Icon, Delete02Icon } from '@hugeicons/core-free-icons'

import type { QuestionFormValues, QuestionType, ComplexOption } from '../types'

interface AnswerKeyEditorProps {
  control: Control<QuestionFormValues>
  questionType: QuestionType
  options?: string[]
  complexOptions?: ComplexOption[]
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E'] as const

export function AnswerKeyEditor({
  control,
  questionType,
  options = [],
  complexOptions = [],
}: AnswerKeyEditorProps) {
  const { field, fieldState } = useController({
    name: 'answerKey',
    control,
  })

  // Render different editors based on question type
  switch (questionType) {
    case 'single_choice':
      return (
        <SingleChoiceEditor
          value={field.value}
          onChange={field.onChange}
          options={options}
          error={fieldState.error?.message}
        />
      )
    case 'complex_selection':
      return (
        <ComplexSelectionEditor
          value={field.value}
          onChange={field.onChange}
          complexOptions={complexOptions}
          error={fieldState.error?.message}
        />
      )
    case 'fill_in':
      return (
        <FillInEditor
          value={field.value}
          onChange={field.onChange}
          error={fieldState.error?.message}
        />
      )
    default:
      return null
  }
}


// Single Choice Editor - RadioGroup for A-E selection
interface SingleChoiceEditorProps {
  value: QuestionFormValues['answerKey']
  onChange: (value: QuestionFormValues['answerKey']) => void
  options: string[]
  error?: string
}

function SingleChoiceEditor({ value, onChange, options, error }: SingleChoiceEditorProps) {
  const currentValue = value?.type === 'single_choice' ? value.correct : ''
  
  // Check if any options are filled in
  const hasAnyOptions = options.some(opt => opt && opt.trim().length > 0)

  const handleChange = (correct: string) => {
    onChange({ type: 'single_choice', correct })
  }

  return (
    <Field>
      <FieldLabel className="text-xs font-mono text-muted-foreground uppercase">
        Correct Answer
      </FieldLabel>
      <FieldDescription>Select the correct option (A-E)</FieldDescription>
      
      {!hasAnyOptions && (
        <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
          Add options above before selecting the correct answer.
        </p>
      )}
      
      <RadioGroup
        value={currentValue}
        onValueChange={handleChange}
        className="flex flex-row gap-4 mt-2"
      >
        {OPTION_LETTERS.map((letter, index) => {
          const optionText = options[index] || ''
          const hasOption = optionText.trim().length > 0
          
          return (
            <label
              key={letter}
              className={cn(
                'flex items-center gap-2 cursor-pointer',
                !hasOption && 'opacity-50'
              )}
            >
              <RadioGroupItem value={letter} disabled={!hasOption} />
              <span className="text-xs font-mono">{letter}</span>
            </label>
          )
        })}
      </RadioGroup>

      {error && <FieldError>{error}</FieldError>}
      {!currentValue && hasAnyOptions && (
        <p className="text-xs text-muted-foreground mt-1">
          Please select the correct answer to save the question.
        </p>
      )}
    </Field>
  )
}

// Complex Selection Editor - Table with Select dropdowns per row
interface ComplexSelectionEditorProps {
  value: QuestionFormValues['answerKey']
  onChange: (value: QuestionFormValues['answerKey']) => void
  complexOptions: ComplexOption[]
  error?: string
}

function ComplexSelectionEditor({
  value,
  onChange,
  complexOptions,
  error,
}: ComplexSelectionEditorProps) {
  const rows = value?.type === 'complex_selection' ? value.rows : []

  const handleRowChange = (rowIndex: number, correct: string) => {
    const newRows = [...rows]
    newRows[rowIndex] = { correct }
    onChange({ type: 'complex_selection', rows: newRows })
  }

  // Initialize rows if needed
  if (complexOptions.length > 0 && rows.length !== complexOptions.length) {
    const initialRows = complexOptions.map(() => ({ correct: '' }))
    onChange({ type: 'complex_selection', rows: initialRows })
    return null
  }

  if (complexOptions.length === 0) {
    return (
      <Field>
        <FieldLabel className="text-xs font-mono text-muted-foreground uppercase">
          Answer Key
        </FieldLabel>
        <p className="text-xs text-muted-foreground">
          Add complex options above to configure the answer key.
        </p>
      </Field>
    )
  }

  return (
    <Field>
      <FieldLabel className="text-xs font-mono text-muted-foreground uppercase">
        Answer Key
      </FieldLabel>
      <FieldDescription>Select the correct answer for each row</FieldDescription>

      <div className="border border-border/60 mt-2">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-12">#</TableHead>
              <TableHead>Statement</TableHead>
              <TableHead className="w-32">Correct Answer</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {complexOptions.map((option, index) => (
              <TableRow key={index}>
                <TableCell className="font-mono text-[11px]">{index + 1}</TableCell>
                <TableCell className="text-[11px]">
                  {option.statement.length > 50
                    ? `${option.statement.slice(0, 50)}...`
                    : option.statement}
                </TableCell>
                <TableCell>
                  <Select
                    value={rows[index]?.correct || ''}
                    onValueChange={(v) => handleRowChange(index, v ?? '')}
                  >
                    <SelectTrigger size="sm" className="w-full">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {option.choices.map((choice, choiceIndex) => (
                        <SelectItem key={choiceIndex} value={choice}>
                          {choice}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {error && <FieldError>{error}</FieldError>}
    </Field>
  )
}


// Fill In Editor - Input array for accepted answers + case sensitivity toggle
interface FillInEditorProps {
  value: QuestionFormValues['answerKey']
  onChange: (value: QuestionFormValues['answerKey']) => void
  error?: string
}

function FillInEditor({ value, onChange, error }: FillInEditorProps) {
  const fillInValue = value?.type === 'fill_in' ? value : null
  const accepted = fillInValue?.accepted || ['']
  const caseSensitive = fillInValue?.caseSensitive || false
  const regex = fillInValue?.regex || ''
  
  // Check if at least one valid answer is provided
  const hasValidAnswer = accepted.some(a => a && a.trim() !== '')

  const updateValue = (updates: Partial<{ accepted: string[]; caseSensitive: boolean; regex: string }>) => {
    onChange({
      type: 'fill_in',
      accepted: updates.accepted ?? accepted,
      caseSensitive: updates.caseSensitive ?? caseSensitive,
      regex: updates.regex ?? regex,
    })
  }

  const handleAcceptedChange = (index: number, newValue: string) => {
    const newAccepted = [...accepted]
    newAccepted[index] = newValue
    updateValue({ accepted: newAccepted })
  }

  const addAcceptedAnswer = () => {
    updateValue({ accepted: [...accepted, ''] })
  }

  const removeAcceptedAnswer = (index: number) => {
    if (accepted.length <= 1) return
    const newAccepted = accepted.filter((_, i) => i !== index)
    updateValue({ accepted: newAccepted })
  }

  return (
    <div className="flex flex-col gap-4">
      <Field>
        <FieldLabel className="text-xs font-mono text-muted-foreground uppercase">
          Accepted Answers
        </FieldLabel>
        <FieldDescription>
          Add all acceptable answers. Students matching any of these will be marked correct.
        </FieldDescription>

        <div className="flex flex-col gap-2 mt-2">
          {accepted.map((answer, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={answer}
                onChange={(e) => handleAcceptedChange(index, e.target.value)}
                placeholder={`Answer ${index + 1}`}
                className="flex-1 font-mono"
              />
              {accepted.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => removeAcceptedAnswer(index)}
                >
                  <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} className="size-3.5" />
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addAcceptedAnswer}
            className="w-fit"
          >
            <HugeiconsIcon icon={Add01Icon} strokeWidth={2} data-icon="inline-start" />
            Add Answer
          </Button>
        </div>

        {error && <FieldError>{error}</FieldError>}
        {!hasValidAnswer && (
          <p className="text-xs text-muted-foreground mt-1">
            Please enter at least one accepted answer to save the question.
          </p>
        )}
      </Field>

      <Field orientation="horizontal">
        <Switch
          checked={caseSensitive}
          onCheckedChange={(checked) => updateValue({ caseSensitive: checked })}
        />
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium">Case Sensitive</span>
          <span className="text-[10px] text-muted-foreground">
            When enabled, answers must match exact capitalization
          </span>
        </div>
      </Field>

      <Field>
        <FieldLabel className="text-xs font-mono text-muted-foreground uppercase">
          Regex Pattern (Optional)
        </FieldLabel>
        <FieldDescription>
          Advanced: Use a regular expression for flexible matching
        </FieldDescription>
        <Input
          value={regex}
          onChange={(e) => updateValue({ regex: e.target.value })}
          placeholder="e.g., ^\\d+\\.?\\d*$"
          className="font-mono mt-2"
        />
      </Field>
    </div>
  )
}
