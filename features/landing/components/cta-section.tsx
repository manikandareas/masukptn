"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRightIcon,
  PowerServiceIcon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CTASection() {
  return (
    <section className="relative overflow-hidden py-24 lg:py-32 bg-background border-b">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-size-[24px_24px]"></div>
      <div className="absolute inset-0 -z-10 bg-primary/5 blur-[100px] opacity-50" />

      <div className="w-full max-w-6xl mx-auto px-4 md:px-6">
        <div className="relative flex flex-col items-center justify-center space-y-8 text-center border border-border bg-card/50 backdrop-blur-sm p-8 lg:p-16 rounded-[0.625rem] shadow-2xl overflow-hidden">
          {/* Decorative scanner line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-primary to-transparent opacity-50 animate-pulse"></div>

          <motion.div
            className="space-y-4 max-w-[800px]"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center justify-center rounded-full border border-primary/20 bg-background px-4 py-1.5 text-xs font-mono text-primary mb-4">
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              SYSTEM_UPDATE_AVAILABLE: V.2026
            </div>

            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl font-mono leading-tight">
              INITIATE_YOUR_
              <br className="hidden sm:block" />
              <span className="text-primary">SUCCESS_SEQUENCE</span>
            </h2>

            <p className="max-w-[600px] mx-auto text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed font-mono">
              {">"} Join the elite cohort of students optimizing their UTBK
              scores. <br />
              {">"} Deployment to top universities guaranteed for optimized
              users.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col gap-4 min-[400px]:flex-row pt-4"
          >
            <Link
              href="/signup"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-14 px-8 text-base font-mono rounded-[0.625rem] shadow-[0_0_20px_-5px_var(--color-primary)]",
              )}
            >
              <HugeiconsIcon icon={PowerServiceIcon} className="mr-2 h-5 w-5" />
              START_SYSTEM
              <HugeiconsIcon icon={ArrowRightIcon} className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="/signin"
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "h-14 px-8 text-base font-mono rounded-[0.625rem] bg-background/50",
              )}
            >
              <HugeiconsIcon icon={SparklesIcon} className="mr-2 h-5 w-5" />
              VIEW_BENCHMARKS
            </Link>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 w-full max-w-4xl border-t border-border/50 mt-8">
            <div className="flex flex-col gap-1">
              <span className="text-2xl font-bold font-mono">50k+</span>
              <span className="text-xs text-muted-foreground font-mono">
                ACTIVE_USERS
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-2xl font-bold font-mono">1M+</span>
              <span className="text-xs text-muted-foreground font-mono">
                QUESTIONS_SOLVED
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-2xl font-bold font-mono">92%</span>
              <span className="text-xs text-muted-foreground font-mono">
                PTN_ACCEPTANCE
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-2xl font-bold font-mono">4.9/5</span>
              <span className="text-xs text-muted-foreground font-mono">
                SYSTEM_RATING
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
