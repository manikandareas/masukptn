import { Toast as ToastPrimitive } from '@base-ui/react/toast'
import { HugeiconsIcon } from '@hugeicons/react'
import { Cancel01Icon } from '@hugeicons/core-free-icons'

import { cn } from '@/lib/utils'

const ToastProvider = ToastPrimitive.Provider

function ToastViewport({ className, ...props }: ToastPrimitive.Viewport.Props) {
  return (
    <ToastPrimitive.Viewport
      data-slot="toast-viewport"
      className={cn(
        'fixed top-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2',
        className,
      )}
      {...props}
    />
  )
}

function Toast({ className, ...props }: ToastPrimitive.Root.Props) {
  return (
    <ToastPrimitive.Root
      data-slot="toast"
      className={cn(
        'bg-background text-foreground ring-foreground/10 data-[starting-style]:animate-in data-[ending-style]:animate-out data-[ending-style]:fade-out-0 data-[starting-style]:fade-in-0 relative flex w-full items-start gap-3 rounded-none border p-3 text-xs shadow-md ring-1',
        className,
      )}
      {...props}
    />
  )
}

function ToastContent({ className, ...props }: ToastPrimitive.Content.Props) {
  return (
    <ToastPrimitive.Content
      data-slot="toast-content"
      className={cn('flex-1 space-y-1', className)}
      {...props}
    />
  )
}

function ToastTitle({ className, ...props }: ToastPrimitive.Title.Props) {
  return (
    <ToastPrimitive.Title
      data-slot="toast-title"
      className={cn('text-xs font-medium', className)}
      {...props}
    />
  )
}

function ToastDescription({
  className,
  ...props
}: ToastPrimitive.Description.Props) {
  return (
    <ToastPrimitive.Description
      data-slot="toast-description"
      className={cn('text-muted-foreground text-xs/relaxed', className)}
      {...props}
    />
  )
}

function ToastAction({ className, ...props }: ToastPrimitive.Action.Props) {
  return (
    <ToastPrimitive.Action
      data-slot="toast-action"
      className={cn(
        'border-input bg-background hover:bg-muted focus-visible:border-ring focus-visible:ring-ring/50 inline-flex h-7 items-center justify-center rounded-none border px-2 text-[11px] font-medium outline-none focus-visible:ring-1',
        className,
      )}
      {...props}
    />
  )
}

function ToastClose({ className, ...props }: ToastPrimitive.Close.Props) {
  return (
    <ToastPrimitive.Close
      data-slot="toast-close"
      className={cn(
        'text-muted-foreground hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 inline-flex size-7 items-center justify-center rounded-none border border-transparent outline-none focus-visible:ring-1',
        className,
      )}
      {...props}
    >
      <HugeiconsIcon icon={Cancel01Icon} className="size-3.5" />
    </ToastPrimitive.Close>
  )
}

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastContent,
  ToastTitle,
  ToastDescription,
  ToastAction,
  ToastClose,
}
