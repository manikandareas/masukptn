"use client";

import { useEffect, useRef } from "react";

import { CTASection } from "./cta-section";
import { FeatureSections } from "./feature-sections";
import { FeaturesGrid } from "./features-grid";
import { Footer } from "./footer";
import { HeroSection } from "./hero-section";
import { HowItWorks } from "./how-it-works";
import { Navbar } from "./navbar";
import { SocialProofBanner } from "./social-proof-banner";
import { Testimonials } from "./testimonials";

import type LocomotiveScroll from "locomotive-scroll";

export default function LandingPageContent() {
  const scrollRef = useRef<LocomotiveScroll | null>(null);

  useEffect(() => {
    let isActive = true;

    import("locomotive-scroll").then((LocomotiveScrollModule) => {
      if (!isActive) return;
      const container = document.querySelector("[data-scroll-container]");
      if (!container) return;

      type LocomotiveConstructor = new (options: Record<string, unknown>) => LocomotiveScroll;
      const LocomotiveScrollCtor =
        LocomotiveScrollModule.default as unknown as LocomotiveConstructor;

      scrollRef.current = new LocomotiveScrollCtor({
        el: container as HTMLElement,
      });
    });

    return () => {
      isActive = false;
      scrollRef.current?.destroy();
      scrollRef.current = null;
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col" data-scroll-container>
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <SocialProofBanner />
        <FeaturesGrid />
        <FeatureSections />
        <HowItWorks />
        <Testimonials />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
