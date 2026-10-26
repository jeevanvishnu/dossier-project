"use client";

import Image from "next/image";
import { Link } from "../../i18n/routing";
import {
  CheckCircle,
  RocketLaunch,
  Clock,
  Wallet,
  Desktop,
} from "@phosphor-icons/react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Section } from "../components/Section";
import { PricingSection } from "../components/PricingSection";
import { ProcessSection } from "../components/ProcessSection";
import { ContactSection } from "../components/ContactSection";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export default function Home() {
  const tHero = useTranslations("hero");
  const tFeat = useTranslations("features");
  const tAbout = useTranslations("about");

  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || isAuthenticated) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-800 antialiased selection:bg-blue-600 selection:text-white">
      <Navbar />
      <main className="flex-1 flex flex-col">

        {/* Section 1: Hero (VISIBLE SOFT BLUE / SLATE MESH GRADIENT) */}
        <Section className="relative bg-gradient-to-b from-blue-100/70 via-sky-50/50 to-white !py-10 md:!py-14 lg:!py-16 flex items-center min-h-[68vh] overflow-hidden" id="hero">
          {/* Visible ambient radial mesh gradient orbs */}
          <div className="absolute -top-32 right-0 w-[680px] h-[680px] bg-gradient-to-br from-blue-200/70 via-sky-200/50 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-20 w-[550px] h-[550px] bg-gradient-to-tr from-slate-200/70 via-blue-100/60 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_70%_at_50%_-10%,rgba(186,220,253,0.55),rgba(255,255,255,0))] pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-14 items-center w-full">
            <div className="lg:col-span-5 flex flex-col items-start pt-2 lg:pt-0">
              <h1 className="font-display font-bold text-2xl sm:text-3xl lg:text-[2.5rem] xl:text-[2.75rem] text-slate-900 tracking-tight leading-[1.2] max-w-[18ch]">
                {tHero("title")}
              </h1>

              <p className="font-inter text-slate-600 text-sm sm:text-base leading-relaxed max-w-[46ch] mt-5">
                {tHero("description")}
              </p>

              <div className="mt-6">
                <Link
                  href="#contact"
                  className="rounded-lg sm:rounded-xl px-5 sm:px-6 py-2.5 sm:py-3 text-white bg-gradient-to-r from-[#0F2D5E] via-[#153C75] to-[#1C4E91] hover:from-[#133568] hover:to-[#225CA8] font-display font-medium text-xs sm:text-sm shadow-sm hover:shadow-md transition-all inline-flex items-center justify-center cursor-pointer"
                >
                  {tHero("startProject")}
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7 relative w-full h-[280px] sm:h-[380px] md:h-[440px] lg:h-[480px] xl:h-[520px] flex items-center justify-center">
              <Image
                src="/images/hero-ectd-validator.png"
                alt={tHero("imgAlt")}
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </Section>

        {/* Section 2: Regulatory Compliance Strip (BLUE SECTION) */}
        <Section className="bg-[#0F2D5E] text-white py-10 md:py-14 border-y border-white/10" id="features">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 items-center">
            {[
              {
                icon: <RocketLaunch size={24} className="text-sky-300" weight="duotone" />,
                heading: tFeat("f1Title"),
                subheading: tFeat("f1Sub")
              },
              {
                icon: <Clock size={24} className="text-sky-300" weight="duotone" />,
                heading: tFeat("f2Title"),
                subheading: tFeat("f2Sub")
              },
              {
                icon: <Wallet size={24} className="text-sky-300" weight="duotone" />,
                heading: tFeat("f3Title"),
                subheading: tFeat("f3Sub")
              },
              {
                icon: <Desktop size={24} className="text-sky-300" weight="duotone" />,
                heading: tFeat("f4Title"),
                subheading: tFeat("f4Sub")
              }
            ].map((feature, i) => (
              <div key={i} className="flex items-start gap-4 p-3 rounded-2xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] transition-all">
                <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0 shadow-sm">
                  {feature.icon}
                </div>
                <div className="flex flex-col gap-1 pt-0.5">
                  <h3 className="font-display text-base font-bold text-white leading-tight">
                    {feature.heading}
                  </h3>
                  <p className="font-inter text-slate-300 text-xs leading-relaxed">
                    {feature.subheading}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Section 3: Enterprise Platform Architecture (WHITE SECTION) */}
        <Section className="bg-white py-16 md:py-24" id="about">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 xl:gap-16 items-center">

            <div className="lg:col-span-6 relative w-full aspect-[1.45/1] flex items-center justify-center">
              <Image
                src="/images/about-architecture-aligned.png"
                alt="Pharmaceutical Regulatory Platform Architecture"
                fill
                className="object-contain"
                priority
              />
            </div>

            <div className="lg:col-span-6 flex flex-col justify-center gap-5">
              <div>
                <h2 className="font-display font-bold text-2xl sm:text-3xl lg:text-[2.25rem] text-slate-900 tracking-tight leading-tight">
                  {tAbout("title")}
                </h2>
              </div>

              <p className="font-inter text-slate-600 text-sm sm:text-base leading-relaxed">
                {tAbout("p1")}
              </p>

              <p className="font-inter text-slate-600 text-sm sm:text-base leading-relaxed">
                {tAbout("p2")}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                {[
                  tAbout("check1"),
                  tAbout("check2"),
                  tAbout("check3"),
                  tAbout("check4")
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
                      <CheckCircle size={16} className="text-[#0F2D5E]" weight="fill" />
                    </div>
                    <span className="font-display text-slate-800 text-xs sm:text-sm font-semibold leading-snug">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </Section>

        {/* Section 4: Tariffs & Pricing (LIGHT SECTION matching reference design) */}
        <Section className="bg-[#F8FAFC] py-16 md:py-24 border-y border-slate-200/80" id="pricing">
          <PricingSection />
        </Section>

        {/* Section 5: Process (WHITE SECTION) */}
        <Section className="bg-white py-16 md:py-24 border-t border-slate-200/80" id="process">
          <ProcessSection />
        </Section>

        {/* Section 6: Consultation & Contact (BLUE SECTION) */}
        <Section className="bg-[#0F2D5E] py-16 md:py-24 text-white" id="contact">
          <ContactSection />
        </Section>

      </main>
      <Footer />
    </div>
  );
}
