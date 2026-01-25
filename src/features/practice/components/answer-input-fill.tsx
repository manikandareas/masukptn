"use client";

import { Input } from '@/components/ui/input'
import type { PracticeAnswer } from '@/features/practice/types'

type AnswerInputFillProps = {
  value?: PracticeAnswer | null
  onChange: (value: PracticeAnswer) => void
  disabled?: boolean
}

export function AnswerInputFill({ value, onChange, disabled }: AnswerInputFillProps) {
  const current = value && value.type === 'fill_in' ? value.value ?? '' : ''

  return (
    <Input
      value={current}
      onChange={(event) =>
        onChange({ type: 'fill_in', value: event.target.value })
      }
      placeholder="Type your answer"
      disabled={disabled}
    />
  )
}
