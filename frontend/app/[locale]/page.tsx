"use client";

import Image from "next/image";
import { Link } from "../../i18n/routing";
import {
  CheckCircle,
  RocketLaunch,
  Clock,
  Wallet,
  Desktop,
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

        {/* Section 1: Hero (80VH ELEVATED DESIGN WITH RICH DEPTH & ENLARGED VISUALS) */}
        <Section
          className="relative bg-gradient-to-b from-[#E9F2FC] via-[#F3F8FE] to-[#F8FAFC] !py-10 lg:!py-0 flex items-center min-h-[80vh] lg:h-[80vh] lg:min-h-[660px] overflow-hidden"
          containerClassName="w-full h-full flex items-center xl:max-w-[1360px] 2xl:max-w-[1460px]"
          id="hero"
        >
          {/* Subtle tech blueprint grid overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#0F2D5E08_1px,transparent_1px),linear-gradient(to_bottom,#0F2D5E08_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_35%,#000_70%,transparent_100%)] pointer-events-none" />

          {/* Glowing ambient radial mesh gradient orbs */}
          <div className="absolute -top-32 right-12 w-[680px] h-[680px] bg-gradient-to-br from-blue-300/35 via-sky-200/25 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-28 -left-20 w-[600px] h-[600px] bg-gradient-to-tr from-sky-200/40 via-blue-100/30 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_70%_at_50%_-10%,rgba(186,220,253,0.45),rgba(255,255,255,0))] pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 xl:gap-10 items-center w-full py-4">
            {/* Left Column: Enlarged Headline, Subheading, CTAs & Badge */}
            <div className="lg:col-span-5 flex flex-col items-start pt-2 lg:pt-0">
              {/* Heading */}
              <h1 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl lg:text-[2.85rem] xl:text-[3.35rem] 2xl:text-[3.65rem] text-slate-900 tracking-tight leading-[1.12] max-w-[20ch]">
                {tHero("title")}
              </h1>

              {/* Increased Text Size Description */}
              <p className="font-inter text-slate-600 text-base sm:text-lg lg:text-[1.125rem] leading-relaxed max-w-[48ch] mt-4 sm:mt-6">
                {tHero("description")}
              </p>

              {/* Enhanced Action Buttons */}
              <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-3.5">
                <Link
                  href="#contact"
                  className="rounded-xl px-6 sm:px-7 py-3.5 sm:py-4 text-white bg-gradient-to-r from-[#0F2D5E] via-[#163E78] to-[#1E529E] hover:from-[#0d254e] hover:to-[#174384] font-display font-semibold text-sm sm:text-base shadow-lg shadow-blue-950/20 hover:shadow-xl hover:shadow-blue-950/30 hover:-translate-y-0.5 active:translate-y-0 transition-all inline-flex items-center gap-2.5 group cursor-pointer"
                >
                  <span>{tHero("startProject")}</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" weight="bold" />
                </Link>

                <Link
                  href="#pricing"
                  className="rounded-xl px-5 sm:px-6 py-3.5 sm:py-4 text-slate-700 hover:text-slate-900 bg-white/85 hover:bg-white border border-slate-300/80 hover:border-slate-400 font-display font-medium text-sm sm:text-base shadow-2xs hover:shadow-sm transition-all inline-flex items-center justify-center cursor-pointer backdrop-blur-xs"
                >
                  {tHero("viewTariffs")}
                </Link>
              </div>
            </div>

            {/* Right Column: Significantly Enlarged Monitor Showcase with Halo Glow */}
            <div className="lg:col-span-7 relative w-full flex items-center justify-center lg:justify-end py-2">
              <div className="relative w-full lg:w-[114%] xl:w-[122%] 2xl:w-[128%] lg:-mr-6 xl:-mr-12 2xl:-mr-16 aspect-[1024/518]">
                {/* Backlight / Ambient glow behind the monitor */}
                <div className="absolute inset-0 max-w-[90%] max-h-[85%] m-auto bg-gradient-to-tr from-sky-400/25 via-blue-500/15 to-transparent blur-3xl rounded-full pointer-events-none -z-10" />

                <Image
                  src="/images/hero-monitor-front.png"
                  alt={tHero("imgAlt")}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 68vw, 1000px"
                  className="object-contain object-center lg:object-right drop-shadow-[0_25px_45px_rgba(15,45,94,0.2)]"
                  priority
                />
              </div>
            </div>
          </div>

          {/* Bottom subtle divider line */}
          <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-200/60 to-transparent pointer-events-none" />
        </Section>

        {/* Section 2: Regulatory Compliance Strip (BLUE SECTION) */}
        <Section
          className="bg-[#0F2D5E] text-white py-10 md:py-14 border-y border-white/10"
          containerClassName="xl:max-w-[1360px] 2xl:max-w-[1460px]"
          id="features"
        >
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
        <Section
          className="bg-white py-16 md:py-24"
          containerClassName="xl:max-w-[1360px] 2xl:max-w-[1460px]"
          id="about"
        >
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
