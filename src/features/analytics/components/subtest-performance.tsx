"use client";

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { SubtestPerformance } from '@/data-access/queries/analytics'

const MIN_SAMPLE_SIZE = 10
const FOCUS_THRESHOLD = 60

function formatPercent(value: number) {
  return `${Math.round(value)}%`
}

function formatDuration(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0s'
  const minutes = Math.floor(seconds / 60)
  const remaining = Math.round(seconds % 60)
  if (minutes <= 0) return `${remaining}s`
  return `${minutes}m ${remaining}s`
}

type SubtestPerformanceProps = {
  items: SubtestPerformance[]
}

export function SubtestPerformance({ items }: SubtestPerformanceProps) {
  return (
    <Card className="border-border/60 bg-card/70">
      <CardHeader>
        <CardTitle className="text-sm font-mono">SUBTEST PERFORMANCE</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <Empty className="border-border/60">
            <EmptyHeader>
              <EmptyTitle>No performance data yet</EmptyTitle>
              <EmptyDescription>
                Complete a practice set or tryout to see subtest breakdowns.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-mono text-xs">SUBTEST</TableHead>
                <TableHead className="font-mono text-xs">ACCURACY</TableHead>
                <TableHead className="font-mono text-xs">AVG TIME</TableHead>
                <TableHead className="font-mono text-xs">QUESTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const needsFocus =
                  item.totalQuestions >= MIN_SAMPLE_SIZE &&
                  item.accuracy < FOCUS_THRESHOLD
                return (
                  <TableRow key={item.subtestId}>
                    <TableCell className="font-medium text-foreground">
                      {item.subtestName}
                    </TableCell>
                    <TableCell className="font-mono">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-foreground">
                          {formatPercent(item.accuracy)}
                        </span>
                        {needsFocus && (
                          <Badge variant="destructive">FOCUS</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-muted-foreground">
                      {formatDuration(item.avgTimeSeconds)}
                    </TableCell>
                    <TableCell className="font-mono text-muted-foreground">
                      {item.totalQuestions}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
