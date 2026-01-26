"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

import type { AdminStats } from '@/data-access/queries/admin'

interface AdminStatsProps {
  stats?: AdminStats
  isLoading?: boolean
}

interface StatCardProps {
  title: string
  value: number | undefined
  description?: string
  isLoading?: boolean
}

function StatCard({ title, value, description, isLoading }: StatCardProps) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardDescription className="text-[10px] uppercase tracking-[0.2em]">
          {title}
        </CardDescription>
        <CardTitle className="text-2xl font-mono tabular-nums">
          {isLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            value?.toLocaleString() ?? '—'
          )}
        </CardTitle>
      </CardHeader>
      {description && (
        <CardContent className="pt-0">
          <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
      )}
    </Card>
  )
}

export function AdminStats({ stats, isLoading }: AdminStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <StatCard
        title="Total Questions"
        value={stats?.questions.total}
        description="All questions in bank"
        isLoading={isLoading}
      />
      <StatCard
        title="Published Questions"
        value={stats?.questions.published}
        description="Live for students"
        isLoading={isLoading}
      />
      <StatCard
        title="Draft Questions"
        value={stats?.questions.draft}
        description="Pending review"
        isLoading={isLoading}
      />
      <StatCard
        title="Total Question Sets"
        value={stats?.questionSets.total}
        description="All curated sets"
        isLoading={isLoading}
      />
      <StatCard
        title="Published Sets"
        value={stats?.questionSets.published}
        description="Available for practice"
        isLoading={isLoading}
      />
    </div>
  )
}
