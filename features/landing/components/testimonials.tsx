"use client";

import { motion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Terminal } from "@hugeicons/core-free-icons";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import type { Testimonial } from "../types";

const testimonials: Testimonial[] = [
  {
    quote:
      "Simulation accuracy confirmed. The environment mirrors the actual UTBK interface perfectly.",
    name: "Sarah A.",
    school: "SMAN 1 Jakarta",
    grade: "ACCEPTED: UI_2025",
    rating: 5,
    id: "USR_LOG_8821",
  },
  {
    quote:
      "Analytics module identified weak subtest vectors. Optimization protocol was successful.",
    name: "Budi S.",
    school: "SMAN 3 Bandung",
    grade: "ACCEPTED: ITB_2025",
    rating: 5,
    id: "USR_LOG_9932",
  },
  {
    quote:
      "Practice mode infinite loop allowed for mastery of complex logic patterns.",
    name: "Dinda P.",
    school: "SMAN 5 Surabaya",
    grade: "ACCEPTED: UGM_2025",
    rating: 4,
    id: "USR_LOG_1102",
  },
];

export function Testimonials() {
  return (
    <section className="bg-background border-b py-20 lg:py-32 relative">
      <div className="w-full max-w-6xl mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <Badge
            variant="outline"
            className="px-3 py-1 font-mono text-xs border-primary/20 bg-primary/5 text-primary"
          >
            USER_LOGS
          </Badge>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-mono">
            SUCCESS_STORIES
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-colors group">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center border-b border-border/50 pb-2 mb-2">
                    <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                      <HugeiconsIcon icon={Terminal} className="h-3 w-3" />
                      <span>{testimonial.id}</span>
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={`testimonial-${testimonial.id}-star-${i}`}
                          className={`h-1.5 w-1.5 rounded-full ${i < testimonial.rating ? "bg-primary" : "bg-muted"}`}
                        />
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-0 flex flex-col h-full gap-4">
                  <div className="font-mono text-sm text-muted-foreground">
                    <span className="text-primary">{">"}</span>{" "}
                    {testimonial.quote}
                  </div>

                  <div className="mt-auto pt-4 flex items-center gap-3">
                    <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center text-primary font-mono text-xs border border-primary/20">
                      {testimonial.name[0]}
                    </div>
                    <div className="font-mono text-xs">
                      <p className="font-bold">{testimonial.name}</p>
                      <p className="text-muted-foreground">
                        {testimonial.school}
                      </p>
                      <Badge
                        variant="secondary"
                        className="mt-1 px-1 py-0 text-[10px] h-auto bg-green-500/10 text-green-500 hover:bg-green-500/20 hover:text-green-600 border-green-500/20"
                      >
                        {testimonial.grade}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
