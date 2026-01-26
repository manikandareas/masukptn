"use client";

import { motion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle01Icon,
  ServerStack01Icon,
  Pulse01Icon,
  DatabaseIcon,
} from "@hugeicons/core-free-icons";

import { Badge } from "@/components/ui/badge";

import type { FeatureSection } from "../types";

const features: FeatureSection[] = [
  {
    badge: "SYSTEM_SYNC",
    title: "REAL_TIME_SIMULATION",
    description:
      "Experience the exact testing environment. Time blocking algorithms and navigation systems calibrated to match official UTBK standards.",
    points: [
      "[SYNC] Automated time-blocking protocols",
      "[UI/UX] 100% Interface Accuracy",
      "[INPUT] Keyboard shortcut navigation enabled",
    ],
    icon: ServerStack01Icon,
    alignment: "left",
    gradient: "from-primary/10 to-primary/5",
  },
  {
    badge: "DATA_INSIGHTS",
    title: "PERFORMANCE_METRICS",
    description:
      "Proprietary algorithms analyze cognitive patterns to generate actionable improvement data. Don't just study; optimize your neural pathways.",
    points: [
      "[VISUAL] Cognitive weakness heatmaps",
      "[ALGO] Personalized error correction feed",
      "[PREDICT] University acceptance probability model",
    ],
    icon: Pulse01Icon,
    alignment: "right",
    gradient: "from-secondary/20 to-secondary/10",
  },
  {
    badge: "KNOWLEDGE_BASE",
    title: "PREMIUM_REPOSITORY",
    description:
      "Access a verified database of high-fidelity problem sets. Detailed logic breakdowns included for every entry in the archive.",
    points: [
      "[VIDEO] Deep-dive logic explanations",
      "[MODE] Unlimited practice iterations",
      "[UPDATE] Weekly database synchronization",
    ],
    icon: DatabaseIcon,
    alignment: "left",
    gradient: "from-muted/20 to-muted/10",
  },
];

export function FeatureSections() {
  return (
    <section className="py-20 lg:py-32 relative overflow-hidden bg-background">
      {/* Grid Background */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-size-[32px_32px]"></div>

      <div className="w-full max-w-6xl mx-auto px-4 md:px-6 space-y-32">
        {features.map((feature, idx) => (
          <div
            key={feature.title}
            className={`flex flex-col gap-12 lg:items-center ${feature.alignment === "right" ? "lg:flex-row-reverse" : "lg:flex-row"}`}
          >
            {/* Text Content */}
            <motion.div
              className="flex-1 space-y-6"
              initial={{
                opacity: 0,
                x: feature.alignment === "left" ? -50 : 50,
              }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-muted-foreground">
                  0{idx + 1} {"//"}
                </span>
                <Badge
                  variant="secondary"
                  className="px-2 py-0.5 font-mono text-xs rounded-none border-b-2 border-primary bg-background text-primary"
                >
                  {feature.badge}
                </Badge>
              </div>

              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-mono">
                {feature.title}
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed font-mono">
                {">"} {feature.description}
              </p>

              <ul className="space-y-4 pt-4">
                {feature.points.map((point, i) => (
                  <motion.li
                    key={point}
                    className="flex items-start gap-3 group"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                  >
                    <div className="mt-1 h-5 w-5 rounded-none border border-primary/50 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <HugeiconsIcon
                        icon={CheckmarkCircle01Icon}
                        className="h-3 w-3"
                      />
                    </div>
                    <span className="font-mono text-sm">{point}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Visual Content */}
            <motion.div
              className="flex-1 relative"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div
                className={`relative aspect-[4/3] rounded-[0.625rem] overflow-hidden border bg-background shadow-2xl group`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-20`}
                />

                {/* Decorative Corners */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary/50" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary/50" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary/50" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary/50" />

                {/* Internal Window UI */}
                <div className="absolute inset-4 border border-border bg-card/50 backdrop-blur-sm rounded-md flex flex-col p-4 shadow-inner">
                  <div className="flex items-center gap-2 border-b pb-2 mb-2 text-xs font-mono text-muted-foreground">
                    <HugeiconsIcon icon={feature.icon} className="h-3 w-3" />
                    <span>{feature.badge}_SYS_V1.log</span>
                  </div>
                  <div className="flex-1 font-mono text-xs overflow-hidden opacity-70 space-y-2">
                    <div className="flex">
                      <span className="text-primary mr-2">root@system:</span>
                      <span>initiating protocol...</span>
                    </div>
                    <div className="flex">
                      <span className="text-primary mr-2">root@system:</span>
                      <span className="text-green-500">
                        connection established.
                      </span>
                    </div>
                    <div className="h-px bg-border my-2" />
                    <div className="grid grid-cols-2 gap-4">
                      <div className="border p-2">
                        <div className="text-[10px] text-muted-foreground mb-1">
                          LATENCY
                        </div>
                        <div className="text-lg">12ms</div>
                      </div>
                      <div className="border p-2">
                        <div className="text-[10px] text-muted-foreground mb-1">
                          PACKETS
                        </div>
                        <div className="text-lg">100%</div>
                      </div>
                    </div>
                    <div className="mt-4 border p-2 bg-muted/20">
                      <code>{`{ status: "OPTIMAL", load: 0.45 }`}</code>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        ))}
      </div>
    </section>
  );
}
