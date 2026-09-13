"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { Globe, Check } from "@phosphor-icons/react";
import { useState, useRef, useEffect, useTransition } from "react";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: "en", name: "English", short: "EN" },
    { code: "ru", name: "Russian", short: "RU" },
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
        className={`flex items-center gap-1.5 rounded-lg border border-border bg-bg hover:bg-surface-raised transition-colors text-xs font-semibold text-primary px-2.5 py-1.5 shadow-xs cursor-pointer disabled:opacity-60 ${
          compact ? "py-1 px-2" : ""
        }`}
        aria-label="Select language"
      >
        <Globe size={16} className="text-accent shrink-0" />
        <span>{compact ? currentLang.short : currentLang.name}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 rounded-xl border border-border bg-surface shadow-2xl z-50 p-1 font-sans text-xs">
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
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left font-medium transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-accent/15 text-accent font-bold"
                    : "text-secondary hover:text-primary hover:bg-surface-raised"
                }`}
              >
                <span>{lang.name}</span>
                {isSelected && <Check size={14} className="text-accent" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
