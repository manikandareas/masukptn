"use client";

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { UserSummaryStats } from '@/data-access/queries/analytics'

function formatPercent(value: number) {
  return `${Math.round(value)}%`
}

function formatDuration(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0m'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`
  }

  return `${remainingSeconds}s`
}

type StatsOverviewProps = {
  summary?: UserSummaryStats | null
  isLoading?: boolean
}

export function StatsOverview({ summary, isLoading }: StatsOverviewProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={`stat-skeleton-${index}`} className="border-border/60 bg-card/70">
            <CardContent className="space-y-3">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-7 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!summary) {
    return (
      <Card className="border-border/60 bg-card/70">
        <CardContent className="text-xs text-muted-foreground">
          No analytics available yet.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="border-border/60 bg-card/70">
        <CardContent className="space-y-2">
          <p className="text-xs font-mono text-muted-foreground">TOTAL QUESTIONS</p>
          <p className="text-2xl font-semibold text-foreground">
            {summary.totalQuestions}
          </p>
        </CardContent>
      </Card>
      <Card className="border-border/60 bg-card/70">
        <CardContent className="space-y-2">
          <p className="text-xs font-mono text-muted-foreground">OVERALL ACCURACY</p>
          <p className="text-2xl font-semibold text-foreground">
            {formatPercent(summary.accuracy)}
          </p>
        </CardContent>
      </Card>
      <Card className="border-border/60 bg-card/70">
        <CardContent className="space-y-2">
          <p className="text-xs font-mono text-muted-foreground">TOTAL STUDY TIME</p>
          <p className="text-2xl font-semibold text-foreground">
            {formatDuration(summary.totalTimeSeconds)}
          </p>
        </CardContent>
      </Card>
      <Card className="border-border/60 bg-card/70">
        <CardContent className="space-y-2">
          <p className="text-xs font-mono text-muted-foreground">AVG TIME / QUESTION</p>
          <p className="text-2xl font-semibold text-foreground">
            {formatDuration(summary.avgTimeSeconds)}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
