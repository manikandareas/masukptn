"use client";

import { useEffect, useRef, useState } from 'react'

type UseServerTimerOptions = {
  serverTime?: string | null
  sectionStartedAt?: string | null
  durationSeconds?: number | null
  onExpire?: () => void
}

type UseServerTimerResult = {
  timeLeft: number | null
  elapsedSeconds: number
}

export function useServerTimer({
  serverTime,
  sectionStartedAt,
  durationSeconds,
  onExpire,
}: UseServerTimerOptions): UseServerTimerResult {
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const expiredRef = useRef(false)
  const serverOffsetRef = useRef<number | null>(null)
  const lastSectionRef = useRef<string | null>(null)

  useEffect(() => {
    if (!sectionStartedAt || sectionStartedAt === lastSectionRef.current) {
      return
    }

    lastSectionRef.current = sectionStartedAt
    expiredRef.current = false
    serverOffsetRef.current = serverTime ? new Date(serverTime).getTime() - Date.now() : 0
  }, [sectionStartedAt, serverTime])

  useEffect(() => {
    if (!sectionStartedAt || typeof durationSeconds !== 'number') {
      return
    }

    const serverOffset = serverOffsetRef.current ?? 0
    const startMs = new Date(sectionStartedAt).getTime()

    const tick = () => {
      const nowMs = Date.now() + serverOffset
      const elapsed = Math.max(0, Math.floor((nowMs - startMs) / 1000))
      const remaining = Math.max(0, durationSeconds - elapsed)
      setElapsedSeconds(elapsed)
      setTimeLeft(remaining)

      if (remaining === 0 && !expiredRef.current) {
        expiredRef.current = true
        onExpire?.()
      }
    }

    tick()
    const interval = window.setInterval(tick, 1000)
    return () => window.clearInterval(interval)
  }, [durationSeconds, onExpire, sectionStartedAt])

  const isActive = Boolean(sectionStartedAt && typeof durationSeconds === 'number')

  return {
    timeLeft: isActive ? timeLeft : null,
    elapsedSeconds: isActive ? elapsedSeconds : 0,
  }
}
