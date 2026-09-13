"use client";

import React, { useState } from "react";
import { Link, useRouter } from "../../../i18n/routing";
import { Pill, LockKey, Envelope, ArrowRight, ShieldCheck, UserCheck } from "@phosphor-icons/react";
import { useAuth } from "../../context/AuthContext";
import { ThemeToggle } from "../../components/ThemeToggle";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

export default function LoginPage() {
  const tAuth = useTranslations("auth");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const { signIn, isLoading } = useAuth();
  const [email, setEmail] = useState("admin@ectc.kz");
  const [password, setPassword] = useState("Admin@2026");
  const [roleSelect, setRoleSelect] = useState<"admin" | "user">("admin");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password.");
      return;
    }

    const success = await signIn(email, password);
    if (success) {
      toast.success(`${tAuth("authenticatedAs")} ${roleSelect.toUpperCase()}`);
      if (roleSelect === "admin") {
        router.push("/profile/account");
      } else {
        router.push("/dashboard");
      }
    } else {
      toast.success(`${tAuth("demoGranted")} ${roleSelect.toUpperCase()}`);
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-bg text-secondary flex flex-col justify-center items-center px-4 relative overflow-hidden">
      <div className="absolute top-4 right-4 z-20 flex items-center gap-3">
        <LanguageSwitcher compact />
        <ThemeToggle showLabel />
      </div>

      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-accent/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link href="/start" className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-accent/20 border border-accent/40 text-accent flex items-center justify-center font-bold text-2xl">
              <Pill size={24} weight="fill" />
            </div>
          </Link>
          <h1 className="font-lexend font-extrabold text-2xl text-primary mb-1">
            {tAuth("loginTitle")}
          </h1>
          <p className="text-xs text-secondary">
            {tAuth("loginSub")}
          </p>
        </div>

        {/* Demo Role Switcher Bar */}
        <div className="bg-bg border border-border p-1.5 rounded-xl flex items-center gap-1 mb-6">
          <button
            type="button"
            onClick={() => {
              setRoleSelect("admin");
              setEmail("admin@ectc.kz");
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
              roleSelect === "admin"
                ? "bg-accent text-white"
                : "text-secondary hover:text-primary"
            }`}
          >
            <ShieldCheck size={16} />
            <span>{tAuth("adminRole")}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setRoleSelect("user");
              setEmail("specialist@pharma.kz");
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
              roleSelect === "user"
                ? "bg-accent text-white"
                : "text-secondary hover:text-primary"
            }`}
          >
            <UserCheck size={16} />
            <span>{tAuth("userRole")}</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-primary mb-1.5">
              {tAuth("emailLabel")}
            </label>
            <div className="flex items-center gap-2 bg-bg border border-border focus-within:border-accent rounded-xl px-3 py-2.5 transition-colors">
              <Envelope size={18} className="text-muted" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={tAuth("emailPlaceholder")}
                required
                className="bg-transparent text-xs text-primary placeholder-muted outline-none w-full font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-primary mb-1.5">
              {tAuth("passwordLabel")}
            </label>
            <div className="flex items-center gap-2 bg-bg border border-border focus-within:border-accent rounded-xl px-3 py-2.5 transition-colors">
              <LockKey size={18} className="text-muted" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={tAuth("passwordPlaceholder")}
                required
                className="bg-transparent text-xs text-primary placeholder-muted outline-none w-full font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-accent hover:bg-accent-hover text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 mt-2 cursor-pointer"
          >
            <span>{isLoading ? tAuth("authenticating") : tAuth("submitSignIn")}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-border text-center text-xs text-muted">
          <span>{tAuth("needHelp")} </span>
          <Link href="/start#contact" className="text-accent hover:underline font-semibold">
            {tAuth("contactSupport")}
          </Link>
        </div>
      </div>
    </div>
  );
}
