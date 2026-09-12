"use client";

import { useState } from "react";
import Link from "next/link";
import { List, X, User as UserIcon, SignOut } from "@phosphor-icons/react";
import { usePathname } from "next/navigation";
import { useAuthModal } from "./AuthModalContext";
import { useAuth } from "../context/AuthContext";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "About", href: "#about" },
  { name: "Pricing", href: "#pricing" },
  { name: "Contact", href: "#contact" },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { openAuthModal } = useAuthModal();
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const pathname = usePathname();

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
    <header className="sticky top-0 w-full z-50 bg-bg/90 backdrop-blur-md shadow-xs border-b border-border/40">
      <div className="w-full max-w-[1650px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link
          href="/"
          onClick={(e) => handleNavClick(e, "/")}
          className="font-lexend font-bold text-xl text-primary flex items-center"
        >
          ECTC
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8 ml-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="text-secondary hover:text-primary font-medium transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Desktop Auth Controls */}
        <div className="hidden sm:flex items-center ml-auto lg:ml-0 gap-3">
          {isLoading ? (
            <div className="w-24 h-9 bg-surface animate-pulse rounded-lg" />
          ) : isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border">
                <div className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold text-xs">
                  {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon size={14} />}
                </div>
                <span className="text-xs font-semibold text-primary">{user.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/10 text-accent font-medium uppercase tracking-wider">
                  {user.role}
                </span>
              </div>
              <button
                onClick={() => logout()}
                title="Sign Out"
                className="p-2 text-secondary hover:text-red-400 hover:bg-surface-raised rounded-full transition-all duration-200"
              >
                <SignOut size={18} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => openAuthModal("signin")}
              className="btn btn-primary rounded-lg px-5 min-h-[38px] h-[38px] text-white bg-accent hover:bg-accent-hover border-none font-semibold text-sm shadow-sm"
            >
              Sign In
            </button>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex items-center gap-2 sm:hidden">
          <button
            className="p-2 text-secondary"
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
              {isAuthenticated && user ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-bg border border-border flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-primary">{user.name}</p>
                      <p className="text-xs text-secondary">{user.email}</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-accent/20 text-accent font-semibold uppercase">
                      {user.role}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="btn btn-outline border-red-500/30 text-red-400 hover:bg-red-500/10 w-full rounded-lg min-h-[40px] h-[40px] font-semibold text-sm flex items-center justify-center gap-2"
                  >
                    <SignOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal("signin");
                  }}
                  className="btn btn-primary w-full rounded-lg min-h-[40px] h-[40px] text-white bg-accent hover:bg-accent-hover border-none font-semibold text-sm"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
