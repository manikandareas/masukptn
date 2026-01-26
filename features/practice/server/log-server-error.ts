type ServerErrorContext = {
  scope: string
  userId?: string
  attemptId?: string
  attemptItemId?: string
  metadata?: Record<string, unknown>
}

export function logServerError(context: ServerErrorContext, error: unknown) {
  const base = {
    scope: context.scope,
    userId: context.userId,
    attemptId: context.attemptId,
    attemptItemId: context.attemptItemId,
    metadata: context.metadata,
  }

  if (error instanceof Error) {
    console.error(`[practice:${context.scope}]`, {
      ...base,
      name: error.name,
      message: error.message,
      cause: error.cause,
      stack: error.stack,
    })
    return
  }

  console.error(`[practice:${context.scope}]`, { ...base, error })
}
