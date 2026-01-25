"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

type EndSectionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isLast: boolean
  unansweredCount: number
  totalCount: number
  isLoading: boolean
}

export function EndSectionDialog({
  open,
  onOpenChange,
  onConfirm,
  isLast,
  unansweredCount,
  totalCount,
  isLoading,
}: EndSectionDialogProps) {
  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isLast ? 'Finish Tryout?' : 'End Section?'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {unansweredCount > 0 ? (
              <>
                You have{' '}
                <span className="font-semibold text-foreground">
                  {unansweredCount} of {totalCount}
                </span>{' '}
                questions unanswered.
              </>
            ) : (
              'All questions have been answered.'
            )}
            {isLast
              ? ' This will complete your tryout session. You cannot make changes after finishing.'
              : ' You will not be able to return to this section.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? 'Processing...' : 'Confirm'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
