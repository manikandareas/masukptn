"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { CountdownScreen } from "@/features/tryout/components/countdown-screen";
import {
  useStartSection,
  useTryoutSession,
} from "@/features/tryout/hooks/use-tryout-session";
import type { TryoutBlueprintSection } from "@/features/tryout/types";

type TryoutCountdownPageProps = {
  attemptId: string;
};

type CountdownControllerProps = {
  attemptId: string;
  sectionIndex: number;
  section: TryoutBlueprintSection;
};

function CountdownController({ attemptId, sectionIndex, section }: CountdownControllerProps) {
  const router = useRouter();
  const { mutateAsync: startSection } = useStartSection(attemptId);
  const startedRef = useRef(false);
  const initialCountdown = section.countdownSeconds ?? 30;
  const [timeLeft, setTimeLeft] = useState(() => initialCountdown);

  useEffect(() => {
    if (startedRef.current) {
      return;
    }

    if (timeLeft <= 0) {
      startedRef.current = true;
      void startSection({ attemptId, sectionIndex }).then(() => {
        router.replace(`/tryout/${attemptId}`);
      });
      return;
    }

    const interval = window.setInterval(() => {
      setTimeLeft((previous) => Math.max(0, previous - 1));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [attemptId, router, sectionIndex, startSection, timeLeft]);

  return (
    <CountdownScreen
      sectionName={section.name}
      questionCount={section.questionCount}
      durationSeconds={section.durationSeconds}
      countdownSeconds={initialCountdown}
      timeLeft={timeLeft}
    />
  );
}

export function TryoutCountdownPage({ attemptId }: TryoutCountdownPageProps) {
  const router = useRouter();
  const { data, isLoading, error } = useTryoutSession(attemptId);

  const sectionIndex = data?.configSnapshot?.currentSectionIndex ?? 0;
  const section = data?.blueprint.sections[sectionIndex];

  useEffect(() => {
    if (data?.configSnapshot?.sectionStartedAt) {
      router.replace(`/tryout/${attemptId}`);
    }
  }, [attemptId, data?.configSnapshot?.sectionStartedAt, router]);

  if (isLoading) {
    return (
      <div className="rounded border border-border/60 bg-card/70 p-6 text-sm text-muted-foreground">
        Loading countdown...
      </div>
    );
  }

  if (error || !section) {
    return (
      <div className="rounded border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
        Unable to load section countdown.
      </div>
    );
  }

  return (
    <CountdownController
      key={section.id}
      attemptId={attemptId}
      sectionIndex={sectionIndex}
      section={section}
    />
  );
}
