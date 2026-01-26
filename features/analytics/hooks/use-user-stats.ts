"use client";

import { useQuery } from '@tanstack/react-query'

import { analyticsQueryKey } from '@/features/analytics/query-keys'
import { getUserAnalytics } from '@/features/analytics/server/get-user-analytics'

export function useUserStats() {
  return useQuery({
    queryKey: analyticsQueryKey,
    queryFn: () => getUserAnalytics(),
  })
}
