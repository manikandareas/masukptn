"use client";

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  AnswerInputComplex,
  AnswerInputFill,
  AnswerInputSingle,
  QuestionRenderer,
} from '@/features/practice/components'
import {
  useEndSection,
  useSectionTransition,
  useServerTimer,
  useSubmitTryoutAnswer,
} from '@/features/tryout/hooks'
import { TimerDisplay } from '@/features/tryout/components/timer-display'
import { TryoutPalette } from '@/features/tryout/components/tryout-palette'
import { ZoomControl } from '@/features/tryout/components/zoom-control'
import { EndSectionDialog } from '@/features/tryout/components/end-section-dialog'
import type { TryoutAnswer, TryoutSession } from '@/features/tryout/types'

function buildInitialAnswer(
  questionType: TryoutSession['items'][number]['question']['questionType'],
): TryoutAnswer {
  if (questionType === 'single_choice') {
    return { type: 'single_choice', selected: null }
  }
  if (questionType === 'complex_selection') {
    return { type: 'complex_selection', rows: [] }
  }
  return { type: 'fill_in', value: null }
}

type TryoutPlayerProps = {
  session: TryoutSession
}

export function TryoutPlayer({ session }: TryoutPlayerProps) {
  const router = useRouter()
  const { section, currentSectionIndex, isLastSection } = useSectionTransition(session)
  const sectionItems = useMemo(
    () => session.items.filter((item) => item.sectionIndex === currentSectionIndex),
    [session.items, currentSectionIndex],
  )
  const [activeIndex, setActiveIndex] = useState(0)
  const [draftAnswers, setDraftAnswers] = useState<Record<string, TryoutAnswer>>({})
  const [zoom, setZoom] = useState(1)
  const [showEndDialog, setShowEndDialog] = useState(false)
  const questionStartRef = useRef<number>(Date.now())
  const sectionEndGuard = useRef(false)

  const { mutateAsync: submitAnswer, isPending: isSubmitting } = useSubmitTryoutAnswer(
    session.id,
  )
  const { mutateAsync: endSection, isPending: isEnding } = useEndSection(session.id)

  const sectionStartedAt = session.configSnapshot?.sectionStartedAt
  const { timeLeft } = useServerTimer({
    serverTime: session.serverTime,
    sectionStartedAt,
    durationSeconds: section?.durationSeconds ?? null,
    onExpire: () => {
      if (!sectionEndGuard.current) {
        sectionEndGuard.current = true
        void handleEndSection()
      }
    },
  })
  const isExpired = timeLeft === 0
  const isActionDisabled = isSubmitting || isEnding || isExpired

  useEffect(() => {
    const firstUnanswered = sectionItems.findIndex((item) => !item.answeredAt)
    setActiveIndex(firstUnanswered >= 0 ? firstUnanswered : 0)
    setDraftAnswers({})
    questionStartRef.current = Date.now()
    sectionEndGuard.current = false
  }, [currentSectionIndex, sectionItems])

  useEffect(() => {
    questionStartRef.current = Date.now()
  }, [activeIndex])

  const answeredCount = useMemo(
    () => sectionItems.filter((item) => item.answeredAt).length,
    [sectionItems],
  )
  const progress =
    sectionItems.length === 0 ? 0 : (answeredCount / sectionItems.length) * 100
  const unansweredCount = sectionItems.length - answeredCount

  const activeItem = sectionItems[activeIndex]

  const resolveAnswer = (item: TryoutSession['items'][number]) => {
    if (item.answeredAt) {
      return item.userAnswer ?? buildInitialAnswer(item.question.questionType)
    }
    return (
      draftAnswers[item.id] ?? item.userAnswer ?? buildInitialAnswer(item.question.questionType)
    )
  }

  const handleAnswerChange = (itemId: string, answer: TryoutAnswer) => {
    setDraftAnswers((prev) => ({
      ...prev,
      [itemId]: answer,
    }))
  }

  const handleSubmit = async () => {
    if (!activeItem) return
    const answer = resolveAnswer(activeItem)
    const timeSpentSeconds = Math.max(
      0,
      Math.floor((Date.now() - questionStartRef.current) / 1000),
    )

    await submitAnswer({
      attemptId: session.id,
      attemptItemId: activeItem.id,
      userAnswer: answer,
      timeSpentSeconds,
    })

    setDraftAnswers((prev) => {
      const { [activeItem.id]: _removed, ...rest } = prev
      return rest
    })
  }

  const handleNext = () => {
    setActiveIndex((prev) => Math.min(sectionItems.length - 1, prev + 1))
  }

  const handlePrev = () => {
    setActiveIndex((prev) => Math.max(0, prev - 1))
  }

  const handleEndSection = async () => {
    if (!section) return
    const result = await endSection({
      attemptId: session.id,
      sectionIndex: currentSectionIndex,
    })

    if (result.isCompleted) {
      router.push(`/tryout/${session.id}/results`)
      return
    }

    if (typeof result.nextSectionIndex === 'number') {
      router.push(`/tryout/${session.id}/countdown`)
    }
  }

  if (!section) {
    return (
      <div className="rounded border border-border/60 bg-card/70 p-6 text-sm text-muted-foreground">
        Section data missing for this tryout.
      </div>
    )
  }

  if (!sectionStartedAt) {
    return (
      <div className="rounded border border-border/60 bg-card/70 p-6 text-sm text-muted-foreground">
        Section has not started yet. Continue to the countdown screen to begin.
        <div className="mt-4">
          <Button
            type="button"
            onClick={() =>
              router.push(`/tryout/${session.id}/countdown`)
            }
          >
            Go to countdown
          </Button>
        </div>
      </div>
    )
  }

  if (!activeItem) {
    return (
      <div className="rounded border border-border/60 bg-card/70 p-6 text-sm text-muted-foreground">
        No questions loaded for this section.
      </div>
    )
  }

  const answerValue = resolveAnswer(activeItem)

  return (
    <div className="space-y-6">
      <Card className="border-border/60 bg-card/70 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-mono text-muted-foreground">TRYOUT_SECTION</p>
            <p className="text-sm text-foreground">
              {section.name} · Section {currentSectionIndex + 1} /{' '}
              {session.blueprint.sections.length}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <TimerDisplay timeLeft={timeLeft} />
            <ZoomControl value={zoom} onChange={setZoom} />
          </div>
        </div>
        <div className="mt-4">
          <Progress value={progress} />
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <Card className="border-border/60 bg-card/70 p-4">
          <p className="text-xs font-mono text-muted-foreground">PALETTE</p>
          <div className="mt-3">
            <TryoutPalette
              items={sectionItems}
              activeIndex={activeIndex}
              onJump={setActiveIndex}
            />
          </div>
        </Card>

        <Card className="border-border/60 bg-card/70 p-4">
          <div
            className="space-y-6"
            style={{ zoom }}
          >
            <QuestionRenderer
              item={activeItem}
              index={activeIndex}
              total={sectionItems.length}
            />

            <div className="space-y-4">
              {activeItem.question.questionType === 'single_choice' && (
                <AnswerInputSingle
                  options={activeItem.question.options}
                  value={answerValue ?? null}
                  onChange={(value) => handleAnswerChange(activeItem.id, value)}
                  disabled={isActionDisabled}
                />
              )}

              {activeItem.question.questionType === 'complex_selection' && (
                <AnswerInputComplex
                  options={activeItem.question.complexOptions}
                  value={answerValue ?? null}
                  onChange={(value) => handleAnswerChange(activeItem.id, value)}
                  disabled={isActionDisabled}
                />
              )}

              {activeItem.question.questionType === 'fill_in' && (
                <AnswerInputFill
                  value={answerValue ?? null}
                  onChange={(value) => handleAnswerChange(activeItem.id, value)}
                  disabled={isActionDisabled}
                />
              )}
            </div>

            <Separator className="my-4" />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrev}
                  disabled={activeIndex === 0}
                >
                  Prev
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleNext}
                  disabled={activeIndex >= sectionItems.length - 1}
                >
                  Next
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isActionDisabled}
                >
                  Confirm answer
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowEndDialog(true)}
                  disabled={isEnding}
                >
                  {isLastSection ? 'Finish tryout' : 'End section'}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <EndSectionDialog
        open={showEndDialog}
        onOpenChange={setShowEndDialog}
        onConfirm={handleEndSection}
        isLast={isLastSection}
        unansweredCount={unansweredCount}
        totalCount={sectionItems.length}
        isLoading={isEnding}
      />
    </div>
  )
}
