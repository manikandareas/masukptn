"use client";

import { cn } from '@/lib/utils'
import type { PracticeSessionItem } from '@/features/practice/types'

function hasAnswer(item: PracticeSessionItem) {
  const answer = item.userAnswer
  if (!answer) return false

  if (answer.type === 'single_choice') {
    return Boolean(answer.selected)
  }

  if (answer.type === 'fill_in') {
    return Boolean(answer.value && answer.value.trim().length > 0)
  }

  if (answer.type === 'complex_selection') {
    return answer.rows.some((row) => Boolean(row.selected))
  }

  return false
}

type QuestionPaletteProps = {
  items: PracticeSessionItem[]
  currentIndex: number
  onJump: (index: number) => void
}

export function QuestionPalette({ items, currentIndex, onJump }: QuestionPaletteProps) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {items.map((item, index) => {
        const answered = hasAnswer(item)
        const isCurrent = index === currentIndex
        const isCorrect = item.isCorrect === true
        const isWrong = item.isCorrect === false

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onJump(index)}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded border text-xs font-mono transition',
              isCurrent && 'border-primary text-primary',
              !isCurrent && 'border-border/60 text-muted-foreground',
              answered && 'bg-muted/40 text-foreground',
              isCorrect && 'border-primary/60',
              isWrong && 'border-destructive/60 text-destructive',
            )}
          >
            {index + 1}
          </button>
        )
      })}
    </div>
  )
}
