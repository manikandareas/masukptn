"use client";

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { PracticeSession } from '@/features/practice/types'

function formatPercent(value: number) {
  return `${Math.round(value)}%`
}

type ResultsSummaryProps = {
  session: PracticeSession
  onRestart: () => void
}

export function ResultsSummary({ session, onRestart }: ResultsSummaryProps) {
  const results = session.results

  if (!results) {
    return (
      <div className="rounded border border-border/60 bg-card/70 p-6 text-sm text-muted-foreground">
        Results are still processing.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/60 bg-card/70">
        <CardHeader>
          <CardTitle className="text-lg font-mono">SESSION_RESULTS</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded border border-border/60 bg-background/40 p-4">
              <p className="text-xs font-mono text-muted-foreground">ACCURACY</p>
              <p className="text-2xl font-semibold text-foreground">
                {formatPercent(results.accuracy)}
              </p>
            </div>
            <div className="rounded border border-border/60 bg-background/40 p-4">
              <p className="text-xs font-mono text-muted-foreground">CORRECT</p>
              <p className="text-2xl font-semibold text-foreground">{results.correctCount}</p>
            </div>
            <div className="rounded border border-border/60 bg-background/40 p-4">
              <p className="text-xs font-mono text-muted-foreground">WRONG</p>
              <p className="text-2xl font-semibold text-foreground">{results.wrongCount}</p>
            </div>
            <div className="rounded border border-border/60 bg-background/40 p-4">
              <p className="text-xs font-mono text-muted-foreground">BLANK</p>
              <p className="text-2xl font-semibold text-foreground">{results.blankCount}</p>
            </div>
          </div>

          <Separator />

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
            <span>TOTAL QUESTIONS: {results.totalQuestions}</span>
            <span>AVG TIME / QUESTION: {results.avgTimePerQuestion}s</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" onClick={onRestart}>
          NEW_SESSION
        </Button>
      </div>
    </div>
  )
}
