"use client";

import NumberFlow from '@number-flow/react'

type TimerComponents = {
  minutes: number
  seconds: number
}

const numberFlowFormat = { minimumIntegerDigits: 2, maximumFractionDigits: 0 }

function formatTimeComponents(totalSeconds: number): TimerComponents {
  const minutes = Math.floor(totalSeconds / 60)
  const remainingSeconds = totalSeconds % 60
  return { minutes, seconds: remainingSeconds }
}

type TimerDisplayProps = {
  timeLeft: number | null
}

export function TimerDisplay({ timeLeft }: TimerDisplayProps) {
  if (timeLeft === null) {
    return (
      <div className="rounded border border-border/60 bg-background/40 px-3 py-2 text-xs font-mono text-muted-foreground">
        TIMER_LOADING
      </div>
    )
  }

  const isCritical = timeLeft <= 60
  const { minutes, seconds } = formatTimeComponents(timeLeft)

  return (
    <div
      className={`rounded border px-3 py-2 text-sm font-mono ${
        isCritical
          ? 'border-destructive/60 bg-destructive/10 text-destructive'
          : 'border-border/60 bg-background/40 text-foreground'
      }`}
    >
      TIME_LEFT:{' '}
      <NumberFlow
        value={minutes}
        format={numberFlowFormat}
        locales="en-US"
      />
      :
      <NumberFlow
        value={seconds}
        format={numberFlowFormat}
        locales="en-US"
      />
    </div>
  )
}
