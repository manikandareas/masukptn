import type { AttemptResults } from '@/data-access/queries/attempts'
import type { PracticeSession } from '@/features/practice/types'

export type CalculatedPracticeResults = {
  results: AttemptResults
  totalTimeSeconds: number
}

function sumTimeSeconds(session: PracticeSession) {
  return session.items.reduce(
    (total, item) => total + (item.timeSpentSeconds ?? 0),
    0,
  )
}

export function calculatePracticeResults(
  session: PracticeSession,
  totalTimeSecondsOverride?: number,
): CalculatedPracticeResults {
  const totalQuestions = session.items.length
  const correctCount = session.items.filter((item) => item.isCorrect === true).length
  const wrongCount = session.items.filter((item) => item.isCorrect === false).length
  const blankCount = session.items.filter((item) => item.isCorrect == null).length

  const rawTotalTimeSeconds =
    typeof totalTimeSecondsOverride === 'number'
      ? totalTimeSecondsOverride
      : typeof session.totalTimeSeconds === 'number'
        ? session.totalTimeSeconds
        : sumTimeSeconds(session)

  const totalTimeSeconds = Math.max(0, Math.floor(rawTotalTimeSeconds))
  const accuracy = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0
  const avgTimePerQuestion =
    totalQuestions > 0 ? Math.round(totalTimeSeconds / totalQuestions) : 0

  return {
    totalTimeSeconds,
    results: {
      totalQuestions,
      correctCount,
      wrongCount,
      blankCount,
      accuracy,
      avgTimePerQuestion,
    },
  }
}
