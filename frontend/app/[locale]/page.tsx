"use client";

import Image from "next/image";
import { Link } from "../../i18n/routing";
import {
  CheckCircle,
  FileText,
  ShieldCheck,
  Lock,
  Lightning,
  ArrowRight,
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

        {/* Section 1: Hero (FULL-BLEED BACKGROUND SHOWCASE WITH LAPTOP & ECTD WORKFLOW) */}
        <section
          id="hero"
          className="relative w-full text-white flex items-center min-h-[90vh] lg:h-[90vh] lg:min-h-[740px] xl:h-[92vh] xl:min-h-[780px] overflow-hidden bg-[#0F2D5E]"
        >
          {/* Background Graphic Asset — positioned absolute filling entire section */}
          <Image
            src="/images/hero-bg-hd.webp"
            alt="ITAVE eCTD Dossier & XML Submission Platform"
            fill
            priority
            sizes="100vw"
            quality={100}
            className="absolute inset-0 object-cover object-right"
          />

          {/* Minimal left-side scrim only for text legibility — no tint on the image itself */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent pointer-events-none" />
          {/* Mobile: slight overall overlay so text stays readable */}
          <div className="absolute inset-0 bg-black/20 lg:hidden pointer-events-none" />

          {/* Content */}
          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:max-w-[1360px] 2xl:max-w-[1460px] h-full flex items-center py-14 lg:py-0">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full">
              {/* Left Column: Headline, Description & CTAs */}
              <div className="lg:col-span-6 xl:col-span-5 flex flex-col items-start pt-2 lg:pt-0">
                {/* Heading */}
                <h1 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl lg:text-[2.75rem] xl:text-[3.25rem] text-white tracking-tight leading-[1.14] max-w-[20ch]">
                  {tHero("title")}
                </h1>

                {/* Description */}
                <p className="font-inter text-blue-100/90 text-base sm:text-lg lg:text-[1.125rem] leading-relaxed max-w-[46ch] mt-4 sm:mt-6">
                  {tHero("description")}
                </p>

                {/* Action Buttons */}
                <div className="mt-7 sm:mt-9 flex flex-wrap items-center gap-3.5 sm:gap-4">
                  <Link
                    href="#contact"
                    className="rounded-xl px-6 sm:px-7 py-3.5 sm:py-4 text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 font-display font-semibold text-sm sm:text-base shadow-lg shadow-blue-950/30 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all inline-flex items-center gap-2.5 group cursor-pointer"
                  >
                    <span>{tHero("startProject")}</span>
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" weight="bold" />
                  </Link>

                  <Link
                    href="#pricing"
                    className="rounded-xl px-5 sm:px-6 py-3.5 sm:py-4 text-white bg-white/10 hover:bg-white/20 border border-white/30 backdrop-blur-sm font-display font-medium text-sm sm:text-base transition-all inline-flex it-center justify-center cursor-pointer"
                  >
                    {tHero("viewTariffs")}
                  </Link>
                </div>
              </div>

              {/* Right spacer so the background image is fully visible */}
              <div className="hidden lg:block lg:col-span-6 xl:col-span-7 pointer-events-none" />
            </div>
          </div>

          {/* Bottom divider line */}
          <div className="absolute bottom-0 inset-x-0 h-px bg-white/10 pointer-events-none" />
        </section>

        {/* Section 2: Regulatory Compliance Strip (BLUE SECTION - REFERENCE DESIGN) */}
        <Section
          className="bg-[#0F2D5E] text-white py-6 md:py-8 border-y border-white/10"
          containerClassName="xl:max-w-[1360px] 2xl:max-w-[1460px]"
          id="features"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 items-center gap-4 sm:gap-y-6 lg:gap-0">
            {[
              {
                icon: <FileText size={24} className="text-white" weight="regular" />,
                title: tFeat("f1Title"),
              },
              {
                icon: <ShieldCheck size={24} className="text-white" weight="regular" />,
                title: tFeat("f2Title"),
              },
              {
                icon: <Lock size={24} className="text-white" weight="regular" />,
                title: tFeat("f3Title"),
              },
              {
                icon: <Lightning size={24} className="text-white" weight="regular" />,
                title: tFeat("f4Title"),
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="relative flex items-center gap-3.5 sm:gap-4 py-2 sm:py-3 px-3 sm:px-5 lg:px-6 justify-start lg:justify-center"
              >
                <div className="w-12 h-12 rounded-full border border-white/40 flex items-center justify-center shrink-0 text-white">
                  {feature.icon}
                </div>
                <span className="font-display font-medium text-white text-sm sm:text-[0.95rem] xl:text-base leading-snug">
                  {feature.title}
                </span>

                {/* Vertical Divider matching reference image */}
                {i < 3 && (
                  <div
                    className={`hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 h-10 w-px bg-white/20 ${
                      i === 1 ? "" : "sm:block"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </Section>

        {/* Section 3: Enterprise Platform Architecture (WHITE SECTION) */}
        <Section
          className="bg-white py-16 md:py-24"
          containerClassName="xl:max-w-[1360px] 2xl:max-w-[1460px]"
          id="about"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 xl:gap-16 items-center">

            <div className="lg:col-span-6 relative w-full aspect-[1024/518] flex items-center justify-center">
              {/* Subtle ambient backlight glow */}
              <div className="absolute inset-0 max-w-[90%] max-h-[85%] m-auto bg-gradient-to-tr from-sky-400/20 via-blue-500/10 to-transparent blur-2xl rounded-full pointer-events-none -z-10" />

              <Image
                src="/images/about-dossier-preview.png"
                alt={tAbout("imgAlt")}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 700px"
                className="object-contain drop-shadow-[0_20px_35px_rgba(15,45,94,0.14)]"
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
