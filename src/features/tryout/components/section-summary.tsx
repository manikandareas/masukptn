"use client";

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

function formatPercent(value: number) {
  return `${Math.round(value)}%`
}

type SectionSummaryProps = {
  answeredCount: number
  totalQuestions: number
  onContinue: () => void
  isLastSection?: boolean
}

export function SectionSummary({
  answeredCount,
  totalQuestions,
  onContinue,
  isLastSection = false,
}: SectionSummaryProps) {
  const accuracy = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0

  return (
    <Card className="border-border/60 bg-card/70 p-6">
      <p className="text-xs font-mono text-muted-foreground">SECTION_SUMMARY</p>
      <div className="mt-4 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
        <div>
          <p className="text-xs font-mono">ANSWERED</p>
          <p className="text-base font-semibold text-foreground">
            {answeredCount} / {totalQuestions}
          </p>
        </div>
        <div>
          <p className="text-xs font-mono">ACCURACY</p>
          <p className="text-base font-semibold text-foreground">
            {formatPercent(accuracy)}
          </p>
        </div>
        <div className="flex items-end">
          <Button type="button" onClick={onContinue}>
            {isLastSection ? 'Finish tryout' : 'Continue'}
          </Button>
        </div>
      </div>
    </Card>
  )
}
