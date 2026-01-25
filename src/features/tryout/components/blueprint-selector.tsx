"use client";

import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { TryoutCatalog } from '@/features/tryout/types'

function formatDuration(seconds: number) {
  const minutes = Math.round(seconds / 60)
  return `${minutes} MIN`
}

type BlueprintSelectorProps = {
  catalog: TryoutCatalog
  onSelectBlueprint: (blueprintId: string) => void
}

export function BlueprintSelector({
  catalog,
  onSelectBlueprint,
}: BlueprintSelectorProps) {
  const [activeExamId, setActiveExamId] = useState(catalog.exams[0]?.id ?? '')
  const safeActiveExamId = catalog.exams.some((exam) => exam.id === activeExamId)
    ? activeExamId
    : (catalog.exams[0]?.id ?? '')

  if (catalog.exams.length === 0) {
    return (
      <div className="rounded border border-border/60 bg-card/60 p-6 text-sm text-muted-foreground">
        No tryout blueprints available yet.
      </div>
    )
  }

  return (
    <Tabs value={safeActiveExamId} onValueChange={setActiveExamId} className="space-y-6">
      <TabsList className="flex flex-wrap justify-start gap-2 bg-muted/40">
        {catalog.exams.map((exam) => (
          <TabsTrigger key={exam.id} value={exam.id} className="font-mono text-xs">
            {exam.name}
          </TabsTrigger>
        ))}
      </TabsList>

      {catalog.exams.map((exam) => (
        <TabsContent key={exam.id} value={exam.id} className="space-y-4">
          {exam.blueprints.length === 0 ? (
            <div className="rounded border border-border/60 bg-card/60 p-6 text-sm text-muted-foreground">
              No active blueprints for this exam yet.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {exam.blueprints.map((blueprint) => (
                <button
                  key={blueprint.id}
                  type="button"
                  onClick={() => onSelectBlueprint(blueprint.id)}
                  className="flex h-full flex-col gap-3 rounded border border-border/60 bg-card/70 p-4 text-left transition hover:border-primary/60 hover:bg-muted/40"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xs font-mono text-muted-foreground">
                      VERSION {blueprint.version}
                    </div>
                    <Badge variant="secondary" className="text-[10px]">
                      {blueprint.totalQuestions} SOAL
                    </Badge>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">
                      {blueprint.name}
                    </h3>
                    {blueprint.description && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {blueprint.description}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                    <span className="rounded border border-border/60 bg-background/40 px-2 py-1">
                      {formatDuration(blueprint.totalDurationSeconds)}
                    </span>
                    <span className="rounded border border-border/60 bg-background/40 px-2 py-1">
                      {blueprint.sections.length} SECTION
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </TabsContent>
      ))}
    </Tabs>
  )
}
