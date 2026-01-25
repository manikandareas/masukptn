"use client";

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { TryoutBlueprintSection, TryoutSession } from '@/features/tryout/types'

function formatPercent(value: number) {
  return `${Math.round(value)}%`
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remaining = seconds % 60
  return `${minutes}m ${remaining}s`
}

type ResultsBreakdownProps = {
  results: TryoutSession['results']
  sections: TryoutBlueprintSection[]
  onReview?: () => void
  onRestart?: () => void
}

export function ResultsBreakdown({
  results,
  sections,
  onReview,
  onRestart,
}: ResultsBreakdownProps) {
  if (!results) return null

  return (
    <div className="space-y-6">
      <Card className="border-border/60 bg-card/70 p-6">
        <p className="text-xs font-mono text-muted-foreground">TRYOUT_RESULTS</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs font-mono text-muted-foreground">ACCURACY</p>
            <p className="text-2xl font-semibold text-foreground">
              {formatPercent(results.accuracy)}
            </p>
          </div>
          <div>
            <p className="text-xs font-mono text-muted-foreground">CORRECT</p>
            <p className="text-2xl font-semibold text-foreground">
              {results.correctCount} / {results.totalQuestions}
            </p>
          </div>
          <div>
            <p className="text-xs font-mono text-muted-foreground">AVG_TIME</p>
            <p className="text-2xl font-semibold text-foreground">
              {results.avgTimePerQuestion}s
            </p>
          </div>
        </div>
        {(onReview || onRestart) && (
          <div className="mt-6 flex flex-wrap gap-2">
            {onReview && (
              <Button type="button" onClick={onReview}>
                Review answers
              </Button>
            )}
            {onRestart && (
              <Button type="button" variant="secondary" onClick={onRestart}>
                Back to tryouts
              </Button>
            )}
          </div>
        )}
      </Card>

      <Card className="border-border/60 bg-card/70 p-6">
        <p className="text-xs font-mono text-muted-foreground">SECTION_BREAKDOWN</p>
        <div className="mt-4 space-y-4">
          {(results.perSection ?? []).map((sectionResult) => {
            const section = sections.find(
              (item) => item.subtestId === sectionResult.subtestId,
            )
            return (
              <div key={sectionResult.subtestId} className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {section?.name ?? sectionResult.subtestName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {sectionResult.correct} / {sectionResult.total} correct
                    </p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <div>{formatPercent(sectionResult.accuracy)}</div>
                    <div>{formatDuration(sectionResult.timeSeconds)}</div>
                  </div>
                </div>
                <Separator />
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
