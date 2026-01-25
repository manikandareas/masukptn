"use client";

import { motion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRightIcon, Terminal, CpuIcon } from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b bg-background py-20 lg:py-32">
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[40px_40px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

      <div className="w-full max-w-6xl relative z-10 mx-auto px-4 md:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 lg:items-center">
          <motion.div
            className="flex flex-col items-start gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Technical Badge */}
            <div className="inline-flex items-center rounded-md border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary font-mono">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
              SYSTEM_STATUS: READY_FOR_UTBK_2026
            </div>

            <h1 className="text-4xl font-bold tracking-tight lg:text-6xl font-mono leading-tight">
              UTBK_EXECUTION <br />
              <span className="text-primary">PROTOCOL</span>
            </h1>

            <p className="max-w-2xl text-lg text-muted-foreground sm:text-xl font-mono">
              {">"} Initiating high-fidelity exam simulation environment.
              <br />
              {">"} Optimizing cognitive performance for SNBT & TKA modules.
            </p>

            <div className="flex flex-col gap-3 min-[400px]:flex-row mt-4">
              <Button
                size="lg"
                className="h-14 px-8 text-base font-mono rounded-[0.625rem]"
              >
                <HugeiconsIcon icon={Terminal} className="mr-2 h-5 w-5" />
                INITIATE_PREP
                <HugeiconsIcon icon={ArrowRightIcon} className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 text-base font-mono rounded-[0.625rem] bg-background/50 backdrop-blur-sm"
              >
                <HugeiconsIcon icon={CpuIcon} className="mr-2 h-5 w-5" />
                VIEW_SYSTEM_DEMO
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative mx-auto w-full max-w-[500px] lg:max-w-none"
          >
            {/* Technical Card / Visual */}
            <div className="relative rounded-[0.625rem] border bg-card/50 backdrop-blur-xl shadow-2xl p-2 md:p-4">
              {/* Terminal Header */}
              <div className="flex items-center gap-2 border-b pb-4 mb-4 px-2">
                <div className="h-3 w-3 rounded-full bg-destructive/50"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-500/50"></div>
                <div className="h-3 w-3 rounded-full bg-green-500/50"></div>
                <div className="ml-auto text-xs text-muted-foreground font-mono">
                  masukptn-cli — v2.0.0
                </div>
              </div>

              {/* Mock Content */}
              <div className="space-y-4 font-mono text-sm p-2">
                <div className="flex items-center justify-between border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">
                    Analisis Potensi Kognitif
                  </span>
                  <span className="text-green-500">[98% OPTIMIZED]</span>
                </div>
                <div className="flex items-center justify-between border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">
                    Penalaran Matematika
                  </span>
                  <span className="text-yellow-500">[PROCESSING...]</span>
                </div>
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span>72%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                    <div className="h-full w-[72%] bg-primary rounded-full"></div>
                  </div>
                </div>

                <div className="bg-muted/50 rounded p-3 mt-4 text-xs">
                  <p className="text-primary">{">"} Running diagnostics...</p>
                  <p className="typewriter text-muted-foreground">
                    {">"} Prediction: Lolos SNBP - ITB (Teknik Informatika)
                  </p>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -left-2 top-10 w-1 h-12 bg-primary/20"></div>
              <div className="absolute -right-2 bottom-10 w-1 h-12 bg-primary/20"></div>
            </div>

            {/* Background Glow */}
            <div className="absolute -inset-4 -z-10 bg-primary/5 blur-3xl rounded-full"></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
