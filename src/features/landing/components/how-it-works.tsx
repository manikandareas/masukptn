"use client";

import { motion } from "motion/react";

import { Badge } from "@/components/ui/badge";

import { LottiePlaceholder } from "./lottie-placeholder";

const steps = [
  {
    number: "01",
    title: "Pilih Paket Ujian",
    description:
      "Tersedia ribuan soal UTBK SNBT dan TKA sesuai kurikulum terbaru.",
  },
  {
    number: "02",
    title: "Kerjakan Simulasi",
    description:
      "Kerjakan dengan sistem blocking waktu dan interface yang 100% mirip aslinya.",
  },
  {
    number: "03",
    title: "Evaluasi Hasil",
    description:
      "Dapatkan analisis detail, pembahasan, dan rekomendasi materi yang perlu dipelajari.",
  },
  {
    number: "04",
    title: "Pantau Progress",
    description:
      "Lihat grafik peningkatan skormu dari waktu ke waktu dan capai targetmu.",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-muted/30 py-20 lg:py-32">
      <div className="w-full max-w-6xl mx-auto px-4 md:px-6">
        <div className="mb-12 flex flex-col items-center justify-center space-y-4 text-center">
          <Badge variant="outline" className="px-3 py-1">
            Cara Kerja
          </Badge>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Langkah Mudah Menuju PTN Impian
          </h2>
          <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Sistem kami dirancang untuk membantumu belajar secara terstruktur
            dan efektif.
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="order-2 lg:order-1"
          >
            <div className="relative space-y-8 pl-8 before:absolute before:left-[11px] before:top-2 before:h-[calc(100%-20px)] before:w-[2px] before:bg-linear-to-b before:from-primary before:to-transparent">
              {steps.map((step, index) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  <div className="absolute -left-[41px] flex h-6 w-6 items-center justify-center rounded-full border-2 border-primary bg-background text-xs font-bold text-primary">
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-bold">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="order-1 lg:order-2"
          >
            <div className="aspect-square relative overflow-hidden rounded-xl bg-card border shadow-lg">
              <LottiePlaceholder
                className="h-full w-full"
                label="Workflow Animation"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
