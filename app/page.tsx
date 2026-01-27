import type { Metadata } from "next";
import LandingPageContent from "@/features/landing/components/landing-page-content";

export const metadata: Metadata = {
  title: "MasukPTN - Platform Persiapan SNMPTN",
  description: "Platform persiapan SNMPTN dengan tryout, latihan soal, dan analisis performa.",
};

export default function LandingPage() {
  return <LandingPageContent />;
}
