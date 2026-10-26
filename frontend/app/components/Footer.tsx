"use client";

import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export function Footer() {
  const tF = useTranslations("footer");
  const tNav = useTranslations("nav");

  return (
    <footer className="bg-[#0A1F3D] text-white border-t border-white/10 py-14 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        <div className="flex flex-col gap-2">
          <Link href="/" className="font-display font-extrabold text-2xl text-white tracking-tight flex items-center justify-center md:justify-start">
            {tNav("brand")}
          </Link>
          <p className="text-slate-400 font-inter text-xs max-w-md leading-relaxed">
            {tF("tagline")}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-inter font-medium">
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
