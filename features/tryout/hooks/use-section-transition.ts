"use client";

import type { TryoutSession } from '@/features/tryout/types'

export function useSectionTransition(session?: TryoutSession | null) {
  const sections = session?.blueprint.sections ?? []
  const currentSectionIndex = session?.configSnapshot?.currentSectionIndex ?? 0
  const section = sections[currentSectionIndex]
  const nextSection = sections[currentSectionIndex + 1] ?? null

  return {
    sections,
    currentSectionIndex,
    section,
    nextSection,
    isLastSection: currentSectionIndex >= sections.length - 1,
  }
}
