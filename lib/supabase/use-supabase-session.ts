import { useEffect, useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

import type { Session } from "@supabase/supabase-js";

interface SupabaseSessionState {
  session: Session | null;
  isLoading: boolean;
  error: string | null;
}

export function useSupabaseSession(): SupabaseSessionState {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    let isActive = true;

    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!isActive) {
        return;
      }

      if (sessionError) {
        setError(sessionError.message);
      }

      setSession(data.session ?? null);
      setIsLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === "SIGNED_OUT") {
        setError(null);
      }
      setSession(nextSession);
      setIsLoading(false);
    });

    return () => {
      isActive = false;
      data.subscription.unsubscribe();
    };
  }, []);

  return { session, isLoading, error };
}
