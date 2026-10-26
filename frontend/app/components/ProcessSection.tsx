"use client";

import React, { useState } from "react";
import {
  Folders,
  FileCode,
  ShieldCheck,
  PaperPlaneRight,
  CheckCircle,
  ArrowRight
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";

export function ProcessSection() {
  const tProc = useTranslations("process");
  const [activeStep, setActiveStep] = useState<number>(1);

  const steps = [
    {
      id: 1,
      badge: "PHASE 01",
      number: "01",
      watermark: "1",
      cleanTitle: tProc("step1Title").replace(/^\d+\.\s*/, ""),
      rawTitle: tProc("step1Title"),
      description: tProc("step1Desc"),
      icon: <Folders size={24} weight="fill" className="text-[#0F2D5E]" />,
      deliverable: "ICH / EAEU Module 1 Spec Initialized",
      standard: "XML DTD 4.0 & 3.2.2"
    },
    {
      id: 2,
      badge: "PHASE 02",
      number: "02",
      watermark: "2",
      cleanTitle: tProc("step2Title").replace(/^\d+\.\s*/, ""),
      rawTitle: tProc("step2Title"),
      description: tProc("step2Desc"),
      icon: <FileCode size={24} weight="fill" className="text-[#0F2D5E]" />,
      deliverable: "Automated Hyperlink & Leaf Checksum Audit",
      standard: "MD5 Integrity Verified"
    },
    {
      id: 3,
      badge: "PHASE 03",
      number: "03",
      watermark: "3",
      cleanTitle: tProc("step3Title").replace(/^\d+\.\s*/, ""),
      rawTitle: tProc("step3Title"),
      description: tProc("step3Desc"),
      icon: <ShieldCheck size={24} weight="fill" className="text-[#0F2D5E]" />,
      deliverable: "Multi-Reviewer Regulatory Validation Gate",
      standard: "21 CFR Part 11 Audit Trail"
    },
    {
      id: 4,
      badge: "PHASE 04",
      number: "04",
      watermark: "4",
      cleanTitle: tProc("step4Title").replace(/^\d+\.\s*/, ""),
      rawTitle: tProc("step4Title"),
      description: tProc("step4Desc"),
      icon: <PaperPlaneRight size={24} weight="fill" className="text-[#0F2D5E]" />,
      deliverable: "Direct Gateway Dispatch & Receipt Archival",
      standard: "Official Health Authority Protocol"
    }
  ];

  return (
    <div className="relative w-full flex flex-col gap-12 lg:gap-16 overflow-hidden">
      {/* Background Watermark Accent matching the reference image */}
      <div className="absolute -top-4 right-2 md:right-10 font-display font-black text-8xl md:text-9xl text-slate-100/80 select-none pointer-events-none -z-0">
        04
      </div>

      {/* Header: Exact same text size and model as Pricing section */}
      <div className="relative z-10 text-center max-w-4xl lg:max-w-5xl mx-auto flex flex-col items-center gap-2.5">
        <div className="inline-flex items-center gap-2 text-xs font-display font-semibold tracking-widest text-[#0F2D5E] uppercase mb-1">
          <span className="w-5 h-[2px] bg-[#0F2D5E] inline-block rounded-full"></span>
          <span>{tProc("tag")}</span>
          <span className="w-5 h-[2px] bg-[#0F2D5E] inline-block rounded-full"></span>
        </div>

        <h2 className="font-display font-bold text-2xl sm:text-3xl lg:text-[2.25rem] text-slate-900 tracking-tight leading-tight md:whitespace-nowrap">
          {tProc("title")}
          <span className="text-[#0F2D5E]">.</span>
        </h2>

        <p className="font-inter text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl sm:max-w-2xl mx-auto text-balance">
          {tProc("desc")}
        </p>
      </div>

      {/* DESKTOP & TABLET: Continuous Sine Wave Track with Glowing Hexagonal Badges */}
      <div className="relative hidden md:block w-full min-h-[480px]">
        {/* Continuous SVG Curved Wave */}
        <div className="absolute inset-x-0 top-0 h-[480px] pointer-events-none z-0">
          <svg
            viewBox="0 0 1000 480"
            className="w-full h-full overflow-visible"
            fill="none"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="waveBrandNavyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0F2D5E" />
                <stop offset="50%" stopColor="#1B4D8C" />
                <stop offset="100%" stopColor="#0F2D5E" />
              </linearGradient>
            </defs>
            {/* The sine curve connecting the 4 nodes */}
            <path
              d="M 30,300 C 65,280 95,270 125,270 C 205,270 295,140 375,140 C 455,140 545,270 625,270 C 705,270 795,140 875,140 C 915,140 945,155 975,170"
              stroke="url(#waveBrandNavyGrad)"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* 4 Staggered Columns matching reference geometry */}
        <div className="grid grid-cols-4 relative z-10 h-[480px]">
          {steps.map((step) => {
            const isOdd = step.id % 2 !== 0; // Steps 1 & 3: Text above, node below
            const isSelected = activeStep === step.id;

            return (
              <div
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                className="relative flex flex-col justify-between px-3 cursor-pointer group"
              >
                {/* TOP POSITIONED CONTENT (For Steps 1 & 3) */}
                {isOdd ? (
                  <div className="pt-2 pb-6 flex flex-col gap-2 relative">
                    <div className="relative">
                      {/* Giant faint watermark number */}
                      <span className="font-display font-black text-6xl lg:text-7xl text-slate-100 select-none pointer-events-none absolute -top-5 left-0 leading-none">
                        {step.watermark}
                      </span>
                      <h3 className="relative font-display font-bold text-lg text-slate-900 group-hover:text-[#0F2D5E] transition-colors leading-snug pt-3">
                        {step.cleanTitle}
                      </h3>
                    </div>

                    <p className="font-inter text-xs text-slate-500 leading-relaxed min-h-[48px]">
                      {step.description}
                    </p>

                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50/80 border border-blue-100 text-[#0F2D5E] text-[11px] font-semibold self-start">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0F2D5E] shrink-0"></span>
                      <span className="leading-tight">{step.standard}</span>
                    </div>
                  </div>
                ) : (
                  <div className="h-[100px]" />
                )}

                {/* HEXAGONAL BADGE ON THE WAVE */}
                <div
                  className={`absolute left-1/2 -translate-x-1/2 flex items-center justify-center transition-all duration-300 ${
                    isOdd ? "top-[236px]" : "top-[106px]"
                  } ${isSelected ? "scale-110" : "group-hover:scale-105"}`}
                >
                  <div className="relative w-[68px] h-[68px] flex items-center justify-center">
                    <svg
                      width="68"
                      height="68"
                      viewBox="0 0 68 68"
                      className="overflow-visible"
                    >
                      <polygon
                        points="34,4 62,20 62,48 34,64 6,48 6,20"
                        fill="white"
                        stroke={isSelected ? "#0F2D5E" : "#E2E8F0"}
                        strokeWidth={isSelected ? "2" : "1"}
                        style={{
                          filter: isSelected
                            ? "drop-shadow(0 12px 22px rgba(15, 45, 94, 0.45))"
                            : "drop-shadow(0 10px 18px rgba(15, 45, 94, 0.25))"
                        }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      {step.icon}
                    </div>
                  </div>
                </div>

                {/* BOTTOM POSITIONED CONTENT (For Steps 2 & 4) */}
                {!isOdd ? (
                  <div className="pt-28 pb-4 flex flex-col gap-2 relative">
                    <div className="relative">
                      {/* Giant faint watermark number */}
                      <span className="font-display font-black text-6xl lg:text-7xl text-slate-100 select-none pointer-events-none absolute -top-5 left-0 leading-none">
                        {step.watermark}
                      </span>
                      <h3 className="relative font-display font-bold text-lg text-slate-900 group-hover:text-[#0F2D5E] transition-colors leading-snug pt-3">
                        {step.cleanTitle}
                      </h3>
                    </div>

                    <p className="font-inter text-xs text-slate-500 leading-relaxed min-h-[48px]">
                      {step.description}
                    </p>

                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50/80 border border-blue-100 text-[#0F2D5E] text-[11px] font-semibold self-start">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0F2D5E] shrink-0"></span>
                      <span className="leading-tight">{step.standard}</span>
                    </div>
                  </div>
                ) : (
                  <div className="h-[60px]" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* MOBILE TIMELINE: Hexagonal Badges & Watermarks for Small Screens */}
      <div className="flex flex-col gap-6 md:hidden">
        {steps.map((step) => {
          const isSelected = activeStep === step.id;

          return (
            <div
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              className={`p-5 rounded-2xl border transition-all flex items-start gap-4 cursor-pointer ${
                isSelected
                  ? "bg-white border-[#0F2D5E] shadow-md"
                  : "bg-white/80 border-slate-200 shadow-xs"
              }`}
            >
              <div className="relative w-[56px] h-[56px] shrink-0 flex items-center justify-center">
                <svg
                  width="56"
                  height="56"
                  viewBox="0 0 68 68"
                  className="overflow-visible"
                >
                  <polygon
                    points="34,4 62,20 62,48 34,64 6,48 6,20"
                    fill="white"
                    stroke={isSelected ? "#0F2D5E" : "#E2E8F0"}
                    strokeWidth={isSelected ? "2" : "1"}
                    style={{
                      filter: "drop-shadow(0 8px 14px rgba(15, 45, 94, 0.30))"
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  {step.icon}
                </div>
              </div>

              <div className="flex flex-col gap-1.5 pt-0.5 relative">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-display font-bold text-[#0F2D5E] uppercase tracking-wider">
                    {step.badge}
                  </span>
                  <span className="font-display font-black text-2xl text-slate-200 select-none">
                    0{step.watermark}
                  </span>
                </div>
                <h3 className="font-display text-base font-bold text-slate-900 leading-snug">
                  {step.cleanTitle}
                </h3>
                <p className="font-inter text-xs text-slate-500 leading-relaxed">
                  {step.description}
                </p>
                <div className="inline-flex items-center gap-1.5 pt-1 text-[11px] font-semibold text-[#0F2D5E]">
                  <CheckCircle size={14} weight="fill" className="text-[#0F2D5E] shrink-0" />
                  <span>{step.deliverable}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
