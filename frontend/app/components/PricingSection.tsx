"use client";

import { useState } from "react";
import { CheckCircle, ShieldCheck, Lightning, Cube, Stack, CaretRight, Headset, Star } from "@phosphor-icons/react";
import Link from "next/link";

export type CurrencyCode = "KZT" | "USD" | "EUR";

interface PriceConfig {
  monthly: string;
  annual: string;
}

interface TierDetail {
  id: "S" | "M" | "L" | "XL";
  name: string;
  subTag: string;
  heading: string;
  description: string;
  keyDetail: string;
  dossierLimit: string;
  storage: string;
  prices: Record<CurrencyCode, PriceConfig>;
  badge?: string;
  users: string;
  features: string[];
}

const currencyOptions: { code: CurrencyCode; symbol: string }[] = [
  { code: "KZT", symbol: "₸" },
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "€" },
];

const standardTiers: TierDetail[] = [
  {
    id: "S",
    name: "Tariff S",
    subTag: "Standard Tiers (Tariff S)",
    heading: "Tiered Storage Plans",
    description: "Ideal for standard portfolios with predictable document volumes.",
    keyDetail: "Billed monthly with structured limits to fit your exact operational scope.",
    dossierLimit: "Up to 5 Dossiers",
    storage: "25 GB Storage",
    prices: {
      USD: { monthly: "$290", annual: "$230" },
      EUR: { monthly: "€270", annual: "€210" },
      KZT: { monthly: "₸145,000", annual: "₸115,000" },
    },
    users: "Up to 3 Users",
    features: [
      "Up to 5 active dossiers",
      "25 GB encrypted storage",
      "eCTD & KazNCA validation",
      "Standard sequence tracking",
      "24/7 web portal access"
    ]
  },
  {
    id: "M",
    name: "Tariff M",
    subTag: "Standard Tiers (Tariff M)",
    heading: "Tiered Storage Plans",
    description: "Ideal for standard portfolios with predictable document volumes.",
    keyDetail: "Billed monthly with structured limits to fit your exact operational scope.",
    dossierLimit: "Up to 15 Dossiers",
    storage: "100 GB Storage",
    prices: {
      USD: { monthly: "$590", annual: "$470" },
      EUR: { monthly: "€540", annual: "€430" },
      KZT: { monthly: "₸295,000", annual: "₸235,000" },
    },
    badge: "Most Popular",
    users: "Up to 10 Users",
    features: [
      "Up to 15 active dossiers",
      "100 GB encrypted storage",
      "eCTD & KazNCA validation",
      "Automated lifecycle tracking",
      "Multi-user permission roles",
      "24/7 web portal access"
    ]
  },
  {
    id: "L",
    name: "Tariff L",
    subTag: "Standard Tiers (Tariff L)",
    heading: "Tiered Storage Plans",
    description: "Ideal for standard portfolios with predictable document volumes.",
    keyDetail: "Billed monthly with structured limits to fit your exact operational scope.",
    dossierLimit: "Up to 40 Dossiers",
    storage: "300 GB Storage",
    prices: {
      USD: { monthly: "$1,190", annual: "$950" },
      EUR: { monthly: "€1,090", annual: "€870" },
      KZT: { monthly: "₸595,000", annual: "₸475,000" },
    },
    users: "Up to 25 Users",
    features: [
      "Up to 40 active dossiers",
      "300 GB encrypted storage",
      "Full eCTD & KazNCA validation",
      "Advanced sequence tracking",
      "Encrypted audit log export",
      "Priority portal support"
    ]
  },
  {
    id: "XL",
    name: "Tariff XL",
    subTag: "Standard Tiers (Tariff XL)",
    heading: "Tiered Storage Plans",
    description: "Ideal for standard portfolios with predictable document volumes.",
    keyDetail: "Billed monthly with structured limits to fit your exact operational scope.",
    dossierLimit: "Up to 100 Dossiers",
    storage: "1 TB Storage",
    prices: {
      USD: { monthly: "$2,290", annual: "$1,830" },
      EUR: { monthly: "€2,100", annual: "€1,680" },
      KZT: { monthly: "₸1,145,000", annual: "₸915,000" },
    },
    users: "Unlimited Users",
    features: [
      "Up to 100 active dossiers",
      "1 TB high-speed storage",
      "Full eCTD & KazNCA validation",
      "Multi-region sequence control",
      "Dedicated audit trail export",
      "24/7 priority SLA support"
    ]
  }
];

