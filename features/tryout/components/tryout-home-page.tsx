"use client";

import { useRouter } from "next/navigation";

import { BlueprintSelector } from "@/features/tryout/components/blueprint-selector";
import { useTryoutCatalog } from "@/features/tryout/hooks/use-tryout-session";

export function TryoutHomePage() {
  const router = useRouter();
  const { data, isLoading, error } = useTryoutCatalog();

  const handleSelect = (blueprintId: string) => {
    router.push(`/tryout/blueprint/${blueprintId}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12">
        <header className="space-y-2">
          <p className="text-xs font-mono text-muted-foreground">TRYOUT_MODE</p>
          <h1 className="text-3xl font-semibold">Start a tryout</h1>
          <p className="text-sm text-muted-foreground">
            Choose a blueprint version to view details and start your exam simulation.
          </p>
        </header>

        {isLoading ? (
          <div className="rounded border border-border/60 bg-card/70 p-6 text-sm text-muted-foreground">
            Loading tryout blueprints...
          </div>
        ) : null}

        {error ? (
          <div className="rounded border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            Unable to load tryout catalog.
          </div>
        ) : null}

        {data ? <BlueprintSelector catalog={data} onSelectBlueprint={handleSelect} /> : null}
      </div>
    </div>
  );
}
