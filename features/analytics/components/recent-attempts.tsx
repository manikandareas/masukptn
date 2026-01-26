"use client";

import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { cn } from '@/lib/utils'
import type { RecentAttempt } from '@/features/analytics/types'

function formatPercent(value: number) {
  return `${Math.round(value)}%`
}

function formatDate(value: string) {
  const date = new Date(value)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date)
}

function getStatusVariant(status: RecentAttempt['status']) {
  if (status === 'completed') return 'secondary'
  if (status === 'abandoned') return 'destructive'
  return 'outline'
}

type RecentAttemptsProps = {
  attempts: RecentAttempt[]
}

function resolveAttemptHref(template: string, attemptId: string) {
  return template.replace('$attemptId', attemptId).replace(':attemptId', attemptId)
}

export function RecentAttempts({ attempts }: RecentAttemptsProps) {
  return (
    <Card className="border-border/60 bg-card/70">
      <CardHeader>
        <CardTitle className="text-sm font-mono">RECENT ATTEMPTS</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {attempts.length === 0 ? (
          <Empty className="border-border/60">
            <EmptyHeader>
              <EmptyTitle>No recent attempts</EmptyTitle>
              <EmptyDescription>
                Start a practice set or tryout to populate your history.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          attempts.map((attempt) => {
            const detail = attempt.label
            const statusLabel = attempt.status.replace('_', ' ').toUpperCase()
            const modeLabel = attempt.mode === 'tryout' ? 'TRYOUT' : 'PRACTICE'
            const to =
              attempt.mode === 'practice'
                ? attempt.status === 'completed'
                  ? '/practice/:attemptId/results'
                  : '/practice/:attemptId'
                : attempt.status === 'completed'
                  ? '/tryout/:attemptId/results'
                  : '/tryout/:attemptId'

            return (
              <div
                key={attempt.id}
                className="rounded border border-border/60 bg-background/40 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground">
                        {modeLabel}
                      </span>
                      <Badge variant={getStatusVariant(attempt.status)}>
                        {statusLabel}
                      </Badge>
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      {detail}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(attempt.createdAt)} · {attempt.totalQuestions} questions
                    </p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <div className="font-mono text-foreground">
                      {attempt.status === 'completed' && attempt.totalQuestions > 0
                        ? formatPercent(attempt.accuracy)
                        : '--'}
                    </div>
                    <Link
                      href={resolveAttemptHref(to, attempt.id)}
                      className={cn(
                        buttonVariants({ variant: 'outline', size: 'sm' }),
                        'mt-2 font-mono',
                      )}
                    >
                      OPEN
                    </Link>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
