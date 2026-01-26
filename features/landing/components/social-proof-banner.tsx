"use client";

import { motion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle02Icon,
  StarAward01Icon,
  UserGroupIcon,
  BookOpenIcon,
} from "@hugeicons/core-free-icons";

const stats = [
  {
    icon: BookOpenIcon,
    value: "10,000+",
    label: "Bank Soal",
  },
  {
    icon: CheckmarkCircle02Icon,
    value: "100%",
    label: "Mirip UTBK",
  },
  {
    icon: UserGroupIcon,
    value: "50,000+",
    label: "Siswa Aktif",
  },
  {
    icon: StarAward01Icon,
    value: "High",
    label: "Success Rate",
  },
];

export function SocialProofBanner() {
  return (
    <section className="border-b bg-muted/40 py-12">
      <div className="w-full max-w-6xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col items-center justify-center space-y-2 text-center"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <HugeiconsIcon
                  icon={stat.icon}
                  className="h-6 w-6 text-primary"
                />
              </div>
              <h3 className="text-3xl font-bold tracking-tighter">
                {stat.value}
              </h3>
              <p className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
