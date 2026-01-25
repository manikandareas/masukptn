"use client";

import { useCallback, useMemo, useState } from 'react'

export function useQuestionNavigation(totalQuestions: number, initialIndex = 0) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  const hasPrev = currentIndex > 0
  const hasNext = currentIndex < Math.max(0, totalQuestions - 1)

  const goTo = useCallback(
    (index: number) => {
      if (index < 0 || index >= totalQuestions) return
      setCurrentIndex(index)
    },
    [totalQuestions],
  )

  const goPrev = useCallback(() => {
    if (hasPrev) {
      setCurrentIndex((prev) => prev - 1)
    }
  }, [hasPrev])

  const goNext = useCallback(() => {
    if (hasNext) {
      setCurrentIndex((prev) => prev + 1)
    }
  }, [hasNext])

  const progress = useMemo(() => {
    if (totalQuestions === 0) return 0
    return ((currentIndex + 1) / totalQuestions) * 100
  }, [currentIndex, totalQuestions])

  return {
    currentIndex,
    hasPrev,
    hasNext,
    progress,
    goTo,
    goPrev,
    goNext,
  }
}
