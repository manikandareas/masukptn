"use client";

import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import type { PracticeAnswer } from '@/features/practice/types'

type ComplexOption = {
  statement: string
  choices: string[]
}

type AnswerInputComplexProps = {
  options?: ComplexOption[] | null
  value?: PracticeAnswer | null
  onChange: (value: PracticeAnswer) => void
  disabled?: boolean
}

export function AnswerInputComplex({
  options,
  value,
  onChange,
  disabled,
}: AnswerInputComplexProps) {
  const safeOptions = options ?? []
  const rows =
    value &&
    value.type === 'complex_selection' &&
    value.rows.length === safeOptions.length
      ? value.rows
      : safeOptions.map(() => ({ selected: null }))

  const updateRow = (index: number, selected: string) => {
    const nextRows = rows.map((row, rowIndex) =>
      rowIndex === index ? { selected } : row,
    )
    onChange({ type: 'complex_selection', rows: nextRows })
  }

  return (
    <div className="space-y-4">
      {safeOptions.map((option, index) => (
        <div key={`${option.statement}-${index}`} className="rounded border border-border/60 bg-background/40 p-4">
          <p className="mb-3 text-sm font-semibold text-foreground">{option.statement}</p>
          <RadioGroup
            value={rows[index]?.selected ?? ''}
            onValueChange={(nextValue) => updateRow(index, nextValue)}
            className="flex flex-wrap gap-4"
            disabled={disabled}
          >
            {option.choices.map((choice) => (
              <div key={choice} className="flex items-center gap-2">
                <RadioGroupItem value={choice} id={`row-${index}-${choice}`} />
                <Label htmlFor={`row-${index}-${choice}`} className="text-xs font-mono">
                  {choice}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      ))}
    </div>
  )
}
