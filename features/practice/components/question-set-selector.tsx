"use client";

import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { PracticeCatalog } from '@/features/practice/types'

type QuestionSetSelectorProps = {
  catalog: PracticeCatalog
  onSelectQuestionSet: (questionSetId: string) => void
}

export function QuestionSetSelector({
  catalog,
  onSelectQuestionSet,
}: QuestionSetSelectorProps) {
  const [activeExamId, setActiveExamId] = useState(catalog.exams[0]?.id ?? '')
  const safeActiveExamId = catalog.exams.some((exam) => exam.id === activeExamId)
    ? activeExamId
    : (catalog.exams[0]?.id ?? '')

  if (catalog.exams.length === 0) {
    return (
      <div className="rounded border border-border/60 bg-card/60 p-6 text-sm text-muted-foreground">
        No practice sets available yet.
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
          {exam.questionSets.length === 0 ? (
            <div className="rounded border border-border/60 bg-card/60 p-6 text-sm text-muted-foreground">
              No published question sets for this exam yet.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {exam.questionSets.map((set) => {
                const hasQuestions = set.questionCount > 0
                return (
                  <button
                    key={set.id}
                    type="button"
                    onClick={() => onSelectQuestionSet(set.id)}
                    disabled={!hasQuestions}
                    className="flex h-full flex-col gap-3 rounded border border-border/60 bg-card/70 p-4 text-left transition hover:border-primary/60 hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-border/60 disabled:hover:bg-card/70"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-xs font-mono text-muted-foreground">
                        {set.subtest?.code.toUpperCase() ?? 'MIXED'}
                      </div>
                      <Badge variant="secondary" className="text-[10px]">
                        {set.questionCount} SOAL
                      </Badge>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-foreground">{set.name}</h3>
                      {set.description && (
                        <p className="mt-1 text-xs text-muted-foreground">{set.description}</p>
                      )}
                      {!hasQuestions && (
                        <p className="mt-2 text-[11px] text-muted-foreground">
                          No published questions yet.
                        </p>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </TabsContent>
      ))}
    </Tabs>
  )
}
