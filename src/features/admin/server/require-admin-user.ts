import "server-only";

import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}

type AdminUser = {
  id: string;
  email: string;
  role: "admin";
};

function decodeJwtPayload(token: string | null | undefined): Record<string, unknown> | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;

  try {
    const payload = parts[1];
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const json = Buffer.from(padded, "base64").toString("utf8");
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function extractRole(params: {
  accessToken: string | null | undefined;
  fallbackRole: unknown;
}): string | undefined {
  const payload = decodeJwtPayload(params.accessToken);
  const tokenRole = typeof payload?.user_role === "string" ? payload.user_role : undefined;
  if (tokenRole) return tokenRole;
  return typeof params.fallbackRole === "string" ? params.fallbackRole : undefined;
}

export async function getAdminUserOrThrow(): Promise<AdminUser> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    throw new UnauthorizedError();
  }

  const { data: sessionData } = await supabase.auth.getSession();
  const role = extractRole({
    accessToken: sessionData.session?.access_token,
    fallbackRole: data.user.app_metadata?.role,
  });

  if (role !== "admin") {
    throw new ForbiddenError();
  }

  return {
    id: data.user.id,
    email: data.user.email ?? "",
    role: "admin",
  };
}

export async function requireAdminUserPage(): Promise<AdminUser> {
  try {
    return await getAdminUserOrThrow();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      redirect("/signin");
    }
    redirect("/dashboard");
  }
}
