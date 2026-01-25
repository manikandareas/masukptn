"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { completeSession } from "@/features/practice/server/complete-session";
import { createPracticeSession } from "@/features/practice/server/create-practice-session";
import { getPracticeCatalog } from "@/features/practice/server/get-practice-catalog";
import { getPracticeSession } from "@/features/practice/server/get-practice-session";
import { submitAnswer } from "@/features/practice/server/submit-answer";
import type { PracticeConfigInput, PracticeSession } from "@/features/practice/types";

export function usePracticeCatalog() {
  return useQuery({
    queryKey: ["practice-catalog"],
    queryFn: getPracticeCatalog,
  });
}

export function useCreatePracticeSession() {
  return useMutation({
    mutationFn: (config: PracticeConfigInput) => createPracticeSession(config),
  });
}

export function usePracticeSession(attemptId: string) {
  return useQuery({
    queryKey: ["practice-session", attemptId],
    queryFn: () => getPracticeSession({ attemptId }),
    enabled: Boolean(attemptId),
  });
}

export function useSubmitAnswer(attemptId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      attemptId: string;
      attemptItemId: string;
      userAnswer: NonNullable<PracticeSession["items"][number]["userAnswer"]>;
      timeSpentSeconds?: number;
    }) => submitAnswer(payload),
    onSuccess: (data) => {
      if (!data?.item) return;
      queryClient.setQueryData<PracticeSession>(["practice-session", attemptId], (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((item) =>
            item.id === data.item.id
              ? {
                  ...item,
                  ...data.item,
                }
              : item,
          ),
        };
      });
    },
  });
}

export function useCompletePracticeSession(attemptId: string) {
  const queryClient = useQueryClient();
  type PracticeResults = NonNullable<PracticeSession["results"]>;

  return useMutation({
    mutationFn: (payload: {
      attemptId: string;
      totalTimeSeconds?: number;
      results: PracticeResults;
    }) => completeSession(payload),
    onSuccess: (results) => {
      queryClient.setQueryData<PracticeSession>(["practice-session", attemptId], (old) => {
        if (!old) return old;
        return {
          ...old,
          status: "completed",
          results,
          completedAt: new Date(),
        };
      });
    },
  });
}
