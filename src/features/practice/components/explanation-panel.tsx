"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { MarkdownRenderer } from '@/components/markdown-renderer'
import type { Explanation } from '@/data-access/schema'

const statusMap = {
  correct: { label: 'CORRECT', variant: 'default' as const },
  wrong: { label: 'CHECK_AGAIN', variant: 'destructive' as const },
  blank: { label: 'NO_ANSWER', variant: 'secondary' as const },
}

type ExplanationPanelProps = {
  explanation: Explanation
  isCorrect: boolean | null | undefined
  revealed?: boolean
}

export function ExplanationPanel({
  explanation,
  isCorrect,
  revealed = false,
}: ExplanationPanelProps) {
  const shouldReveal = revealed || isCorrect === true || isCorrect === false

  if (!shouldReveal) {
    return (
      <div className="rounded border border-border/60 bg-muted/30 p-4 text-xs text-muted-foreground">
        Submit an answer to reveal the explanation.
      </div>
    )
  }

  const status =
    isCorrect === true
      ? statusMap.correct
      : isCorrect === false
        ? statusMap.wrong
        : statusMap.blank

  return (
    <div className="space-y-4 rounded border border-border/60 bg-card/70 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-mono text-muted-foreground">EXPLANATION</p>
        <Badge variant={status.variant} className="text-[10px]">
          {status.label}
        </Badge>
      </div>

      <MarkdownRenderer content={explanation.level1} />

      {explanation.level2 && explanation.level2.length > 0 && (
        <Accordion defaultValue={[]}>
          <AccordionItem value="level2">
            <AccordionTrigger className="text-xs font-mono">
              VIEW_STEP_BY_STEP
            </AccordionTrigger>
            <AccordionContent className="space-y-3">
              {explanation.level2.map((step, index) => (
                <MarkdownRenderer
                  key={`${index}-${step.slice(0, 12)}`}
                  content={step}
                />
              ))}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  )
}
