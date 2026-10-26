"use client";

import { useState } from "react";
import { Link, usePathname } from "@/i18n/routing";
import { List, X } from "@phosphor-icons/react";
import { useAuthModal } from "./AuthModalContext";
import { useAuth } from "../context/AuthContext";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useTranslations } from "next-intl";

export function Navbar() {
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { openAuthModal } = useAuthModal();
  const { isAuthenticated, user } = useAuth();
  const pathname = usePathname();

  const navLinks = [
    { name: tNav("home"), href: "/" },
    { name: tNav("about"), href: "#about" },
    { name: tNav("pricing"), href: "#pricing" },
    { name: tNav("contact"), href: "#contact" },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href === "/" || href === "#top" || href === "#hero") {
      if (pathname === "/") {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else if (href.startsWith("#")) {
      if (pathname === "/") {
        e.preventDefault();
        const element = document.querySelector(href);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
  };

  return (
    <header className="sticky top-0 w-full z-50 bg-white/95 backdrop-blur-md shadow-xs border-b border-slate-200/80 transition-colors">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link
          href="/"
          onClick={(e) => handleNavClick(e, "/")}
          className="font-display font-extrabold text-2xl text-[#0F2D5E] tracking-tight flex items-center"
        >
          {tNav("brand")}
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8 ml-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="text-slate-800 hover:text-[#0F2D5E] font-inter font-semibold transition-colors text-sm"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Desktop Controls (Language + Sign In / Dashboard) */}
        <div className="hidden sm:flex items-center ml-auto lg:ml-0 gap-3">
          <LanguageSwitcher />
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="btn rounded-lg px-5 min-h-[38px] h-[38px] text-white bg-[#0F2D5E] hover:bg-[#16386E] border-none font-semibold text-sm shadow-sm flex items-center justify-center transition-all"
            >
              {tNav("dashboard")}
            </Link>
          ) : (
            <button
              onClick={() => openAuthModal("signin")}
              className="btn rounded-lg px-5 min-h-[38px] h-[38px] text-white bg-[#0F2D5E] hover:bg-[#16386E] border-none font-semibold text-sm shadow-sm cursor-pointer transition-all"
            >
              {tCommon("signIn")}
            </button>
          )}
        </div>

        {/* Mobile Controls */}
        <div className="flex items-center gap-2 sm:hidden">
          <LanguageSwitcher compact />
          <button
            className="p-2 text-slate-700 hover:text-[#0F2D5E] cursor-pointer"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <List size={24} />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative ml-auto w-full max-w-xs bg-white h-full shadow-2xl flex flex-col pt-5 pb-6 px-5 border-l border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <span className="font-display font-extrabold text-xl text-[#0F2D5E] tracking-tight">{tNav("brand")}</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-500 hover:text-[#0F2D5E] transition-colors cursor-pointer">
                <X size={24} />
              </button>
            </div>

            <div className="mb-4">
              <LanguageSwitcher />
            </div>

            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-base py-3 text-slate-800 font-inter font-semibold hover:text-[#0F2D5E] transition-colors border-b border-slate-100"
                  onClick={(e) => {
                    handleNavClick(e, link.href);
                    setMobileMenuOpen(false);
                  }}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            <div className="mt-auto pt-4 space-y-4">
              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn w-full rounded-lg min-h-[40px] h-[40px] text-white bg-[#0F2D5E] hover:bg-[#16386E] border-none font-semibold text-sm flex items-center justify-center"
                >
                  {tNav("dashboard")}
                </Link>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal("signin");
                  }}
                  className="btn w-full rounded-lg min-h-[40px] h-[40px] text-white bg-[#0F2D5E] hover:bg-[#16386E] border-none font-semibold text-sm cursor-pointer"
                >
                  {tCommon("signIn")}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
