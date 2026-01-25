"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
} from 'recharts'

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { PerformanceTrendPoint } from '@/data-access/queries/analytics'

const chartConfig = {
  accuracy: {
    label: 'Accuracy %',
    color: 'var(--chart-2)',
  },
  questions: {
    label: 'Questions',
    color: 'var(--chart-4)',
  },
}

function formatShortDate(value: string) {
  const date = new Date(`${value}T00:00:00`)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date)
}

function buildChartData(points: PerformanceTrendPoint[]) {
  return points.map((point) => ({
    date: point.date,
    label: formatShortDate(point.date),
    accuracy: Math.round(point.accuracy),
    questions: point.totalQuestions,
  }))
}

type TrendChartProps = {
  trends: {
    last7Days: PerformanceTrendPoint[]
    last30Days: PerformanceTrendPoint[]
  }
}

export function TrendChart({ trends }: TrendChartProps) {
  const data7 = buildChartData(trends.last7Days)
  const data30 = buildChartData(trends.last30Days)

  const hasData =
    data7.some((point) => point.questions > 0) ||
    data30.some((point) => point.questions > 0)

  return (
    <Card className="border-border/60 bg-card/70">
      <CardHeader>
        <CardTitle className="text-sm font-mono">PERFORMANCE TRENDS</CardTitle>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <Empty className="border-border/60">
            <EmptyHeader>
              <EmptyTitle>No trend data yet</EmptyTitle>
              <EmptyDescription>
                Complete a few sessions to reveal your accuracy trend.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <Tabs defaultValue="7d" className="space-y-4">
            <TabsList className="bg-muted/40">
              <TabsTrigger value="7d" className="font-mono text-xs">
                LAST 7 DAYS
              </TabsTrigger>
              <TabsTrigger value="30d" className="font-mono text-xs">
                LAST 30 DAYS
              </TabsTrigger>
            </TabsList>
            <TabsContent value="7d" className="space-y-4">
              <ChartContainer config={chartConfig} className="h-[240px]">
                <ComposedChart data={data7} margin={{ left: 8, right: 8 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <YAxis
                    yAxisId="left"
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                    tickLine={false}
                    axisLine={false}
                    width={40}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tickLine={false}
                    axisLine={false}
                    width={30}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    yAxisId="right"
                    dataKey="questions"
                    fill="var(--color-questions)"
                    radius={[2, 2, 0, 0]}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="accuracy"
                    stroke="var(--color-accuracy)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </ComposedChart>
              </ChartContainer>
            </TabsContent>
            <TabsContent value="30d" className="space-y-4">
              <ChartContainer config={chartConfig} className="h-[240px]">
                <ComposedChart data={data30} margin={{ left: 8, right: 8 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <YAxis
                    yAxisId="left"
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                    tickLine={false}
                    axisLine={false}
                    width={40}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tickLine={false}
                    axisLine={false}
                    width={30}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    yAxisId="right"
                    dataKey="questions"
                    fill="var(--color-questions)"
                    radius={[2, 2, 0, 0]}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="accuracy"
                    stroke="var(--color-accuracy)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </ComposedChart>
              </ChartContainer>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}
