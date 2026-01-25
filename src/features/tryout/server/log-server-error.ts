type LogContext = {
  scope: string
  userId?: string
  attemptId?: string
  attemptItemId?: string
  metadata?: Record<string, unknown>
}

export function logServerError(context: LogContext, error: unknown) {
  const base = {
    scope: context.scope,
    userId: context.userId,
    attemptId: context.attemptId,
    attemptItemId: context.attemptItemId,
    metadata: context.metadata,
  }

  if (error instanceof Error) {
    console.error(`[tryout:${context.scope}]`, {
      ...base,
      message: error.message,
      stack: error.stack,
    })
    return
  }

  console.error(`[tryout:${context.scope}]`, { ...base, error })
}
