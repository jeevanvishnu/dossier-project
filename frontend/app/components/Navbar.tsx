"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link, usePathname } from "@/i18n/routing";
import { List, X } from "@phosphor-icons/react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { useAuthModal } from "./AuthModalContext";
import { useAuth } from "../context/AuthContext";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useTranslations } from "next-intl";

export function Navbar() {
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const { openAuthModal } = useAuthModal();
  const { isAuthenticated, user } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Close mobile menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    if (mobileMenuOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuOpen]);

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
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 h-16 flex items-center justify-between">
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
            className="p-2 text-slate-700 hover:text-[#0F2D5E] transition-colors rounded-lg hover:bg-slate-100 active:scale-95 cursor-pointer"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={mobileMenuOpen}
          >
            <List size={24} />
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Portaled directly to document.body to escape header backdrop-filter containing block) */}
      {mounted && typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              key="mobile-nav-portal"
              className="fixed inset-0 z-[100] flex justify-end"
              role="dialog"
              aria-modal="true"
              aria-label={tNav("mainNavigation")}
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 1 }}
            >
              {/* Backdrop overlay */}
              <motion.div
                key="mobile-nav-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: shouldReduceMotion ? 0.15 : 0.25, ease: "easeOut" }}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={() => setMobileMenuOpen(false)}
                aria-hidden="true"
              />

              {/* Slide-over solid white panel */}
              <motion.div
                key="mobile-nav-panel"
                initial={shouldReduceMotion ? { opacity: 0 } : { x: "100%" }}
                animate={shouldReduceMotion ? { opacity: 1 } : { x: 0 }}
                exit={shouldReduceMotion ? { opacity: 0 } : { x: "100%" }}
                transition={
                  shouldReduceMotion
                    ? { duration: 0.2 }
                    : { type: "spring", damping: 28, stiffness: 280, mass: 0.8 }
                }
                className="relative w-full max-w-xs sm:max-w-sm bg-white text-slate-800 h-full min-h-[100dvh] shadow-2xl flex flex-col pt-5 pb-8 px-6 border-l border-slate-200 z-10 overflow-y-auto"
                style={{ backgroundColor: "#ffffff" }}
              >
                {/* Header: Brand + Close button */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                  <span className="font-display font-extrabold text-2xl text-[#0F2D5E] tracking-tight">
                    {tNav("brand")}
                  </span>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer active:scale-95"
                    aria-label={tCommon("close") || "Close menu"}
                  >
                    <X size={22} weight="bold" />
                  </button>
                </div>

                {/* Language Switcher */}
                <div className="mb-6">
                  <LanguageSwitcher />
                </div>

                {/* Navigation Links with smooth staggered slide-in */}
                <nav className="flex flex-col gap-1">
                  {navLinks.map((link, idx) => (
                    <motion.div
                      key={link.name}
                      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={
                        shouldReduceMotion
                          ? { duration: 0.15 }
                          : { duration: 0.22, delay: 0.04 + idx * 0.04, ease: "easeOut" }
                      }
                    >
                      <Link
                        href={link.href}
                        className="block text-base py-3 px-3 rounded-xl text-slate-800 font-inter font-semibold hover:text-[#0F2D5E] hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-none"
                        onClick={(e) => {
                          handleNavClick(e, link.href);
                          setMobileMenuOpen(false);
                        }}
                      >
                        {link.name}
                      </Link>
                    </motion.div>
                  ))}
                </nav>

                {/* Bottom Actions with smooth fade-in */}
                <motion.div
                  initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={
                    shouldReduceMotion
                      ? { duration: 0.15 }
                      : { duration: 0.25, delay: 0.04 + navLinks.length * 0.04, ease: "easeOut" }
                  }
                  className="mt-auto pt-6 border-t border-slate-100 space-y-3"
                >
                  {isAuthenticated ? (
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full rounded-xl py-3 px-4 text-white bg-[#0F2D5E] hover:bg-[#16386E] font-display font-semibold text-sm flex items-center justify-center shadow-md transition-all cursor-pointer active:scale-[0.98]"
                    >
                      {tNav("dashboard")}
                    </Link>
                  ) : (
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        openAuthModal("signin");
                      }}
                      className="w-full rounded-xl py-3 px-4 text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 font-display font-semibold text-sm shadow-md shadow-blue-950/20 cursor-pointer transition-all flex items-center justify-center active:scale-[0.98]"
                    >
                      {tCommon("signIn")}
                    </button>
                  )}
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </header>
  );
}
