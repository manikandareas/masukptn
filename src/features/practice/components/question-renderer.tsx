"use client";

import { MarkdownRenderer } from '@/components/markdown-renderer'
import type { PracticeSessionItem } from '@/features/practice/types'

const QUESTION_TYPES: Record<string, string> = {
  single_choice: 'Single Choice',
  complex_selection: 'Complex Selection',
  fill_in: 'Fill In',
}

type QuestionRendererProps = {
  item: PracticeSessionItem
  index: number
  total: number
}

export function QuestionRenderer({ item, index, total }: QuestionRendererProps) {
  const { question } = item

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-mono text-muted-foreground">
          QUESTION {index + 1} / {total}
        </p>
        <span className="rounded border border-border/60 bg-muted/40 px-2 py-1 text-[10px] font-mono text-muted-foreground">
          {QUESTION_TYPES[question.questionType] ?? 'Question'}
        </span>
      </div>

      {question.stimulus && (
        <div className="rounded border border-border/60 bg-background/40 p-4">
          <p className="mb-2 text-xs font-mono text-muted-foreground">STIMULUS</p>
          <MarkdownRenderer content={question.stimulus} />
        </div>
      )}

      <div className="rounded border border-border/60 bg-card/70 p-4">
        <MarkdownRenderer content={question.stem} />
      </div>
    </div>
  )
}
