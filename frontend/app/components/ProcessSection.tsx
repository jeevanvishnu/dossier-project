"use client";

import React, { useState } from "react";
import {
  UserPlus,
  Receipt,
  CloudArrowUp,
  ChartLineUp,
  CheckCircle,
  ShieldCheck,
  FileCode,
  ArrowRight,
  Headset,
  Sparkle
} from "@phosphor-icons/react";

export function ProcessSection() {
  const [activeStep, setActiveStep] = useState<number>(1);

  const steps = [
    {
      id: 1,
      badge: "STEP 01",
      title: "Registration & Account Setup",
      description:
        "Sign up on the platform and configure your company data, user roles, and security credentials inside the account settings.",
      icon: <UserPlus size={26} className="text-accent" />,
      microUi: {
        tag: "Security & Credentials",
        accent: "from-sky-500/20 to-blue-500/10",
        items: [
          { label: "Company Profile", status: "Verified", icon: <ShieldCheck size={14} className="text-emerald-400" /> },
          { label: "Role-Based Access", status: "Admin / Manager", icon: <CheckCircle size={14} className="text-accent" /> },
          { label: "2FA & Encryption", status: "Active (256-bit)", icon: <Sparkle size={14} className="text-amber-400" /> }
        ]
      }
    },
    {
      id: 2,
      badge: "STEP 02",
      title: "Choose a Tariff Plan",
      description:
        "Select a subscription tariff (such as standard monthly tiers or the unlimited OWN plan) that matches your document volume and lease duration.",
      icon: <Receipt size={26} className="text-accent" />,
      microUi: {
        tag: "Tariff Selector",
        accent: "from-indigo-500/20 to-sky-500/10",
        plans: [
          { name: "Monthly Tiers", desc: "Volume based", active: false },
          { name: "OWN Unlimited", desc: "Full ownership", active: true }
        ]
      }
    },
    {
      id: 3,
      badge: "STEP 03",
      title: "Create Projects & Upload Dossiers",
      description:
        "Build your submission workspace by filling out project metadata and uploading the required regulatory documents organized by sequence categories.",
      icon: <CloudArrowUp size={26} className="text-accent" />,
      microUi: {
        tag: "Workspace & Dossiers",
        accent: "from-blue-500/20 to-teal-500/10",
        workspace: {
          sequence: "eCTD Sequence 0000",
          category: "Module 1-5 Uploaded",
          filesCount: "14 Documents Ready",
          icon: <FileCode size={16} className="text-accent" />
        }
      }
    },
    {
      id: 4,
      badge: "STEP 04",
      title: "Track & Submit",
      description:
        "Monitor real-time status updates, review XML formation history, and successfully process your regulatory applications with 24/7 support at your side.",
      icon: <ChartLineUp size={26} className="text-accent" />,
      microUi: {
        tag: "XML Tracking & Support",
        accent: "from-emerald-500/20 to-sky-500/10",
        tracker: {
          xmlStatus: "XML Validated 100%",
          history: "Audit Log Recorded",
          support: "24/7 Specialist Online",
          icon: <Headset size={16} className="text-emerald-400" />
        }
      }
    }
  ];

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-10 lg:gap-14">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto flex flex-col items-center gap-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold tracking-wider uppercase">
          <Sparkle size={14} className="animate-pulse" />
          <span>Our Process</span>
        </div>
        
        <h2 className="font-lexend text-3xl sm:text-4xl lg:text-[2.6rem] font-bold text-primary tracking-tight leading-tight">
          How Our Process Works
        </h2>
        
        <p className="text-secondary text-base sm:text-lg leading-relaxed mt-1">
          Getting started on the portal is structured into four simple, efficient steps designed to bring transparency to your regulatory workflow:
        </p>
      </div>

      {/* Connected Interactive Stepper Navigation (Desktop & Tablet) */}
      <div className="relative hidden md:block">
        {/* Background Connecting Line - Aligned perfectly with circle centers (top-6 = 24px) */}
        <div className="absolute top-6 left-[12.5%] right-[12.5%] -translate-y-1/2 h-[2px] bg-border-strong z-0">
          <div
            className="h-full bg-gradient-to-r from-accent via-sky-400 to-emerald-400 transition-all duration-500 ease-out"
            style={{ width: `${((activeStep - 1) / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {/* Stepper Buttons */}
        <div className="grid grid-cols-4 relative z-10">
          {steps.map((step) => {
            const isActive = activeStep === step.id;
            const isCompleted = activeStep > step.id;

            return (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                className="flex flex-col items-center group focus:outline-none cursor-pointer"
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-lexend font-bold text-base transition-all duration-300 shadow-md ${
                    isActive
                      ? "bg-accent text-[#0D1117] ring-4 ring-accent/30 scale-110"
                      : isCompleted
                      ? "bg-surface-raised border border-accent text-accent"
                      : "bg-surface border border-border text-secondary group-hover:border-accent/50 group-hover:text-primary"
                  }`}
                >
                  {isCompleted ? <CheckCircle size={22} weight="fill" /> : `0${step.id}`}
                </div>
                <span
                  className={`mt-3 text-xs font-semibold tracking-wide transition-colors ${
                    isActive ? "text-accent" : "text-secondary group-hover:text-primary"
                  }`}
                >
                  {step.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Process Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((step) => {
          const isActive = activeStep === step.id;

          return (
            <div
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              className={`group relative flex flex-col justify-between rounded-2xl p-6 transition-all duration-300 cursor-pointer ${
                isActive
                  ? "bg-surface border-2 border-accent shadow-lg shadow-accent/10 translate-y-[-2px]"
                  : "bg-surface/80 hover:bg-surface border border-border/70 hover:border-accent/40 shadow-sm"
              }`}
            >
              {/* Card Header Top */}
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span
                    className={`text-xs font-bold tracking-wider px-2.5 py-1 rounded-md transition-colors ${
                      isActive
                        ? "bg-accent text-[#0D1117]"
                        : "bg-surface-raised border border-border/80 text-accent"
                    }`}
                  >
                    {step.badge}
                  </span>
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                      isActive
                        ? "bg-accent/20 border border-accent/40"
                        : "bg-surface-raised border border-border/60 group-hover:border-accent/30"
                    }`}
                  >
                    {step.icon}
                  </div>
                </div>

                {/* Title & Description */}
                <h3 className="font-lexend text-xl font-bold text-primary mb-3 leading-snug group-hover:text-accent transition-colors">
                  {step.title}
                </h3>
                
                <p className="text-secondary text-sm leading-relaxed mb-6">
                  {step.description}
                </p>
              </div>

              {/* Micro UI Preview Box */}
              <div className="mt-auto pt-4 border-t border-border/50">
                <div className={`p-3.5 rounded-xl bg-gradient-to-br ${step.microUi.accent} border border-border/60 flex flex-col gap-2.5`}>
                  <div className="flex items-center justify-between text-[11px] font-semibold text-accent tracking-wide uppercase">
                    <span>{step.microUi.tag}</span>
                    <ArrowRight size={12} className="opacity-70 group-hover:translate-x-1 transition-transform" />
                  </div>

                  {/* Micro UI Specific Content */}
                  {step.id === 1 && step.microUi.items && (
                    <div className="flex flex-col gap-1.5 pt-1">
                      {step.microUi.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs bg-surface/90 px-2.5 py-1.5 rounded-lg border border-border/40">
                          <span className="flex items-center gap-1.5 text-primary font-medium">
                            {item.icon}
                            {item.label}
                          </span>
                          <span className="text-[10px] font-semibold text-secondary">{item.status}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {step.id === 2 && step.microUi.plans && (
                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      {step.microUi.plans.map((plan, idx) => (
                        <div
                          key={idx}
                          className={`p-2 rounded-lg text-center border transition-all ${
                            plan.active
                              ? "bg-accent/20 border-accent/60 text-primary"
                              : "bg-surface/80 border-border/40 text-secondary"
                          }`}
                        >
                          <p className="text-xs font-bold leading-tight">{plan.name}</p>
                          <p className="text-[10px] text-secondary mt-0.5">{plan.desc}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {step.id === 3 && step.microUi.workspace && (
                    <div className="flex flex-col gap-1.5 pt-1">
                      <div className="bg-surface/90 p-2.5 rounded-lg border border-border/40 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {step.microUi.workspace.icon}
                          <span className="text-xs font-medium text-primary">
                            {step.microUi.workspace.sequence}
                          </span>
                        </div>
                        <span className="text-[10px] bg-accent/15 text-accent px-2 py-0.5 rounded font-semibold">
                          eCTD
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px] text-secondary px-1">
                        <span>{step.microUi.workspace.category}</span>
                        <span className="text-emerald-400 font-medium">{step.microUi.workspace.filesCount}</span>
                      </div>
                    </div>
                  )}

                  {step.id === 4 && step.microUi.tracker && (
                    <div className="flex flex-col gap-1.5 pt-1">
                      <div className="bg-surface/90 p-2 rounded-lg border border-border/40 flex items-center justify-between">
                        <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle size={14} weight="fill" />
                          {step.microUi.tracker.xmlStatus}
                        </span>
                        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-secondary px-1">
                        <span>{step.microUi.tracker.history}</span>
                        <span className="flex items-center gap-1 text-accent font-medium">
                          {step.microUi.tracker.icon}
                          24/7 Live
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
