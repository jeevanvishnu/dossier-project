"use client";

import React, { useState, useEffect } from "react";
import { useAuthModal } from "./AuthModalContext";
import { useAuth } from "../context/AuthContext";
import {
  X,
  EnvelopeSimple,
  LockKey,
  Eye,
  EyeSlash,
  ArrowLeft,
  CheckCircle,
  CircleNotch,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";

import { toast } from "sonner";
import { api } from "../lib/axios";

export function AuthModal() {
  const tAuth = useTranslations("auth");
  const tCommon = useTranslations("common");
  const router = useRouter();

  const { isOpen, mode, closeAuthModal, setMode } = useAuthModal();
  const { signIn, isLoading } = useAuth();

  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [showSignInPassword, setShowSignInPassword] = useState(false);

  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [isForgotLoading, setIsForgotLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

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

  useEffect(() => {
    setErrorMessage("");
    setForgotSuccess(false);
  }, [mode]);

  if (!isOpen) return null;

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!signInEmail || !signInPassword) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    const success = await signIn(signInEmail, signInPassword);
    if (success) {
      closeAuthModal();
      setSignInEmail("");
      setSignInPassword("");
      router.push("/dashboard");
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!forgotEmail) {
      setErrorMessage("Please enter your registered email address.");
      return;
    }

    setIsForgotLoading(true);
    try {
      const response = await api.post("/auth/forgot-password", { email: forgotEmail });
      if (response.data?.success) {
        setForgotSuccess(true);
        toast.success(response.data?.message || "Password reset instructions sent.");
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Failed to process request.";
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsForgotLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
        onClick={closeAuthModal}
      />

      <div data-theme="dark" className="dark relative w-full max-w-md bg-surface border border-border/80 rounded-3xl shadow-2xl overflow-hidden z-10 my-auto animate-in zoom-in-95 duration-200">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-36 bg-accent/15 blur-3xl pointer-events-none rounded-full" />

        <button
          onClick={closeAuthModal}
          aria-label="Close modal"
          className="absolute top-4 right-4 w-8 h-8 rounded-full border border-border/60 bg-surface/80 text-secondary hover:text-primary hover:bg-surface-raised flex items-center justify-center transition-all duration-200 z-20 cursor-pointer shadow-xs"
        >
          <X size={16} />
        </button>

        <div className="relative z-10 p-7 sm:p-8">
          {mode === "forgot" ? (
            <div className="mb-6 text-center flex flex-col items-center">
              <button
                type="button"
                onClick={() => setMode("signin")}
                className="inline-flex items-center gap-1.5 text-xs text-accent hover:underline font-medium mb-3 group"
              >
                <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                {tCommon("back")}
              </button>

              <h2 className="font-lexend text-2xl font-bold text-primary tracking-tight">
                {tAuth("forgotPassword")}
              </h2>
            </div>
          ) : (
            <div className="mb-6 text-center flex flex-col items-center">
              <h2 className="font-lexend text-2xl font-bold text-primary tracking-tight">
                {tAuth("modalTitle")}
              </h2>
              <p className="text-secondary text-xs sm:text-sm mt-1 leading-relaxed max-w-xs">
                {tAuth("modalSubtitle")}
              </p>
            </div>
          )}

          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-medium flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {mode === "forgot" && (
            forgotSuccess ? (
              <div className="py-4 text-center flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 mb-3 shadow-sm">
                  <CheckCircle size={32} weight="fill" />
                </div>
                <h3 className="font-lexend text-lg font-semibold text-primary">{tAuth("instructionsSent")}</h3>
                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className="mt-5 w-full rounded-full h-11 text-white bg-accent hover:bg-accent-hover font-semibold text-sm shadow-xs transition-all cursor-pointer flex items-center justify-center"
                >
                  {tCommon("back")}
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1.5 tracking-wide">
                    {tAuth("emailLabel")}
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-secondary group-focus-within:text-accent transition-colors">
                      <EnvelopeSimple size={18} />
                    </div>
                    <input
                      type="email"
                      required
                      placeholder={tAuth("emailPlaceholder")}
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-bg/80 border border-border/80 focus:border-accent focus:ring-2 focus:ring-accent/20 rounded-xl text-primary placeholder-muted text-sm outline-none transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isForgotLoading}
                  className="w-full mt-2 rounded-full h-11 text-white bg-accent hover:bg-accent-hover font-semibold text-sm shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {isForgotLoading ? (
                    <>
                      <CircleNotch size={18} className="animate-spin" />
                      <span>{tCommon("loading")}</span>
                    </>
                  ) : (
                    <span>{tAuth("forgotPassword")}</span>
                  )}
                </button>
              </form>
            )
          )}

          {mode !== "forgot" && (
            <form onSubmit={handleSignInSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-primary mb-1.5 tracking-wide">
                  {tAuth("emailLabel")}
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-secondary group-focus-within:text-accent transition-colors">
                    <EnvelopeSimple size={18} />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder={tAuth("emailPlaceholder")}
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-bg/80 border border-border/80 focus:border-accent focus:ring-2 focus:ring-accent/20 rounded-xl text-primary placeholder-muted text-sm outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-primary tracking-wide">
                    {tAuth("passwordLabel")}
                  </label>
                  <button
                    type="button"
                    onClick={() => setMode("forgot")}
                    className="text-xs text-accent hover:underline font-medium transition-colors"
                  >
                    {tAuth("forgotPassword")}
                  </button>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-secondary group-focus-within:text-accent transition-colors">
                    <LockKey size={18} />
                  </div>
                  <input
                    type={showSignInPassword ? "text" : "password"}
                    required
                    placeholder={tAuth("passwordPlaceholder")}
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-bg/80 border border-border/80 focus:border-accent focus:ring-2 focus:ring-accent/20 rounded-xl text-primary placeholder-muted text-sm outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignInPassword(!showSignInPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-secondary hover:text-primary transition-colors cursor-pointer"
                  >
                    {showSignInPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 rounded-full h-11 text-white bg-accent hover:bg-accent-hover font-semibold text-sm shadow-xs flex items-center justify-center gap-2 transition-all transform active:scale-[0.99] cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <CircleNotch size={18} className="animate-spin" />
                    <span>{tAuth("authenticating")}</span>
                  </>
                ) : (
                  <span>{tAuth("submitSignIn")}</span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
