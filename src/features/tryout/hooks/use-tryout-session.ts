"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UseMutationResult, UseQueryResult } from "@tanstack/react-query";

import { calculateTryoutResults } from "@/features/tryout/server/calculate-tryout-results";
import { createTryoutSession } from "@/features/tryout/server/create-tryout-session";
import { endSection } from "@/features/tryout/server/end-section";
import { getBlueprintDetail } from "@/features/tryout/server/get-blueprint-detail";
import { getTryoutCatalog } from "@/features/tryout/server/get-tryout-catalog";
import { getTryoutSession } from "@/features/tryout/server/get-tryout-session";
import { startSection } from "@/features/tryout/server/start-section";
import { submitAnswer } from "@/features/tryout/server/submit-answer";
import type { TryoutConfigInput, TryoutSession } from "@/features/tryout/types";

type QueryResult<TData> = UseQueryResult<TData, Error>;
type MutationResult<TData, TVariables> = UseMutationResult<TData, Error, TVariables, unknown>;

type TryoutCatalogData = Awaited<ReturnType<typeof getTryoutCatalog>>;
type BlueprintDetailData = Awaited<ReturnType<typeof getBlueprintDetail>>;
type CreateTryoutSessionData = Awaited<ReturnType<typeof createTryoutSession>>;
type TryoutSessionData = Awaited<ReturnType<typeof getTryoutSession>>;
type StartSectionData = Awaited<ReturnType<typeof startSection>>;
type EndSectionData = Awaited<ReturnType<typeof endSection>>;
type SubmitAnswerData = Awaited<ReturnType<typeof submitAnswer>>;
type CalculateResultsData = Awaited<ReturnType<typeof calculateTryoutResults>>;

type AttemptPayload = {
  attemptId: string;
};

type SectionPayload = {
  attemptId: string;
  sectionIndex: number;
};

type SubmitAnswerPayload = {
  attemptId: string;
  attemptItemId: string;
  userAnswer: NonNullable<TryoutSession["items"][number]["userAnswer"]>;
  timeSpentSeconds?: number;
};

export function useTryoutCatalog(): QueryResult<TryoutCatalogData> {
  return useQuery({
    queryKey: ["tryout-catalog"],
    queryFn: getTryoutCatalog,
  });
}

export function useBlueprintDetail(blueprintId: string): QueryResult<BlueprintDetailData> {
  return useQuery({
    queryKey: ["blueprint-detail", blueprintId],
    queryFn: () => getBlueprintDetail({ blueprintId }),
    enabled: Boolean(blueprintId),
  });
}

export function useCreateTryoutSession(): MutationResult<CreateTryoutSessionData, TryoutConfigInput> {
  return useMutation({
    mutationFn: (config: TryoutConfigInput) => createTryoutSession(config),
  });
}

export function useTryoutSession(attemptId: string): QueryResult<TryoutSessionData> {
  return useQuery({
    queryKey: ["tryout-session", attemptId],
    queryFn: () => getTryoutSession({ attemptId }),
    enabled: Boolean(attemptId),
  });
}

export function useStartSection(attemptId: string): MutationResult<StartSectionData, SectionPayload> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SectionPayload) => startSection(payload),
    onSuccess: (data) => {
      queryClient.setQueryData<TryoutSession>(["tryout-session", attemptId], (old) => {
        if (!old) return old;
        const snapshot = old.configSnapshot ?? {};
        return {
          ...old,
          serverTime: data.serverTime,
          configSnapshot: {
            ...snapshot,
            currentSectionIndex: data.sectionIndex,
            sectionStartedAt: data.sectionStartedAt,
          },
        };
      });
    },
  });
}

export function useEndSection(attemptId: string): MutationResult<EndSectionData, SectionPayload> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SectionPayload) => endSection(payload),
    onSuccess: (data) => {
      queryClient.setQueryData<TryoutSession>(["tryout-session", attemptId], (old) => {
        if (!old) return old;
        const snapshot = old.configSnapshot ?? {};
        const { sectionStartedAt: _omit, ...rest } = snapshot;
        return {
          ...old,
          configSnapshot: {
            ...rest,
            currentSectionIndex: data.nextSectionIndex ?? snapshot.currentSectionIndex ?? 0,
          },
        };
      });
    },
  });
}

export function useSubmitTryoutAnswer(
  attemptId: string,
): MutationResult<SubmitAnswerData, SubmitAnswerPayload> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SubmitAnswerPayload) => submitAnswer(payload),
    onSuccess: (data) => {
      if (!data?.item) return;
      queryClient.setQueryData<TryoutSession>(["tryout-session", attemptId], (old) => {
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

export function useCalculateTryoutResults(
  attemptId: string,
): MutationResult<CalculateResultsData, AttemptPayload> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AttemptPayload) => calculateTryoutResults(payload),
    onSuccess: (results) => {
      queryClient.setQueryData<TryoutSession>(["tryout-session", attemptId], (old) => {
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
