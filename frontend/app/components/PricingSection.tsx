"use client";

import { useState } from "react";
import { CheckCircle, Lightning, Cube, CaretRight, Headset, Star } from "@phosphor-icons/react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export type CurrencyCode = "KZT" | "USD" | "EUR";

interface PriceConfig {
  monthly: string;
  annual: string;
}

const currencyOptions: { code: CurrencyCode; symbol: string }[] = [
  { code: "KZT", symbol: "₸" },
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "€" },
];

export function PricingSection() {
  const tP = useTranslations("pricing");
  const tC = useTranslations("common");

  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");
  const [currency, setCurrency] = useState<CurrencyCode>("USD");

  const standardTiers = [
    {
      id: "S",
      name: "Tariff S",
      heading: tP("tier1Title"),
      description: tP("tier1Desc"),
      keyDetail: tP("tier1Desc"),
      dossierLimit: tP("tier1Feature1"),
      storage: tP("tier1Feature2"),
      prices: {
        USD: { monthly: "$290", annual: "$230" },
        EUR: { monthly: "€270", annual: "€210" },
        KZT: { monthly: "₸145,000", annual: "₸115,000" },
      },
      badge: undefined,
      features: [
        tP("tier1Feature1"),
        tP("tier1Feature2"),
        tP("tier1Feature3"),
        tP("tier1Feature4"),
      ]
    },
    {
      id: "M",
      name: "Tariff M",
      heading: tP("tier2Title"),
      description: tP("tier2Desc"),
      keyDetail: tP("tier2Desc"),
      dossierLimit: tP("tier2Feature1"),
      storage: tP("tier2Feature2"),
      prices: {
        USD: { monthly: "$590", annual: "$470" },
        EUR: { monthly: "€540", annual: "€430" },
        KZT: { monthly: "₸295,000", annual: "₸235,000" },
      },
      badge: "Most Popular",
      features: [
        tP("tier2Feature1"),
        tP("tier2Feature2"),
        tP("tier2Feature3"),
        tP("tier2Feature4"),
      ]
    },
    {
      id: "L",
      name: "Tariff L",
      heading: tP("tier3Title"),
      description: tP("tier3Desc"),
      keyDetail: tP("tier3Desc"),
      dossierLimit: tP("tier3Feature1"),
      storage: tP("tier3Feature2"),
      prices: {
        USD: { monthly: "$1,190", annual: "$950" },
        EUR: { monthly: "€1,090", annual: "€870" },
        KZT: { monthly: "₸595,000", annual: "₸475,000" },
      },
      badge: undefined,
      features: [
        tP("tier3Feature1"),
        tP("tier3Feature2"),
        tP("tier3Feature3"),
        tP("tier3Feature4"),
      ]
    },
    {
      id: "XL",
      name: "Tariff XL",
      heading: tP("tier3Title") + " XL",
      description: tP("tier3Desc"),
      keyDetail: tP("tier3Desc"),
      dossierLimit: tP("tier3Feature1"),
      storage: tP("tier3Feature2"),
      prices: {
        USD: { monthly: "$2,290", annual: "$1,830" },
        EUR: { monthly: "€2,100", annual: "€1,680" },
        KZT: { monthly: "₸1,145,000", annual: "₸915,000" },
      },
      badge: undefined,
      features: [
        tP("tier3Feature1"),
        tP("tier3Feature2"),
        tP("tier3Feature3"),
        tP("tier3Feature4"),
      ]
    }
  ];

  return (
    <div className="flex flex-col gap-10 md:gap-14">
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto gap-3">
        <span className="text-xs font-semibold tracking-[0.12em] text-accent uppercase">
          {tP("tag")}
        </span>
        <h2 className="font-lexend text-3xl sm:text-4xl lg:text-[2.6rem] font-bold text-primary tracking-tight leading-tight">
          {tP("title")}
        </h2>
        <p className="text-secondary text-base sm:text-lg leading-relaxed max-w-2xl">
          {tP("desc")}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 mt-2">
          <div className="inline-flex items-center p-1 bg-surface-raised border border-border/80 rounded-xl shadow-inner">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-3 sm:px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                billingCycle === "monthly"
                  ? "bg-accent text-white shadow-sm shadow-accent/25"
                  : "text-secondary hover:text-primary"
              }`}
            >
              {tP("billingMonthly")}
            </button>
            <button
              onClick={() => setBillingCycle("annual")}
              className={`px-3 sm:px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                billingCycle === "annual"
                  ? "bg-accent text-white shadow-sm shadow-accent/25"
                  : "text-secondary hover:text-primary"
              }`}
            >
              {tP("billingAnnual")}
            </button>
          </div>

          <div className="inline-flex items-center p-1 bg-surface-raised border border-border/80 rounded-xl shadow-inner select-none">
            {currencyOptions.map((opt) => {
              const isSelected = currency === opt.code;
              return (
                <button
                  key={opt.code}
                  type="button"
                  onClick={() => setCurrency(opt.code)}
                  className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 flex items-center gap-1 cursor-pointer ${
                    isSelected
                      ? "bg-accent/20 text-accent border border-accent/40 shadow-sm"
                      : "text-secondary hover:text-primary"
                  }`}
                >
                  <span className="font-extrabold text-xs">{opt.symbol}</span>
                  <span className="text-[11px] font-semibold tracking-wide">{opt.code}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {standardTiers.map((tier) => {
          const isPopular = tier.badge === "Most Popular";
          const priceObj = tier.prices[currency];
          const price = billingCycle === "monthly" ? priceObj.monthly : priceObj.annual;

          return (
            <div
              key={tier.id}
              className={`relative bg-surface rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 ${
                isPopular
                  ? "border-2 border-accent shadow-xl shadow-accent/10 bg-gradient-to-b from-surface to-accent-light/20 scale-[1.02] z-10"
                  : "border border-border/80 hover:border-accent/50 hover:shadow-lg"
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-accent text-white text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                  <Star size={12} weight="fill" />
                  {tP("popularTag")}
                </div>
              )}

              <div>
                <div className="mb-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-accent/10 border border-accent/20 text-accent text-[11px] font-bold uppercase tracking-wider">
                    <Cube size={12} weight="fill" />
                    {tier.name}
                  </span>
                </div>

                <h3 className="font-lexend text-xl font-bold text-primary mb-1">
                  {tier.heading}
                </h3>
                <p className="text-secondary text-xs leading-relaxed mb-4 min-h-[36px]">
                  {tier.description}
                </p>

                <div className="mb-4 pb-4 border-b border-border/60">
                  <span className="text-xs text-muted font-medium block uppercase tracking-wider mb-1">
                    {tier.name}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-lexend text-3xl font-extrabold text-primary">
                      {price}
                    </span>
                    <span className="text-xs text-secondary font-medium">{tP("tier1Period")}</span>
                  </div>
                </div>

                <div className="space-y-2.5 mb-6">
                  {tier.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-secondary">
                      <CheckCircle size={15} className="text-accent shrink-0 mt-0.5" weight="fill" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="#contact"
                  className={`btn w-full rounded-xl py-3 h-auto text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    isPopular
                      ? "btn-primary bg-accent text-white hover:bg-accent-hover border-none shadow-md"
                      : "btn-outline text-accent border-accent/60 hover:bg-accent-light hover:border-accent"
                  }`}
                >
                  {tP("selectPlan")}
                  <CaretRight size={14} weight="bold" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-surface border border-border/80 hover:border-accent/40 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col gap-2 max-w-2xl text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-surface-raised border border-border text-secondary text-xs font-bold uppercase tracking-wide self-center md:self-start">
            <Lightning size={14} className="text-amber-500" weight="fill" />
            {tP("tier3Title")}
          </div>
          <h3 className="font-lexend text-2xl font-bold text-primary">
            {tP("tier3Title")}
          </h3>
          <p className="text-secondary text-sm leading-relaxed">
            {tP("tier3Desc")}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full md:w-auto">
          <Link
            href="#contact"
            className="btn btn-outline rounded-xl px-6 py-3 h-auto text-accent border-accent hover:bg-accent-light hover:border-accent font-semibold text-sm w-full sm:w-auto text-center"
          >
            <Headset size={18} weight="duotone" className="inline mr-1.5" />
            {tP("tier3Period")}
          </Link>
        </div>
      </div>

    </div>
  );
}
