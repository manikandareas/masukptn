"use client";

import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import type { PracticeAnswer } from '@/features/practice/types'

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

function extractOptionLetter(option: string, index: number) {
  const match = option.trim().match(/^([A-F])\s*[\.|\)]\s*/i)
  if (match?.[1]) return match[1].toUpperCase()
  return LETTERS[index] ?? String.fromCharCode(65 + index)
}

type AnswerInputSingleProps = {
  options?: string[] | null
  value?: PracticeAnswer | null
  onChange: (value: PracticeAnswer) => void
  disabled?: boolean
}

export function AnswerInputSingle({
  options,
  value,
  onChange,
  disabled,
}: AnswerInputSingleProps) {
  const selected = value && value.type === 'single_choice' ? value.selected ?? '' : ''
  const safeOptions = options ?? []

  return (
    <RadioGroup
      value={selected}
      onValueChange={(nextValue) =>
        onChange({ type: 'single_choice', selected: nextValue })
      }
      className="space-y-3"
      disabled={disabled}
    >
      {safeOptions.map((option, index) => {
        const letter = extractOptionLetter(option, index)
        return (
          <div
            key={`${letter}-${index}`}
            className="flex items-start gap-3 rounded border border-border/60 bg-background/40 p-3"
          >
            <RadioGroupItem value={letter} id={`option-${letter}-${index}`} />
            <Label
              htmlFor={`option-${letter}-${index}`}
              className="text-sm leading-relaxed"
            >
              <span className="mr-2 font-mono text-xs text-muted-foreground">{letter}</span>
              {option}
            </Label>
          </div>
        )
      })}
    </RadioGroup>
  )
}