export function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");
  const [currency, setCurrency] = useState<CurrencyCode>("USD");

  return (
    <div className="flex flex-col gap-10 md:gap-14">
      {/* Section Header */}
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto gap-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/30 text-accent text-xs font-semibold tracking-wider uppercase">
          <Stack size={14} weight="bold" />
          Transparent Investment
        </div>
        <h2 className="font-lexend text-3xl sm:text-4xl lg:text-[2.6rem] font-bold text-primary tracking-tight leading-tight">
          Our Tariffs &amp; Pricing Plans
        </h2>
        <p className="text-secondary text-base sm:text-lg leading-relaxed max-w-2xl">
          Flexible plans designed to accommodate any volume of pharmaceutical registration dossiers.
        </p>

        {/* Toggles Container: Billing Cycle & Currency Switcher */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-3">
          {/* Billing Cycle Toggle */}
          <div className="flex items-center gap-3 p-1.5 bg-surface-raised border border-border/80 rounded-xl">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${billingCycle === "monthly"
                  ? "bg-accent text-[#0D1117] shadow-sm"
                  : "text-secondary hover:text-primary"
                }`}
            >
              Billed Monthly
            </button>
            <button
              onClick={() => setBillingCycle("annual")}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 ${billingCycle === "annual"
                  ? "bg-accent text-[#0D1117] shadow-sm"
                  : "text-secondary hover:text-primary"
                }`}
            >
              Annual Billing
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Save 20%
              </span>
            </button>
          </div>

          {/* Currency Switcher (Radio Controls: ₸, $, €) */}
          <div className="flex items-center gap-5 px-4 py-2.5 bg-surface-raised border border-border/80 rounded-xl select-none">
            {currencyOptions.map((opt) => {
              const isSelected = currency === opt.code;
              return (
                <button
                  key={opt.code}
                  type="button"
                  onClick={() => setCurrency(opt.code)}
                  className="flex items-center gap-2 group cursor-pointer focus:outline-none transition-all"
                >
                  <span
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${isSelected
                        ? "border-accent bg-transparent shadow-[0_0_8px_rgba(56,189,248,0.4)]"
                        : "border-secondary/50 group-hover:border-secondary"
                      }`}
                  >
                    {isSelected && <span className="w-2 h-2 rounded-full bg-accent" />}
                  </span>
                  <span
                    className={`font-lexend font-bold text-sm transition-colors ${isSelected ? "text-accent font-black" : "text-secondary group-hover:text-primary"
                      }`}
                  >
                    {opt.symbol}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid Card Pricing Model (4-Column Layout) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {standardTiers.map((tier) => {
          const isPopular = tier.badge === "Most Popular";
          const priceObj = tier.prices[currency];
          const price = billingCycle === "monthly" ? priceObj.monthly : priceObj.annual;

          return (
            <div
              key={tier.id}
              className={`relative bg-surface rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 ${isPopular
                  ? "border-2 border-accent shadow-xl shadow-accent/10 bg-gradient-to-b from-surface to-accent-light/20 scale-[1.02] z-10"
                  : "border border-border/80 hover:border-accent/50 hover:shadow-lg"
                }`}
            >
              {/* Popular Badge */}
              {isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-accent text-[#0D1117] text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                  <Star size={12} weight="fill" />
                  Most Popular
                </div>
              )}

              <div>
                {/* Sub-tag */}
                <div className="mb-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-accent/10 border border-accent/20 text-accent text-[11px] font-bold uppercase tracking-wider">
                    <Cube size={12} weight="fill" />
                    {tier.name}
                  </span>
                </div>

                {/* Card Title & Description */}
                <h3 className="font-lexend text-xl font-bold text-primary mb-1">
                  {tier.heading}
                </h3>
                <p className="text-secondary text-xs leading-relaxed mb-4 min-h-[36px]">
                  {tier.description}
                </p>

                {/* Price Display */}
                <div className="mb-4 pb-4 border-b border-border/60">
                  <span className="text-xs text-muted font-medium block uppercase tracking-wider mb-1">
                    Estimated Plan
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-lexend text-3xl font-extrabold text-primary">
                      {price}
                    </span>
                    <span className="text-xs text-secondary font-medium">/ month</span>
                  </div>
                  <div className="mt-2 text-xs font-semibold text-accent flex items-center justify-between bg-surface-raised/70 p-2 rounded-lg border border-border/40">
                    <span>{tier.dossierLimit}</span>
                    <span className="text-secondary font-normal">{tier.storage}</span>
                  </div>
                </div>

                {/* Key Detail Box */}
                <div className="p-3 rounded-xl bg-accent-light/40 border border-accent/20 mb-5 text-[11px] text-secondary leading-normal">
                  <strong className="text-primary font-semibold block mb-0.5">Key Detail:</strong>
                  {tier.keyDetail}
                </div>

                {/* Features List */}
                <div className="space-y-2.5 mb-6">
                  {tier.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-secondary">
                      <CheckCircle size={15} className="text-accent shrink-0 mt-0.5" weight="fill" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Action Button */}
              <div className="pt-2">
                <Link
                  href="#contact"
                  className={`btn w-full rounded-xl py-3 h-auto text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${isPopular
                      ? "btn-primary bg-accent text-[#0D1117] hover:bg-accent-hover border-none shadow-md"
                      : "btn-outline text-accent border-accent/60 hover:bg-accent-light hover:border-accent"
                    }`}
                >
                  Select {tier.name}
                  <CaretRight size={14} weight="bold" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Enterprise & On-Demand Full-Width Card */}
      <div className="bg-surface border border-border/80 hover:border-accent/40 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col gap-2 max-w-2xl text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-surface-raised border border-border text-secondary text-xs font-bold uppercase tracking-wide self-center md:self-start">
            <Lightning size={14} className="text-amber-400" weight="fill" />
            Enterprise &amp; On-Demand
          </div>
          <h3 className="font-lexend text-2xl font-bold text-primary">
            Need On-Demand Dossiers?
          </h3>
          <p className="text-secondary text-sm leading-relaxed">
            We provide single-dossier tariffs for project-based submissions or dedicated private instances for multinational pharmaceutical corporations.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full md:w-auto">
          <Link
            href="#contact"
            className="btn btn-outline rounded-xl px-6 py-3 h-auto text-accent border-accent hover:bg-accent-light hover:border-accent font-semibold text-sm w-full sm:w-auto text-center"
          >
            <Headset size={18} weight="duotone" className="inline mr-1.5" />
            Request Custom Quote
          </Link>
        </div>
      </div>

    </div>
  );
}

