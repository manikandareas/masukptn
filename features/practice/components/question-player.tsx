"use client";

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { AnswerInputComplex } from '@/features/practice/components/answer-input-complex'
import { AnswerInputFill } from '@/features/practice/components/answer-input-fill'
import { AnswerInputSingle } from '@/features/practice/components/answer-input-single'
import { ExplanationPanel } from '@/features/practice/components/explanation-panel'
import { QuestionRenderer } from '@/features/practice/components/question-renderer'
import { useCompletePracticeSession, useSubmitAnswer } from '@/features/practice/hooks'
import { calculatePracticeResults } from '@/features/practice/utils/calculate-results'
import type { PracticeAnswer, PracticeSession } from '@/features/practice/types'

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remaining = seconds % 60
  return `${minutes}:${remaining.toString().padStart(2, '0')}`
}

type QuestionPlayerProps = {
  session: PracticeSession
}

function buildInitialAnswer(questionType: PracticeSession['items'][number]['question']['questionType']): PracticeAnswer {
  if (questionType === 'single_choice') {
    return { type: 'single_choice', selected: null }
  }
  if (questionType === 'complex_selection') {
    return { type: 'complex_selection', rows: [] }
  }
  return { type: 'fill_in', value: null }
}

export function QuestionPlayer({ session }: QuestionPlayerProps) {
  const router = useRouter()
  const totalQuestions = session.items.length
  const [visibleCount, setVisibleCount] = useState(() => {
    const answered = session.items.filter((item) => item.answeredAt).length
    const nextIndex = answered < totalQuestions ? answered + 1 : answered
    return Math.min(totalQuestions, Math.max(1, nextIndex))
  })
  const [draftAnswers, setDraftAnswers] = useState<Record<string, PracticeAnswer>>({})
  const questionStartRef = useRef<number>(Date.now())
  const completionGuard = useRef(false)
  const sessionRef = useRef(session)
  const questionRefs = useRef<Array<HTMLDivElement | null>>([])

  const {
    mutateAsync: submitAnswer,
    isPending: isSubmitting,
    error: submitError,
  } = useSubmitAnswer(session.id)
  const { mutateAsync: completeSession, isPending: isCompleting } =
    useCompletePracticeSession(session.id)

  const startedAt = useMemo(() => {
    const raw = session.startedAt ? new Date(session.startedAt).getTime() : Date.now()
    return Number.isNaN(raw) ? Date.now() : raw
  }, [session.startedAt])

  const timeLimitSeconds = session.configSnapshot?.timeLimitSeconds
  const isTimed = session.timeMode === 'timed' && typeof timeLimitSeconds === 'number'
  const [timeLeft, setTimeLeft] = useState(() => {
    if (!isTimed || !timeLimitSeconds) return null
    const elapsed = Math.floor((Date.now() - startedAt) / 1000)
    return Math.max(0, timeLimitSeconds - elapsed)
  })

  useEffect(() => {
    questionStartRef.current = Date.now()
  }, [visibleCount])

  useEffect(() => {
    sessionRef.current = session
  }, [session])

  useEffect(() => {
    const answered = session.items.filter((item) => item.answeredAt).length
    const nextIndex = answered < session.items.length ? answered + 1 : answered
    setVisibleCount(Math.min(session.items.length, Math.max(1, nextIndex)))
    setDraftAnswers({})
    completionGuard.current = false
  }, [session.id, session.items.length])

  useEffect(() => {
    const target = questionRefs.current[Math.max(0, visibleCount - 1)]
    if (!target) return
    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    const focusable = target.querySelector<HTMLElement>(
      'input, button, textarea, [tabindex]:not([tabindex="-1"])',
    )
    focusable?.focus()
  }, [visibleCount])

  useEffect(() => {
    if (!isTimed || !timeLimitSeconds) return

    const interval = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000)
      const remaining = Math.max(0, timeLimitSeconds - elapsed)
      setTimeLeft(remaining)

      if (remaining === 0 && !completionGuard.current) {
        completionGuard.current = true
        const { results, totalTimeSeconds } = calculatePracticeResults(
          sessionRef.current,
          timeLimitSeconds,
        )
        completeSession({ attemptId: session.id, totalTimeSeconds, results }).then(() => {
          router.push(`/practice/${session.id}/results`)
        })
      }
    }, 1000)

    return () => window.clearInterval(interval)
  }, [completeSession, isTimed, router, session.id, startedAt, timeLimitSeconds])

  const visibleItems = session.items.slice(0, Math.min(visibleCount, totalQuestions))
  const activeIndex = Math.max(0, visibleItems.length - 1)
  const activeItem = visibleItems[activeIndex]
  const answeredCount = session.items.filter((item) => item.answeredAt).length
  const progress = totalQuestions === 0 ? 0 : (answeredCount / totalQuestions) * 100

  const resolveAnswer = (item: PracticeSession['items'][number]) => {
    if (item.answeredAt) {
      return item.userAnswer ?? buildInitialAnswer(item.question.questionType)
    }
    return draftAnswers[item.id] ?? item.userAnswer ?? buildInitialAnswer(item.question.questionType)
  }

  const handleAnswerChange = (itemId: string, answer: PracticeAnswer) => {
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
    if (visibleCount >= totalQuestions) return
    setVisibleCount((prev) => Math.min(totalQuestions, prev + 1))
  }

  const handleComplete = async () => {
    if (completionGuard.current) return
    completionGuard.current = true

    const elapsedSeconds = Math.max(0, Math.floor((Date.now() - startedAt) / 1000))
    const cappedSeconds =
      isTimed && typeof timeLimitSeconds === 'number'
        ? Math.min(elapsedSeconds, timeLimitSeconds)
        : elapsedSeconds
    const { results, totalTimeSeconds } = calculatePracticeResults(
      sessionRef.current,
      cappedSeconds,
    )

    await completeSession({
      attemptId: session.id,
      totalTimeSeconds,
      results,
    })

    router.push(`/practice/${session.id}/results`)
  }

  if (!activeItem) {
    return (
      <div className="rounded border border-border/60 bg-card/70 p-6 text-sm text-muted-foreground">
        No questions loaded for this session.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/60 bg-card/70 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-mono text-muted-foreground">PRACTICE_SESSION</p>
            <p className="text-sm text-foreground">Attempt ID: {session.id.slice(0, 8)}</p>
          </div>
          {isTimed && timeLeft !== null && (
            <div className="rounded border border-border/60 bg-background/40 px-3 py-2 text-sm font-mono text-foreground">
              TIME_LEFT: {formatTime(timeLeft)}
            </div>
          )}
        </div>
        <div className="mt-4">
          <Progress value={progress} />
        </div>
      </Card>

      <div className="space-y-6">
        {visibleItems.map((item, index) => {
          const isActive = index === activeIndex
          const isSubmitted = Boolean(item.answeredAt)
          const answerValue = resolveAnswer(item)
          const isLastQuestion = index === totalQuestions - 1

          return (
            <Card
              key={item.id}
              ref={(node) => {
                questionRefs.current[index] = node
              }}
              className="border-border/60 bg-card/70 p-4"
            >
              <div className="space-y-4">
                <QuestionRenderer item={item} index={index} total={totalQuestions} />

                {item.question.questionType === 'single_choice' && (
                  <AnswerInputSingle
                    options={item.question.options}
                    value={answerValue ?? null}
                    onChange={(value) => handleAnswerChange(item.id, value)}
                    disabled={!isActive || isSubmitted}
                  />
                )}

                {item.question.questionType === 'complex_selection' && (
                  <AnswerInputComplex
                    options={item.question.complexOptions}
                    value={answerValue ?? null}
                    onChange={(value) => handleAnswerChange(item.id, value)}
                    disabled={!isActive || isSubmitted}
                  />
                )}

                {item.question.questionType === 'fill_in' && (
                  <AnswerInputFill
                    value={answerValue ?? null}
                    onChange={(value) => handleAnswerChange(item.id, value)}
                    disabled={!isActive || isSubmitted}
                  />
                )}

                {isSubmitted && (
                  <ExplanationPanel
                    explanation={item.question.explanation}
                    isCorrect={item.isCorrect}
                    revealed
                  />
                )}

                {isActive && (
                  <>
                    <Separator />
                    <div className="flex flex-wrap items-center justify-end gap-3">
                      {!isSubmitted ? (
                        <Button onClick={handleSubmit} disabled={isSubmitting}>
                          {isSubmitting ? 'SUBMITTING...' : 'SUBMIT'}
                        </Button>
                      ) : isLastQuestion ? (
                        <Button onClick={handleComplete} disabled={isCompleting}>
                          {isCompleting ? 'FINALIZING...' : 'FINISH'}
                        </Button>
                      ) : (
                        <Button onClick={handleNext}>NEXT</Button>
                      )}
                    </div>
                    {submitError && (
                      <div className="rounded border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                        {submitError instanceof Error
                          ? submitError.message
                          : 'Failed to submit answer.'}
                      </div>
                    )}
                  </>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
