"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { DashboardNavbar } from "@/components/dashboard-navbar";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useSupabaseSession } from "@/lib/supabase/use-supabase-session";

export function AppNavbar() {
  const router = useRouter();
  const { session } = useSupabaseSession();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    const supabase = createSupabaseBrowserClient();

    setIsSigningOut(true);
    await supabase.auth.signOut();
    setIsSigningOut(false);
    router.push("/signin");
  };

  const canSignOut = Boolean(session);

  return (
    <DashboardNavbar
      email={session?.user.email}
      onSignOut={canSignOut ? handleSignOut : undefined}
      isSigningOut={isSigningOut}
    />
  );
}
