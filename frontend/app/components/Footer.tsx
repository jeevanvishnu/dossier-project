"use client";

import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export function Footer() {
  const tF = useTranslations("footer");
  const tNav = useTranslations("nav");

  return (
    <footer className="bg-surface border-t border-border/40 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-[1650px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        <div className="flex flex-col gap-2">
          <Link href="/" className="font-lexend font-bold text-xl text-primary">
            {tNav("brand")}
          </Link>
          <p className="text-secondary text-xs max-w-md leading-relaxed">
            {tF("tagline")}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-secondary font-medium">
          <Link href="#about" className="hover:text-primary transition-colors">
            {tNav("about")}
          </Link>
          <Link href="#pricing" className="hover:text-primary transition-colors">
            {tNav("pricing")}
          </Link>
          <Link href="#contact" className="hover:text-primary transition-colors">
            {tNav("contact")}
          </Link>
          <span className="text-border">|</span>
          <span className="text-muted">{tF("copyright")}</span>
        </div>
      </div>
    </footer>
  );
}
