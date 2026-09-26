"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Link, useRouter } from "../../../i18n/routing";
import { Key, LockKey, Eye, EyeSlash, ArrowRight, CheckCircle, CircleNotch } from "@phosphor-icons/react";
import { ThemeToggle } from "../../components/ThemeToggle";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";
import { api } from "../../lib/axios";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

function ResetPasswordForm() {
  const tAuth = useTranslations("auth");
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!token) {
      setErrorMessage("Missing or invalid password reset token.");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post("/auth/reset-password", {
        token,
        newPassword,
      });

      if (response.data?.success) {
        setIsSuccess(true);
        toast.success(response.data.message || "Password updated successfully!");
        setTimeout(() => {
          router.push("/");
        }, 1500);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to reset password. The link may have expired.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10">
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/20 to-sky-500/10 border border-accent/30 flex items-center justify-center text-accent mb-3 mx-auto shadow-md">
          <Key size={28} weight="duotone" />
        </div>
        <h1 className="font-lexend font-extrabold text-2xl text-primary mb-1">
          {tAuth.has("resetPasswordTitle") ? tAuth("resetPasswordTitle") : "Reset Password"}
        </h1>
        <p className="text-xs text-secondary">
          {tAuth.has("resetPasswordSub") ? tAuth("resetPasswordSub") : "Enter your new password below to secure your account"}
        </p>
      </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-medium flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {!token && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-medium">
              ⚠️ Warning: No reset token detected in URL. Please use the reset link provided in your email.
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-primary mb-1.5">
              New Password
            </label>
            <div className="relative flex items-center gap-2 bg-bg border border-border focus-within:border-accent rounded-xl px-3 py-2.5 transition-colors">
              <LockKey size={18} className="text-muted" />
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="bg-transparent text-xs text-primary placeholder-muted outline-none w-full font-medium pr-8"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-secondary hover:text-primary transition-colors"
              >
                {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-primary mb-1.5">
              Confirm New Password
            </label>
            <div className="relative flex items-center gap-2 bg-bg border border-border focus-within:border-accent rounded-xl px-3 py-2.5 transition-colors">
              <LockKey size={18} className="text-muted" />
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="bg-transparent text-xs text-primary placeholder-muted outline-none w-full font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isSuccess || !token}
            className="w-full py-3 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 mt-2 cursor-pointer"
          >
            {isSuccess ? (
              <>
                <CheckCircle size={18} weight="fill" className="text-emerald-400" />
                <span>Redirecting...</span>
              </>
            ) : isSubmitting ? (
              <>
                <CircleNotch size={18} className="animate-spin" />
                <span>Updating Password...</span>
              </>
            ) : (
              <>
                <span>Set New Password</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

      <div className="mt-6 pt-4 border-t border-border text-center text-xs text-muted">
        <Link href="/login" className="text-accent hover:underline font-semibold">
          Return to Sign In
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-bg text-secondary flex flex-col justify-center items-center px-4 relative overflow-hidden">
      <div className="absolute top-4 right-4 z-20 flex items-center gap-3">
        <LanguageSwitcher compact />
        <ThemeToggle showLabel />
      </div>

      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-accent/10 blur-[130px] rounded-full pointer-events-none" />

      <Suspense fallback={
        <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-8 shadow-2xl relative z-10 text-center">
          <CircleNotch size={32} className="animate-spin text-accent mx-auto mb-2" />
          <p className="text-xs text-secondary">Loading password reset form...</p>
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
