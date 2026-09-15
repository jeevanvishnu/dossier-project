"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { Globe, Check, CaretDown } from "@phosphor-icons/react";
import { useState, useRef, useEffect, useTransition } from "react";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: "en", label: "EN", name: "English" },
    { code: "ru", label: "RU", name: "Русский" },
  ];

  const handleLanguageChange = (newLocale: string) => {
    if (newLocale === locale) {
      setIsOpen(false);
      return;
    }
    setIsOpen(false);

    startTransition(() => {
      router.replace(pathname || "/", { locale: newLocale });
    });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentLang = languages.find((l) => l.code === locale) || languages[0];

  return (
    <div className="relative inline-block text-left z-50" ref={dropdownRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        disabled={isPending}
        className={`flex items-center gap-1.5 rounded-xl border border-border/80 bg-bg hover:bg-surface-raised transition-all text-xs font-bold text-primary px-3 py-1.5 shadow-xs cursor-pointer disabled:opacity-60 select-none ${
          compact ? "px-2.5 py-1" : ""
        }`}
        aria-label="Select language"
      >
        <Globe size={15} className="text-accent shrink-0" />
        <span className="tracking-wide uppercase text-xs font-bold">{currentLang.label}</span>
        <CaretDown size={12} className={`text-secondary transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-32 rounded-xl border border-border/80 bg-surface shadow-xl z-50 p-1 font-sans text-xs animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md">
          {languages.map((lang) => {
            const isSelected = lang.code === locale;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleLanguageChange(lang.code);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left font-semibold transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-accent/15 text-accent font-bold"
                    : "text-secondary hover:text-primary hover:bg-surface-raised"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs uppercase tracking-wide w-5">{lang.label}</span>
                  <span className="text-[11px] font-medium opacity-80">{lang.name}</span>
                </div>
                {isSelected && <Check size={14} className="text-accent shrink-0" weight="bold" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
