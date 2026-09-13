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
import { useTranslations } from "next-intl";

export default function Home() {
  const tHero = useTranslations("hero");
  const tFeat = useTranslations("features");
  const tAbout = useTranslations("about");

  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col">

        {/* Section 1: Hero */}
        <Section className="bg-bg !py-0 flex items-center min-h-[75vh]" id="hero">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-center py-4 lg:py-6 min-h-[75vh] w-full">
            <div className="flex flex-col items-start gap-5 pt-6 lg:pt-0">
              <h1 className="font-lexend text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tighter text-primary leading-[1.1]">
                {tHero("title")}
              </h1>
              <p className="text-secondary text-lg leading-relaxed max-w-[65ch]">
                {tHero("description")}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-4">
                <Link href="#contact" className="btn btn-primary rounded-lg px-5 py-2 h-auto min-h-[40px] text-white bg-accent hover:bg-accent-hover border-none font-semibold text-sm w-full sm:w-auto flex items-center justify-center">
                  {tHero("startProject")}
                </Link>
                <Link href="#pricing" className="btn btn-outline rounded-lg px-5 py-2 h-auto min-h-[40px] text-accent border-accent hover:bg-accent-light hover:border-accent font-medium text-sm w-full sm:w-auto flex items-center justify-center">
                  {tHero("viewTariffs")}
                </Link>
              </div>
            </div>
            <div className="relative w-full aspect-video md:aspect-[4/3] flex items-center justify-center">
              <Image
                src="/images/hero-image.png"
                alt={tHero("imgAlt")}
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </Section>

        {/* Section 2: Feature Highlights Row */}
        <Section className="bg-bg py-6 md:py-8 border-y border-border/40" id="features">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 items-center">
            {[
              {
                icon: <RocketLaunch size={22} className="text-secondary" />,
                heading: tFeat("f1Title"),
                subheading: tFeat("f1Sub")
              },
              {
                icon: <Clock size={22} className="text-secondary" />,
                heading: tFeat("f2Title"),
                subheading: tFeat("f2Sub")
              },
              {
                icon: <Wallet size={22} className="text-secondary" />,
                heading: tFeat("f3Title"),
                subheading: tFeat("f3Sub")
              },
              {
                icon: <Desktop size={22} className="text-secondary" />,
                heading: tFeat("f4Title"),
                subheading: tFeat("f4Sub")
              }
            ].map((feature, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-surface-raised border border-border/60 flex items-center justify-center shrink-0 shadow-sm">
                  {feature.icon}
                </div>
                <div className="flex flex-col gap-1 pt-0.5">
                  <h3 className="font-lexend text-base font-semibold text-primary leading-tight">
                    {feature.heading}
                  </h3>
                  <p className="text-secondary text-xs leading-relaxed">
                    {feature.subheading}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Section 3: About Us */}
        <Section className="bg-bg py-12 md:py-20" id="about">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            <div className="lg:col-span-5 relative w-full h-[380px] sm:h-[460px] lg:h-[490px] flex items-center justify-center">
              <Image
                src="/images/about-diagram.png"
                alt="Pharmaceutical Regulatory Platform Architecture"
                fill
                className="object-contain"
                priority
              />
            </div>

            <div className="lg:col-span-7 flex flex-col gap-6">
              <div>
                <p className="text-xs font-semibold tracking-[0.12em] text-accent uppercase mb-2">
                  {tAbout("tag")}
                </p>
                <h2 className="font-lexend text-3xl sm:text-4xl lg:text-[2.5rem] font-bold text-primary tracking-tight leading-[1.2]">
                  {tAbout("title")}
                </h2>
              </div>
              
              <p className="text-secondary text-base sm:text-lg leading-relaxed">
                {tAbout("p1")}
              </p>

              <p className="text-secondary text-base sm:text-lg leading-relaxed">
                {tAbout("p2")}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-2">
                {[
                  tAbout("check1"),
                  tAbout("check2"),
                  tAbout("check3"),
                  tAbout("check4")
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl bg-surface/80 border border-border/80 hover:border-accent/40 hover:bg-surface transition-all duration-300 shadow-sm group">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors">
                      <CheckCircle size={18} className="text-accent" weight="fill" />
                    </div>
                    <span className="text-primary text-sm font-medium leading-snug">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </Section>

        {/* Section 4: Tariffs */}
        <Section className="bg-bg py-12 md:py-20" id="pricing">
          <PricingSection />
        </Section>

        {/* Section 5: Process */}
        <Section className="bg-bg py-12 md:py-20" id="process">
          <ProcessSection />
        </Section>

        {/* Section 6: Contact */}
        <Section className="bg-bg py-12 md:py-20" id="contact">
          <ContactSection />
        </Section>

      </main>
      <Footer />
    </>
  );
}
