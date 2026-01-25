"use client";

import { Card } from '@/components/ui/card'

function formatDuration(seconds: number) {
  const minutes = Math.round(seconds / 60)
  return `${minutes} minutes`
}

type CountdownScreenProps = {
  sectionName: string
  questionCount: number
  durationSeconds: number
  countdownSeconds: number
  timeLeft: number
}

export function CountdownScreen({
  sectionName,
  questionCount,
  durationSeconds,
  countdownSeconds,
  timeLeft,
}: CountdownScreenProps) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center gap-6">
      <Card className="w-full border-border/60 bg-card/70 p-6 text-center">
        <p className="text-xs font-mono text-muted-foreground">SECTION_STARTING</p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">{sectionName}</h1>
        <div className="mt-4 flex flex-wrap justify-center gap-3 text-xs text-muted-foreground">
          <span className="rounded border border-border/60 bg-background/40 px-3 py-2">
            {questionCount} QUESTIONS
          </span>
          <span className="rounded border border-border/60 bg-background/40 px-3 py-2">
            {formatDuration(durationSeconds)}
          </span>
          <span className="rounded border border-border/60 bg-background/40 px-3 py-2">
            {countdownSeconds}S COUNTDOWN
          </span>
        </div>
      </Card>
      <div className="text-center">
        <p className="text-xs font-mono text-muted-foreground">GET_READY</p>
        <div className="mt-2 text-6xl font-semibold text-foreground">
          {timeLeft}
        </div>
      </div>
    </div>
  )
}
