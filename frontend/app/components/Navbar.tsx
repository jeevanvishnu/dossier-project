"use client";

import { useState } from "react";
import Link from "next/link";
import { List, X } from "@phosphor-icons/react";
import { useAuthModal } from "./AuthModalContext";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "About", href: "#about" },
  { name: "Pricing", href: "#pricing" },
  { name: "Contact", href: "#contact" },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { openAuthModal } = useAuthModal();

  return (
    <header className="sticky top-0 w-full z-50 bg-bg/90 backdrop-blur-md shadow-xs border-b border-border/40">
      <div className="max-w-[1560px] mx-auto px-4 md:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="font-lexend font-bold text-xl text-primary flex items-center">
          ECTC
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8 ml-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-secondary hover:text-primary font-medium transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Desktop Auth Button */}
        <div className="hidden sm:flex items-center ml-auto lg:ml-0">
          <button
            onClick={() => openAuthModal("signin")}
            className="btn btn-primary rounded-lg px-5 min-h-[38px] h-[38px] text-[#0D1117] bg-accent hover:bg-accent-hover border-none font-semibold text-sm"
          >
            Sign In
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="lg:hidden p-2 text-secondary sm:ml-4"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open menu"
        >
          <List size={24} />
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-secondary/20 backdrop-blur-sm" 
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative ml-auto w-full max-w-xs bg-surface h-full shadow-lg flex flex-col pt-5 pb-6 px-4">
            <div className="flex items-center justify-between mb-8">
              <span className="font-lexend font-bold text-xl text-primary">ECTC</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-secondary hover:text-accent transition-colors">
                <X size={24} />
              </button>
            </div>
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-lg py-4 text-secondary font-medium hover:text-primary transition-colors border-b border-border/50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
            <div className="mt-auto">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuthModal("signin");
                }}
                className="btn btn-primary w-full rounded-lg min-h-[40px] h-[40px] text-[#0D1117] bg-accent hover:bg-accent-hover border-none font-semibold text-sm"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

