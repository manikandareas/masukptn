"use client";

import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { AdminLayout } from "@/features/admin/components/admin-layout";
import { AdminStats } from "@/features/admin/components/admin-stats";
import { useAdminStats } from "@/features/admin/hooks/use-admin-stats";

export function AdminDashboardPage() {
  const { data: stats, isLoading, error } = useAdminStats();

  return (
    <AdminLayout>
      <div className="flex flex-col gap-8 p-6">
        <header className="flex flex-col gap-2">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            ADMIN_DASHBOARD
          </p>
          <h1 className="text-2xl font-semibold">Content Overview</h1>
          <p className="text-sm text-muted-foreground">
            Manage questions and question sets for the platform.
          </p>
        </header>

        {error ? (
          <Card className="border-destructive/50 bg-destructive/10">
            <CardContent className="py-4 text-xs text-destructive">
              Failed to load statistics. Please try again.
            </CardContent>
          </Card>
        ) : null}

        <AdminStats stats={stats} isLoading={isLoading} />

        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-medium">Quick Actions</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/admin/questions/new"
              className="group flex flex-col gap-2 border border-border/60 bg-card/50 p-4 transition-colors hover:border-foreground/30 hover:bg-card"
            >
              <span className="text-xs font-medium">Create Question</span>
              <span className="text-[11px] text-muted-foreground">
                Add a new question to the bank
              </span>
            </Link>
            <Link
              href="/admin/question-sets/new"
              className="group flex flex-col gap-2 border border-border/60 bg-card/50 p-4 transition-colors hover:border-foreground/30 hover:bg-card"
            >
              <span className="text-xs font-medium">Create Question Set</span>
              <span className="text-[11px] text-muted-foreground">
                Curate a new practice set
              </span>
            </Link>
            <Link
              href="/admin/questions"
              className="group flex flex-col gap-2 border border-border/60 bg-card/50 p-4 transition-colors hover:border-foreground/30 hover:bg-card"
            >
              <span className="text-xs font-medium">Browse Questions</span>
              <span className="text-[11px] text-muted-foreground">
                View and manage all questions
              </span>
            </Link>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
