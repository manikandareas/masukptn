"use client";

import { motion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  BarChartIcon,
  CalculatorIcon,
  RefreshIcon,
  KeyboardIcon,
  Terminal,
  TimerIcon,
} from "@hugeicons/core-free-icons";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function FeaturesGrid() {
  return (
    <section className="py-20 lg:py-32 border-b bg-background/50">
      <div className="w-full max-w-6xl mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
          <Badge
            variant="outline"
            className="px-3 py-1 font-mono text-xs border-primary/20 bg-primary/5 text-primary"
          >
            SYSTEM_MODULES
          </Badge>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-mono">
            CORE_CAPABILITIES
          </h2>
          <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed font-mono">
            {">"} Access high-performance tools for UTBK preparation.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Main Feature: Tryout Mode - Spans 2 cols, 2 rows */}
          <motion.div
            className="md:col-span-2 lg:col-span-2 row-span-2"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <Card className="h-full bg-card border-border overflow-hidden relative group hover:border-primary/50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl font-mono">
                  <HugeiconsIcon
                    icon={Terminal}
                    className="h-6 w-6 text-primary"
                  />
                  SIMULATION_MODE
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-muted-foreground text-lg font-mono">
                  {">"} Executing 1:1 exam environment replication. <br />
                  {">"} Latency: 0ms. IRT scoring engine active.
                </p>

                {/* Visual Representation of Timer/Exam */}
                <div className="rounded-lg border bg-background/50 p-4 font-mono text-xs space-y-3">
                  <div className="flex justify-between items-center border-b pb-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <HugeiconsIcon icon={TimerIcon} className="h-4 w-4" />
                      <span>TIME_REMAINING</span>
                    </div>
                    <span className="text-destructive animate-pulse">
                      00:14:59
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-muted-foreground">
                      <span>PU_SUBTEST_01</span>
                      <span>PROGRESS: 85%</span>
                    </div>
                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                      <div className="h-full w-[85%] bg-primary"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-10 gap-1 mt-2">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div
                        key={`simulation-grid-${i}`}
                        className={`aspect-square rounded-[2px] ${i < 15 ? "bg-primary/20" : "bg-secondary"}`}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Practice Mode */}
          <motion.div
            className="md:col-span-1"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Card className="h-full hover:border-primary/50 transition-colors group">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-mono text-lg">
                  <HugeiconsIcon
                    icon={RefreshIcon}
                    className="h-5 w-5 text-primary"
                  />
                  DRILL_MODE
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground font-mono">
                  {">"} Repeat failed modules. <br />
                  {">"} Instant error feedback loop.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Analytics */}
          <motion.div
            className="md:col-span-1"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <Card className="h-full hover:border-primary/50 transition-colors group">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-mono text-lg">
                  <HugeiconsIcon
                    icon={BarChartIcon}
                    className="h-5 w-5 text-primary"
                  />
                  DATA_ANALYTICS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground font-mono">
                  {">"} Visualize performance metrics. <br />
                  {">"} Identify cognitive bottlenecks.
                </p>
                <div className="mt-4 flex items-end gap-1 h-8">
                  <div className="w-1/5 bg-primary/20 h-[40%] group-hover:bg-primary/40 transition-colors"></div>
                  <div className="w-1/5 bg-primary/20 h-[60%] group-hover:bg-primary/40 transition-colors"></div>
                  <div className="w-1/5 bg-primary/20 h-[30%] group-hover:bg-primary/40 transition-colors"></div>
                  <div className="w-1/5 bg-primary/20 h-[80%] group-hover:bg-primary/40 transition-colors"></div>
                  <div className="w-1/5 bg-primary/20 h-[50%] group-hover:bg-primary/40 transition-colors"></div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Math & LaTeX */}
          <motion.div
            className="md:col-span-1"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <Card className="h-full hover:border-primary/50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-mono text-lg">
                  <HugeiconsIcon
                    icon={CalculatorIcon}
                    className="h-5 w-5 text-primary"
                  />
                  LATEX_SUPPORT
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground font-mono">
                  {">"} Rendering complex equations. <br />
                  {">"} Full math syntax compatibility.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Shortcuts */}
          <motion.div
            className="md:col-span-1"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            <Card className="h-full hover:border-primary/50 transition-colors group">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-mono text-lg">
                  <HugeiconsIcon
                    icon={KeyboardIcon}
                    className="h-5 w-5 text-primary"
                  />
                  HOTKEYS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground font-mono">
                  {">"} Optimize navigation speed. <br />
                  {">"} Keyboard-first workflow.
                </p>
                <div className="mt-4 flex gap-2">
                  <Badge
                    variant="outline"
                    className="font-mono text-[10px] group-hover:border-primary/50"
                  >
                    ⌘+Enter
                  </Badge>
                  <Badge
                    variant="outline"
                    className="font-mono text-[10px] group-hover:border-primary/50"
                  >
                    J
                  </Badge>
                  <Badge
                    variant="outline"
                    className="font-mono text-[10px] group-hover:border-primary/50"
                  >
                    L
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
