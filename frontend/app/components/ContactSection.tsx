"use client";

import React, { useState } from "react";
import {
  User,
  Phone,
  EnvelopeSimple,
  Buildings,
  ChatTeardropText,
  PaperPlaneRight,
  CheckCircle,
  Clock,
  ShieldCheck,
  ArrowClockwise
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";

export function ContactSection() {
  const tContact = useTranslations("contact");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    company: "",
    reportDetails: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMsg) setErrorMsg("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.company.trim()) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1200);
  };

  const handleReset = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      company: "",
      reportDetails: ""
    });
    setIsSubmitted(false);
  };

  return (
    <div className="w-full flex flex-col gap-12 lg:gap-16">
      {/* Section Header */}
      <div className="text-center max-w-5xl mx-auto flex flex-col items-center gap-3">
        <span className="text-xs font-semibold tracking-[0.12em] text-accent uppercase">
          {tContact("tag")}
        </span>
        
        <h2 className="font-lexend text-2xl sm:text-3xl md:text-4xl lg:text-[2.5rem] font-bold text-primary tracking-tight leading-tight whitespace-nowrap">
          {tContact("title")}
        </h2>
        
        <p className="text-secondary text-sm sm:text-base leading-relaxed mt-1 max-w-2xl">
          {tContact("desc")}
        </p>
      </div>

      {/* Single Master Unified Container Card */}
      <div className="relative bg-surface/80 border border-border/80 rounded-3xl shadow-2xl backdrop-blur-md overflow-hidden">
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-accent/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-accent/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch divide-y lg:divide-y-0 lg:divide-x divide-border/60 relative z-10">
          
          {/* LEFT SIDE: Content & Benefits */}
          <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 bg-gradient-to-b from-surface-raised/40 to-surface/20 flex flex-col justify-between gap-8">
            <div className="flex flex-col gap-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-accent mb-2 block">
                  {tContact("tag")}
                </span>
                <h3 className="font-lexend text-xl sm:text-2xl font-bold text-primary leading-snug">
                  {tContact("title")}
                </h3>
              </div>
              
              <p className="text-secondary text-sm sm:text-base leading-relaxed">
                {tContact("desc")}
              </p>

              {/* Quick Contact Info List */}
              <div className="flex flex-col gap-3.5 pt-2">
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-surface/80 border border-border/50">
                  <Phone size={18} className="text-accent" />
                  <span className="text-xs font-bold text-primary">{tContact("phone")}</span>
                </div>
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-surface/80 border border-border/50">
                  <Buildings size={18} className="text-accent" />
                  <span className="text-xs font-bold text-primary">{tContact("office")}</span>
                </div>
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-surface/80 border border-border/50">
                  <Clock size={18} className="text-accent" />
                  <span className="text-xs font-bold text-primary">{tContact("schedule")}</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-border/40 flex items-center gap-3 text-xs text-secondary">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span>Specialists Online • {tContact("schedule")}</span>
            </div>
          </div>

          {/* RIGHT SIDE: Form Section */}
          <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
            {isSubmitted ? (
              <div className="flex flex-col items-center justify-center py-6 px-4 text-center gap-6 animate-fadeIn">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-500 shadow-inner">
                  <CheckCircle size={36} weight="fill" />
                </div>

                <div className="flex flex-col gap-2 max-w-md">
                  <h3 className="font-lexend text-2xl font-bold text-primary">
                    {tContact("successToast")}
                  </h3>
                  <p className="text-secondary text-sm leading-relaxed">
                    Thank you, <span className="text-primary font-semibold">{formData.name}</span>.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  className="btn btn-outline border-border hover:bg-surface-raised text-secondary hover:text-primary rounded-xl px-6 py-2.5 h-auto text-xs font-semibold flex items-center gap-2 mt-2"
                >
                  <ArrowClockwise size={16} />
                  Submit Another Request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="flex flex-col gap-1 border-b border-border/60 pb-5">
                  <h3 className="font-lexend text-2xl font-bold text-primary tracking-tight">
                    {tContact("title")}
                  </h3>
                  <p className="text-secondary text-xs sm:text-sm">
                    {tContact("desc")}
                  </p>
                </div>

                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-medium flex items-center gap-2">
                    <ShieldCheck size={16} className="shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="name" className="text-xs font-semibold text-secondary flex items-center gap-1.5">
                      <User size={14} className="text-accent" />
                      {tContact("nameLabel")} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder={tContact("namePlaceholder")}
                      required
                      className="w-full bg-surface-raised border border-border rounded-xl px-4 py-3 text-sm text-primary placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="phone" className="text-xs font-semibold text-secondary flex items-center gap-1.5">
                      <Phone size={14} className="text-accent" />
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+7 (701) 000-0000"
                      required
                      className="w-full bg-surface-raised border border-border rounded-xl px-4 py-3 text-sm text-primary placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="email" className="text-xs font-semibold text-secondary flex items-center gap-1.5">
                      <EnvelopeSimple size={14} className="text-accent" />
                      {tContact("emailLabel")} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder={tContact("emailPlaceholder")}
                      required
                      className="w-full bg-surface-raised border border-border rounded-xl px-4 py-3 text-sm text-primary placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="company" className="text-xs font-semibold text-secondary flex items-center gap-1.5">
                      <Buildings size={14} className="text-accent" />
                      {tContact("subjectLabel")} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      placeholder={tContact("subjectPlaceholder")}
                      required
                      className="w-full bg-surface-raised border border-border rounded-xl px-4 py-3 text-sm text-primary placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="reportDetails" className="text-xs font-semibold text-secondary flex items-center gap-1.5">
                    <ChatTeardropText size={14} className="text-accent" />
                    {tContact("messageLabel")}
                  </label>
                  <textarea
                    id="reportDetails"
                    name="reportDetails"
                    rows={4}
                    value={formData.reportDetails}
                    onChange={handleChange}
                    placeholder={tContact("messagePlaceholder")}
                    className="w-full bg-surface-raised border border-border rounded-xl px-4 py-3 text-sm text-primary placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn btn-primary bg-accent hover:bg-accent-hover text-white border-none font-semibold rounded-xl py-3.5 min-h-[48px] text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-accent/20 transition-all cursor-pointer disabled:opacity-70 mt-1"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{tContact("sendMessage")}</span>
                      <PaperPlaneRight size={18} weight="bold" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
