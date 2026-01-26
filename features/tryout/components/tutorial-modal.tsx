"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'

const STEPS = [
  'You will complete each section under strict time limits.',
  'Answers are saved only when you confirm each question.',
  'No explanations are shown until the review phase.',
  'Use the palette to jump between questions within a section.',
]

type TutorialModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TutorialModal({ open, onOpenChange }: TutorialModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg">Tryout tutorial</DialogTitle>
        </DialogHeader>
        <Separator />
        <ul className="space-y-3 text-sm text-muted-foreground">
          {STEPS.map((step, index) => (
            <li key={step} className="flex gap-3">
              <span className="text-xs font-mono text-foreground">0{index + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  )
}
