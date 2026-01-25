"use client";

import Link from 'next/link'

import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { Recommendation } from '@/features/analytics/types'


type RecommendationsPanelProps = {
  recommendations: Recommendation[]
}

function resolveRecommendationHref(action: Recommendation['action']) {
  if (!action) return '#'
  const { to } = action
  const params = 'params' in action ? action.params : undefined
  if (!params) return to

  let href: string = to
  for (const [key, value] of Object.entries(params)) {
    href = href.replace(`$${key}`, value).replace(`:${key}`, value)
  }
  return href
}

export function RecommendationsPanel({ recommendations }: RecommendationsPanelProps) {
  return (
    <Card className="border-border/60 bg-card/70">
      <CardHeader>
        <CardTitle className="text-sm font-mono">RECOMMENDATIONS</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.length === 0 ? (
          <div className="rounded border border-border/60 bg-background/40 p-4 text-xs text-muted-foreground">
            No recommendations available right now.
          </div>
        ) : (
          recommendations.map((item) => (
            <div
              key={item.id}
              className="rounded border border-border/60 bg-background/40 p-4"
            >
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">
                  {item.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.description}
                </p>
              </div>
              {item.action && (
                <div className="mt-3">
                  <Link
                    href={resolveRecommendationHref(item.action)}
                    className={cn(
                      buttonVariants({ variant: 'outline', size: 'sm' }),
                      'font-mono',
                    )}
                  >
                    {item.action.label}
                  </Link>
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
