"use client";

import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export function Footer() {
  const tF = useTranslations("footer");
  const tNav = useTranslations("nav");

  return (
    <footer className="bg-[#0A1F3D] text-white border-t border-white/10 py-5 sm:py-6 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 text-center md:text-left">
        <div className="flex flex-col gap-1">
          <Link href="/" className="font-display font-extrabold text-xl text-white tracking-tight flex items-center justify-center md:justify-start">
            {tNav("brand")}
          </Link>
          <p className="text-slate-400 font-inter text-xs max-w-md leading-relaxed">
            {tF("tagline")}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-400 font-inter font-medium">
          <Link href="#about" className="hover:text-white transition-colors">
            {tNav("about")}
          </Link>
          <Link href="#pricing" className="hover:text-white transition-colors">
            {tNav("pricing")}
          </Link>
          <Link href="#contact" className="hover:text-white transition-colors">
            {tNav("contact")}
          </Link>
          <span className="text-white/20">|</span>
          <span className="text-slate-500">{tF("copyright")}</span>
        </div>
      </div>
    </footer>
  );
}
