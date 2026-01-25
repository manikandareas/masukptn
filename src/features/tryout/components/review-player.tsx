"use client";

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ExplanationPanel } from '@/features/practice/components'
import { QuestionRenderer } from '@/features/practice/components'
import type { TryoutSession, TryoutSessionItem } from '@/features/tryout/types'

const statusMap = {
  correct: { label: 'CORRECT', variant: 'default' as const },
  wrong: { label: 'WRONG', variant: 'destructive' as const },
  blank: { label: 'BLANK', variant: 'secondary' as const },
}

function formatUserAnswer(item: TryoutSessionItem) {
  const answer = item.userAnswer
  if (!answer) return '-'

  if (answer.type === 'single_choice') {
    return answer.selected ?? '-'
  }

  if (answer.type === 'fill_in') {
    return answer.value?.trim() || '-'
  }

  if (answer.type === 'complex_selection') {
    return answer.rows
      .map((row, index) => `${index + 1}:${row.selected ?? '-'}`)
      .join(' · ')
  }

  return '-'
}

type ReviewPlayerProps = {
  session: TryoutSession
}

export function ReviewPlayer({ session }: ReviewPlayerProps) {
  const sections = session.blueprint.sections

  return (
    <div className="space-y-8">
      {sections.map((section, sectionIndex) => {
        const items = session.items.filter(
          (item) => item.sectionIndex === sectionIndex,
        )

        return (
          <div key={section.id} className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-mono text-muted-foreground">SECTION_REVIEW</p>
                <h2 className="text-lg font-semibold text-foreground">{section.name}</h2>
              </div>
              <Badge variant="secondary" className="text-[10px]">
                {items.length} QUESTIONS
              </Badge>
            </div>

            <div className="space-y-6">
              {items.map((item, index) => {
                const status =
                  item.isCorrect === true
                    ? statusMap.correct
                    : item.isCorrect === false
                      ? statusMap.wrong
                      : statusMap.blank

                return (
                  <Card
                    key={item.id}
                    className="border-border/60 bg-card/70 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-xs font-mono text-muted-foreground">
                        QUESTION {index + 1} / {items.length}
                      </p>
                      <Badge variant={status.variant} className="text-[10px]">
                        {status.label}
                      </Badge>
                    </div>

                    <div className="mt-4 space-y-4">
                      <QuestionRenderer item={item} index={index} total={items.length} />

                      <div className="rounded border border-border/60 bg-background/40 p-3 text-xs text-muted-foreground">
                        YOUR_ANSWER: <span className="text-foreground">{formatUserAnswer(item)}</span>
                      </div>

                      <ExplanationPanel
                        explanation={item.question.explanation}
                        isCorrect={item.isCorrect}
                        revealed
                      />
                    </div>
                  </Card>
                )
              })}
            </div>

            <Separator className="my-6" />
          </div>
        )}
      )}
    </div>
  )
}
