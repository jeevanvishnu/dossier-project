"use client";

import React, { useState, useEffect } from "react";
import { useAuthModal } from "./AuthModalContext";
import {
  X,
  EnvelopeSimple,
  LockKey,
  Eye,
  EyeSlash,
  ArrowLeft,
  CheckCircle,
  CircleNotch,
  ShieldCheck,
  Key,
} from "@phosphor-icons/react";

export function AuthModal() {
  const { isOpen, mode, closeAuthModal, setMode } = useAuthModal();

  // Sign In state
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // General loading & feedback state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Handle ESC key press & body scroll locking
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeAuthModal();
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, closeAuthModal]);

  // Reset errors when mode changes
  useEffect(() => {
    setErrorMessage("");
    setForgotSuccess(false);
  }, [mode]);

  if (!isOpen) return null;

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!signInEmail || !signInPassword) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    setIsLoading(true);
    // Simulate API authentication call
    setTimeout(() => {
      setIsLoading(false);
      closeAuthModal();
      alert(`Welcome back! Signed in as ${signInEmail}`);
    }, 1200);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!forgotEmail) {
      setErrorMessage("Please enter your registered email address.");
      return;
    }

    setIsLoading(true);
    // Simulate API reset call
    setTimeout(() => {
      setIsLoading(false);
      setForgotSuccess(true);
    }, 1000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop with backdrop blur */}
      <div
        className="fixed inset-0 bg-[#090D14]/80 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
        onClick={closeAuthModal}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-[#192131] border border-[#2B3A54] rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden z-10 my-auto animate-in zoom-in-95 duration-200">
        
        {/* Subtle Ambient Glow Effect inside card header */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-36 bg-accent/15 blur-3xl pointer-events-none rounded-full" />

        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          aria-label="Close modal"
          className="absolute top-4 right-4 p-2 text-secondary hover:text-primary hover:bg-[#243045] rounded-full transition-all duration-200 z-20"
        >
          <X size={18} />
        </button>

        <div className="relative z-10 p-7 sm:p-9">
          
          {/* Header Title & Subtitle */}
          {mode === "forgot" ? (
            <div className="mb-7 text-center flex flex-col items-center">
              <button
                type="button"
                onClick={() => setMode("signin")}
                className="inline-flex items-center gap-1.5 text-xs text-accent hover:underline font-medium mb-4 group"
              >
                <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                Back to Sign In
              </button>

              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/20 to-sky-500/10 border border-accent/30 flex items-center justify-center text-accent mb-4 shadow-[0_0_25px_rgba(56,189,248,0.2)]">
                <Key size={28} weight="duotone" />
              </div>

              <h2 className="font-lexend text-2xl font-bold bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent tracking-tight">
                Reset Password
              </h2>
              <p className="text-secondary text-xs sm:text-sm mt-2 max-w-xs leading-relaxed">
                Enter your registered work email and we&apos;ll send password recovery instructions.
              </p>
            </div>
          ) : (
            <div className="mb-7 text-center flex flex-col items-center">
              {/* Glowing Brand Icon Emblem */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/20 to-sky-500/10 border border-accent/30 flex items-center justify-center text-accent mb-4 shadow-[0_0_30px_rgba(56,189,248,0.25)]">
                <ShieldCheck size={30} weight="duotone" />
              </div>

              <h2 className="font-lexend text-2xl font-bold bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent tracking-tight">
                Welcome to ECTC
              </h2>
              <p className="text-secondary text-xs sm:text-sm mt-1.5 leading-relaxed max-w-xs">
                Sign in to your pharmaceutical dossier workspace &amp; compliance platform.
              </p>
            </div>
          )}

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium flex items-center gap-2.5 shadow-sm">
              <span>⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* MODE: FORGOT PASSWORD */}
          {mode === "forgot" && (
            forgotSuccess ? (
              <div className="py-4 text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                  <CheckCircle size={36} weight="fill" />
                </div>
                <h3 className="font-lexend text-lg font-semibold text-primary">Instructions Sent!</h3>
                <p className="text-secondary text-xs sm:text-sm mt-2 max-w-xs leading-relaxed">
                  We sent password recovery instructions to <strong className="text-primary">{forgotEmail}</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className="mt-6 btn btn-primary w-full rounded-2xl h-11 text-[#0D1117] bg-gradient-to-r from-accent to-sky-400 hover:brightness-110 border-none font-bold text-sm shadow-[0_4px_16px_rgba(56,189,248,0.3)] transition-all"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-primary mb-2 tracking-wide">
                    Work Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-secondary group-focus-within:text-accent transition-colors">
                      <EnvelopeSimple size={18} />
                    </div>
                    <input
                      type="email"
                      required
                      placeholder="name@company.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-[#121824] border border-[#2B3A54] focus:border-accent focus:ring-2 focus:ring-accent/20 rounded-2xl text-primary placeholder-muted text-sm outline-none transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 btn btn-primary rounded-2xl h-12 text-[#0D1117] bg-gradient-to-r from-accent via-sky-400 to-accent hover:brightness-110 border-none font-bold text-sm shadow-[0_4px_20px_rgba(56,189,248,0.35)] flex items-center justify-center gap-2 transition-all"
                >
                  {isLoading ? (
                    <>
                      <CircleNotch size={18} className="animate-spin" />
                      <span>Sending instructions...</span>
                    </>
                  ) : (
                    <span>Send Reset Instructions</span>
                  )}
                </button>
              </form>
            )
          )}

          {/* MODE: SIGN IN */}
          {mode === "signin" && (
            <form onSubmit={handleSignInSubmit} className="space-y-4.5">
              <div>
                <label className="block text-xs font-semibold text-primary mb-1.5 tracking-wide">
                  Work Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-secondary group-focus-within:text-accent transition-colors">
                    <EnvelopeSimple size={18} />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#121824] border border-[#2B3A54] focus:border-accent focus:ring-2 focus:ring-accent/20 rounded-2xl text-primary placeholder-muted text-sm outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-primary tracking-wide">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setMode("forgot")}
                    className="text-xs text-accent hover:underline font-medium transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-secondary group-focus-within:text-accent transition-colors">
                    <LockKey size={18} />
                  </div>
                  <input
                    type={showSignInPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 bg-[#121824] border border-[#2B3A54] focus:border-accent focus:ring-2 focus:ring-accent/20 rounded-2xl text-primary placeholder-muted text-sm outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignInPassword(!showSignInPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-secondary hover:text-primary transition-colors"
                  >
                    {showSignInPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="checkbox checkbox-xs checkbox-accent rounded-md border-[#2B3A54]"
                  />
                  <span className="text-xs text-secondary group-hover:text-primary transition-colors">
                    Remember me on this device
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 btn btn-primary rounded-2xl h-12 text-[#0D1117] bg-gradient-to-r from-accent via-sky-400 to-accent hover:brightness-110 border-none font-bold text-sm shadow-[0_4px_20px_rgba(56,189,248,0.35)] flex items-center justify-center gap-2 transition-all transform active:scale-[0.99]"
              >
                {isLoading ? (
                  <>
                    <CircleNotch size={18} className="animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In to Portal</span>
                )}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
