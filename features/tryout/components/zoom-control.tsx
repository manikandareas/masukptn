"use client";

import { Button } from '@/components/ui/button'

const MIN_ZOOM = 0.9
const MAX_ZOOM = 1.4
const STEP = 0.1

type ZoomControlProps = {
  value: number
  onChange: (value: number) => void
}

export function ZoomControl({ value, onChange }: ZoomControlProps) {
  const handleZoomIn = () => {
    onChange(Math.min(MAX_ZOOM, Number((value + STEP).toFixed(2))))
  }

  const handleZoomOut = () => {
    onChange(Math.max(MIN_ZOOM, Number((value - STEP).toFixed(2))))
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleZoomOut}
        disabled={value <= MIN_ZOOM}
      >
        -
      </Button>
      <span className="text-xs font-mono text-muted-foreground">
        {Math.round(value * 100)}%
      </span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleZoomIn}
        disabled={value >= MAX_ZOOM}
      >
        +
      </Button>
    </div>
  )
}
