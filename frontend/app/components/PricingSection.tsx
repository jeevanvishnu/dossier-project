"use client";

import { useState } from "react";
import { CheckCircle, CaretRight } from "@phosphor-icons/react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export type CurrencyCode = "KZT" | "USD" | "EUR";

const currencyOptions: { code: CurrencyCode; symbol: string }[] = [
  { code: "KZT", symbol: "₸" },
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "€" },
];

export function PricingSection() {
  const tP = useTranslations("pricing");

  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");
  const [currency, setCurrency] = useState<CurrencyCode>("USD");

  const standardTiers = [
    {
      id: "S",
      name: "Tariff S",
      heading: tP("tier1Title"),
      description: tP("tier1Desc"),
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
      {/* Section Header: Styled cleanly like "Affordable plans for every budget" */}
      <div className="flex flex-col items-center text-center max-w-4xl lg:max-w-5xl mx-auto gap-2.5">
        <h2 className="font-display font-bold text-2xl sm:text-3xl lg:text-[2.25rem] text-slate-900 tracking-tight leading-tight md:whitespace-nowrap">
          {tP("title")}
        </h2>
        <p className="font-inter text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl sm:max-w-2xl mx-auto text-balance">
          {tP("desc")}
        </p>

        {/* Currency controls */}
        <div className="flex items-center justify-center mt-2">
          <div className="inline-flex items-center p-1 bg-slate-100 border border-slate-200/90 rounded-xl shadow-inner select-none">
            {currencyOptions.map((opt) => {
              const isSelected = currency === opt.code;
              return (
                <button
                  key={opt.code}
                  type="button"
                  onClick={() => setCurrency(opt.code)}
                  className={`px-3 py-1.5 text-xs font-display font-bold rounded-lg transition-all duration-200 flex items-center gap-1 cursor-pointer ${isSelected
                      ? "bg-white text-slate-900 border border-slate-200/80 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
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

      {/* Cards Grid: Matching the reference image style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch pt-2">
        {standardTiers.map((tier) => {
          const isPopular = tier.badge === "Most Popular";
          const priceObj = tier.prices[currency];
          const price = billingCycle === "monthly" ? priceObj.monthly : priceObj.annual;

          return (
            <div
              key={tier.id}
              className={`relative rounded-2xl p-5 sm:p-6 flex flex-col justify-between transition-all duration-200 ${isPopular
                  ? "bg-[#0F2D5E] text-white border-2 border-[#0F2D5E] shadow-xl scale-[1.02] z-10"
                  : "bg-white text-slate-900 border border-slate-200/90 hover:border-slate-300 shadow-xs hover:shadow-md"
                }`}
            >
              <div>
                {/* Header: Plan Name on Left, Monthly / Annual Toggle on Right */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`font-display text-base sm:text-lg font-bold tracking-tight whitespace-nowrap ${isPopular ? "text-white" : "text-slate-900"
                      }`}
                  >
                    {tier.name}
                  </span>

                  {/* Monthly / Annual Toggle on Card */}
                  <div
                    className={`inline-flex items-center p-0.5 rounded-lg text-[10px] font-display font-semibold select-none shrink-0 ${isPopular
                        ? "bg-white/10 border border-white/15"
                        : "bg-slate-100 border border-slate-200/80"
                      }`}
                  >
                    <button
                      type="button"
                      onClick={() => setBillingCycle("monthly")}
                      className={`px-2 py-0.5 rounded-[5px] transition-all cursor-pointer ${billingCycle === "monthly"
                          ? isPopular
                            ? "bg-white text-[#0F2D5E] font-bold shadow-xs"
                            : "bg-white text-slate-900 font-bold shadow-xs border border-slate-200/60"
                          : isPopular
                            ? "text-slate-300 hover:text-white"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                    >
                      {tP("monthly")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setBillingCycle("annual")}
                      className={`px-2 py-0.5 rounded-[5px] transition-all cursor-pointer ${billingCycle === "annual"
                          ? isPopular
                            ? "bg-white text-[#0F2D5E] font-bold shadow-xs"
                            : "bg-white text-slate-900 font-bold shadow-xs border border-slate-200/60"
                          : isPopular
                            ? "text-slate-300 hover:text-white"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                    >
                      {tP("annual")}
                    </button>
                  </div>
                </div>

                {/* Price with inline period: reduced font size */}
                <div className="flex items-baseline gap-1.5 my-2.5">
                  <span
                    className={`font-display text-2xl sm:text-3xl font-extrabold tracking-tight ${isPopular ? "text-white" : "text-slate-900"
                      }`}
                  >
                    {price}
                  </span>
                  <span
                    className={`text-xs font-medium ${isPopular ? "text-slate-300" : "text-slate-500"
                      }`}
                  >
                    {tP("tier1Period")}
                  </span>
                </div>

                {/* Subtitle / Description */}
                <p
                  className={`font-inter text-xs leading-relaxed mb-4 min-h-[34px] ${isPopular ? "text-slate-300" : "text-slate-500"
                    }`}
                >
                  {tier.description}
                </p>

                {/* Explicit "Features:" label */}
                <p
                  className={`font-display font-bold text-[10px] uppercase tracking-wider mb-2.5 ${isPopular ? "text-white" : "text-slate-900"
                    }`}
                >
                  Features:
                </p>

                {/* Checklist with circular filled icons */}
                <div className="space-y-2 mb-6">
                  {tier.features.map((feat, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start gap-2 text-xs font-inter ${isPopular ? "text-slate-200" : "text-slate-600"
                        }`}
                    >
                      <CheckCircle
                        size={15}
                        className={`shrink-0 mt-0.5 ${isPopular ? "text-white" : "text-slate-900"
                          }`}
                        weight="fill"
                      />
                      <span className="leading-snug">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom CTA Button */}
              <div className="pt-2">
                <Link
                  href="#contact"
                  className={`w-full rounded-xl py-2.5 text-xs font-display font-bold flex items-center justify-center gap-1.5 transition-all text-center ${isPopular
                      ? "bg-white text-[#0F2D5E] hover:bg-slate-100 shadow-md"
                      : "bg-[#0F2D5E] text-white hover:bg-[#16386E] shadow-xs hover:shadow-sm"
                    }`}
                >
                  {tP("selectPlan")}
                  <CaretRight size={13} weight="bold" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
