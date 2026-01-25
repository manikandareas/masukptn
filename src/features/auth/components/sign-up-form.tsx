"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { signUpWithPassword } from "@/features/auth/actions";
import { signUpSchema, type SignUpInput } from "@/features/auth/types";

export function SignUpForm() {
  const router = useRouter();
  const [notice, setNotice] = useState<string | null>(null);

  const form = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignUpInput) => {
    setNotice(null);
    form.clearErrors("root");

    const result = await signUpWithPassword(data);

    if (!result.success) {
      form.setError("root", { message: result.error ?? "Unable to sign up" });
      return;
    }

    if (result.needsEmailConfirmation) {
      setNotice("Check your email to confirm your account before signing in.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-size-[32px_32px] opacity-[0.08]" />
      <div className="absolute inset-0 -z-10 bg-primary/10 blur-[120px] opacity-40" />

      <div className="relative mx-auto flex min-h-screen max-w-5xl items-center justify-center px-4 py-16">
        <div className="w-full max-w-md space-y-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-mono text-muted-foreground">
            <span className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground">
              M
            </span>
            masukptn_core / auth
          </Link>

          <Card className="border-border/60 bg-card/70 shadow-[0_0_30px_rgba(0,0,0,0.3)] backdrop-blur">
            <CardHeader className="space-y-2 border-b border-border/50">
              <CardTitle className="text-xl font-mono">CREATE_ACCOUNT</CardTitle>
              <CardDescription className="font-mono text-xs text-muted-foreground">
                Provision your access credentials to enter the system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <label className="flex flex-col gap-2 text-xs font-mono text-muted-foreground">
                  EMAIL_ADDRESS
                  <input
                    type="email"
                    autoComplete="email"
                    placeholder="you@domain.com"
                    className="w-full rounded-none border border-border bg-background/60 px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    {...form.register("email")}
                  />
                  {form.formState.errors.email && (
                    <span className="text-destructive">{form.formState.errors.email.message}</span>
                  )}
                </label>
                <label className="flex flex-col gap-2 text-xs font-mono text-muted-foreground">
                  PASSWORD
                  <input
                    type="password"
                    autoComplete="new-password"
                    placeholder="Minimum 6 characters"
                    className="w-full rounded-none border border-border bg-background/60 px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    {...form.register("password")}
                  />
                  {form.formState.errors.password && (
                    <span className="text-destructive">{form.formState.errors.password.message}</span>
                  )}
                </label>

                {form.formState.errors.root && (
                  <div
                    role="alert"
                    className="rounded-none border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs font-mono text-destructive"
                  >
                    {form.formState.errors.root.message}
                  </div>
                )}
                {notice && (
                  <div className="rounded-none border border-border/60 bg-muted/30 px-3 py-2 text-xs font-mono text-muted-foreground">
                    {notice}
                  </div>
                )}

                <Button
                  type="submit"
                  className="h-10 w-full font-mono"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? "PROVISIONING..." : "CREATE_ACCESS"}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="justify-between text-xs font-mono text-muted-foreground">
              <span>HAVE_ACCESS?</span>
              <Link href="/signin" className="text-primary hover:underline">
                SIGN_IN
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
