"use client";

import { Card, CardContent } from "@/components/ui/card";
import { RecommendationsPanel } from "@/features/analytics/components/recommendations-panel";
import { RecentAttempts } from "@/features/analytics/components/recent-attempts";
import { StatsOverview } from "@/features/analytics/components/stats-overview";
import { SubtestPerformance } from "@/features/analytics/components/subtest-performance";
import { TrendChart } from "@/features/analytics/components/trend-chart";
import { useUserStats } from "@/features/analytics/hooks/use-user-stats";

export function DashboardPage({ userEmail }: { userEmail: string }) {
  const { data, isLoading, error } = useUserStats();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-12">
        <header className="flex flex-col gap-4">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">DASHBOARD</p>
            <h1 className="text-3xl font-semibold">Your progress overview</h1>
            <p className="text-sm text-muted-foreground">
              Signed in as <span className="text-foreground">{userEmail}</span>
            </p>
          </div>
        </header>

        {error && (
          <Card className="border-destructive/50 bg-destructive/10">
            <CardContent className="text-xs text-destructive">
              {error instanceof Error ? error.message : "Unable to load analytics data."}
            </CardContent>
          </Card>
        )}

        <StatsOverview summary={data?.summary} isLoading={isLoading} />

        {isLoading && !data && (
          <div className="rounded border border-border/60 bg-card/70 p-6 text-xs text-muted-foreground">
            Loading analytics dashboard...
          </div>
        )}

        {data && (
          <>
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
              <TrendChart trends={data.trends} />
              <RecommendationsPanel recommendations={data.recommendations} />
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <SubtestPerformance items={data.subtestPerformance} />
              <RecentAttempts attempts={data.recentAttempts} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
