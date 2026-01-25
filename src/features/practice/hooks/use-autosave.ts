"use client";

import { useCallback, useEffect, useRef } from 'react'

export function useAutosave<T>(onSave: (payload: T) => void, delay = 500) {
  const timeoutRef = useRef<number | null>(null)

  const scheduleSave = useCallback(
    (payload: T) => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = window.setTimeout(() => {
        onSave(payload)
      }, delay)
    },
    [delay, onSave],
  )

  const cancelPending = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  useEffect(() => cancelPending, [cancelPending])

  return { scheduleSave, cancelPending }
}
