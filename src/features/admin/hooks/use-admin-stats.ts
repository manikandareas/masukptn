"use client";

import { useQuery } from '@tanstack/react-query'

import { getAdminStatsAction } from '@/features/admin/server/get-admin-stats'

export const adminStatsQueryKey = ['admin-stats']

export function useAdminStats() {
  return useQuery({
    queryKey: adminStatsQueryKey,
    queryFn: getAdminStatsAction,
  })
}
