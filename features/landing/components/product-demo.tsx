"use client";

import { motion } from "motion/react";

import { Badge } from "@/components/ui/badge";

export function ProductDemo() {
  return (
    <section className="py-20 lg:py-32 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <Badge variant="outline" className="px-3 py-1">
            Tampilan Antarmuka
          </Badge>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Simpel, Fokus, & Cepat
          </h2>
          <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Antarmuka yang bersih membantu kamu fokus mengerjakan soal tanpa
            gangguan.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-xl border bg-background shadow-2xl"
        >
          <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-2">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-500/50" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/50" />
              <div className="h-3 w-3 rounded-full bg-green-500/50" />
            </div>
            <div className="ml-4 h-6 w-full max-w-[400px] rounded bg-muted-foreground/10" />
          </div>
          <div className="aspect-[16/9] w-full bg-card p-4 lg:p-8">
            <div className="grid h-full grid-cols-12 gap-4 lg:gap-8">
              <div className="col-span-12 lg:col-span-9 flex flex-col gap-6">
                <div className="h-8 w-1/3 rounded bg-muted-foreground/20" />
                <div className="space-y-2">
                  <div className="h-4 w-full rounded bg-muted-foreground/10" />
                  <div className="h-4 w-full rounded bg-muted-foreground/10" />
                  <div className="h-4 w-3/4 rounded bg-muted-foreground/10" />
                </div>
                <div className="mt-4 space-y-3">
                  {["A", "B", "C", "D", "E"].map((opt) => (
                    <div
                      key={`demo-option-${opt}`}
                      className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50"
                    >
                      <div className="flex h-6 w-6 items-center justify-center rounded-full border text-xs font-mono">
                        {opt}
                      </div>
                      <div className="h-4 w-1/2 rounded bg-muted-foreground/10" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="hidden lg:col-span-3 lg:flex flex-col gap-4">
                <div className="h-12 w-full rounded bg-primary/10 flex items-center justify-center font-mono text-primary font-bold">
                  00:45:00
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div
                      key={`demo-palette-${i}`}
                      className={`aspect-square rounded border flex items-center justify-center text-xs text-muted-foreground ${i === 4 ? "bg-primary text-primary-foreground border-primary" : ""}`}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent pointer-events-none lg:hidden" />
        </motion.div>
      </div>
    </section>
  );
}
