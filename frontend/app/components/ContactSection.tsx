"use client";

import React, { useState } from "react";
import {
  Phone,
  EnvelopeSimple,
  MapPin,
  CheckCircle,
  ShieldCheck,
  ArrowClockwise,
  PaperPlaneRight
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";

export function ContactSection() {
  const tContact = useTranslations("contact");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    reportDetails: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMsg) setErrorMsg("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1000);
  };

  const handleReset = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      reportDetails: ""
    });
    setIsSubmitted(false);
  };

  return (
    <div className="w-full flex flex-col gap-10 md:gap-14">
      {/* Section Header: Matching Pricing and Workflow typography */}
      <div className="text-center max-w-4xl lg:max-w-5xl mx-auto flex flex-col items-center gap-2.5">
        <h2 className="font-display font-bold text-2xl sm:text-3xl lg:text-[2.25rem] text-white tracking-tight leading-tight md:whitespace-nowrap">
          {tContact("title")}
        </h2>
        
        <p className="font-inter text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl sm:max-w-2xl mx-auto text-balance">
          {tContact("desc")}
        </p>
      </div>

      {/* Redesigned Contact Card with Exact Application Color Theme */}
      <div className="relative bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-4 shadow-xl max-w-4xl lg:max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-stretch">
          
          {/* LEFT SIDE: Brand Deep Navy Card (#0F2D5E) */}
          <div className="lg:col-span-4 bg-[#0F2D5E] rounded-xl p-6 sm:p-7 flex flex-col justify-between text-white shadow-md min-h-[400px]">
            <div>
              <h3 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight">
                {tContact("tag")}
              </h3>
              <p className="font-inter text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
                {tContact("cardSubtitle")}
              </p>
            </div>

            {/* Contact details with white circle icon badges in brand navy */}
            <div className="flex flex-col gap-3.5 sm:gap-4 pt-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white text-[#0F2D5E] flex items-center justify-center shrink-0 shadow-sm">
                  <EnvelopeSimple size={16} weight="bold" />
                </div>
                <span className="font-inter text-xs sm:text-sm text-white font-medium truncate">{tContact("email")}</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white text-[#0F2D5E] flex items-center justify-center shrink-0 shadow-sm">
                  <Phone size={16} weight="fill" />
                </div>
                <span className="font-inter text-xs sm:text-sm text-white font-medium">{tContact("phone")}</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white text-[#0F2D5E] flex items-center justify-center shrink-0 shadow-sm">
                  <MapPin size={16} weight="fill" />
                </div>
                <span className="font-inter text-xs sm:text-sm text-white font-medium leading-snug">{tContact("office")}</span>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Clean Form in Theme Colors */}
          <div className="lg:col-span-8 flex flex-col justify-center p-2 sm:p-5 lg:p-6">
            {isSubmitted ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center gap-6 animate-fadeIn">
                <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-inner">
                  <CheckCircle size={36} weight="fill" />
                </div>

                <div className="flex flex-col gap-2 max-w-md">
                  <h3 className="font-display text-2xl font-bold text-slate-900">
                    {tContact("successToast")}
                  </h3>
                  <p className="font-inter text-slate-600 text-sm leading-relaxed">
                    Thank you, <span className="text-slate-900 font-semibold">{formData.name}</span>. We will contact you shortly.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  className="border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl px-6 py-2.5 text-xs font-display font-semibold flex items-center gap-2 mt-2 cursor-pointer transition-all"
                >
                  <ArrowClockwise size={16} />
                  Submit Another Request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                    <ShieldCheck size={16} className="shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Row 1: Full name & Email address */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="name" className="text-xs sm:text-sm font-semibold text-slate-700 font-inter">
                      {tContact("nameLabel")}
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder={tContact("namePlaceholder")}
                      required
                      className="w-full bg-slate-50 border border-slate-200/90 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#0F2D5E] focus:ring-2 focus:ring-[#0F2D5E]/15 transition-all font-inter"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="email" className="text-xs sm:text-sm font-semibold text-slate-700 font-inter">
                      {tContact("emailLabel")}
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder={tContact("emailPlaceholder")}
                      required
                      className="w-full bg-slate-50 border border-slate-200/90 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#0F2D5E] focus:ring-2 focus:ring-[#0F2D5E]/15 transition-all font-inter"
                    />
                  </div>
                </div>

                {/* Row 2: Phone number */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="phone" className="text-xs sm:text-sm font-semibold text-slate-700 font-inter">
                    {tContact("phoneLabel")}
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder={tContact("phonePlaceholder")}
                    required
                    className="w-full bg-slate-50 border border-slate-200/90 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#0F2D5E] focus:ring-2 focus:ring-[#0F2D5E]/15 transition-all font-inter"
                  />
                </div>

                {/* Row 3: Message */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="reportDetails" className="text-xs sm:text-sm font-semibold text-slate-700 font-inter">
                    {tContact("messageLabel")}
                  </label>
                  <textarea
                    id="reportDetails"
                    name="reportDetails"
                    rows={4}
                    value={formData.reportDetails}
                    onChange={handleChange}
                    placeholder={tContact("messagePlaceholder")}
                    className="w-full bg-slate-50 border border-slate-200/90 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#0F2D5E] focus:ring-2 focus:ring-[#0F2D5E]/15 transition-all resize-none font-inter"
                  ></textarea>
                </div>

                {/* Submit button: Reduced border radius to rounded-xl */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-xl px-7 py-3 min-h-[44px] text-sm text-white bg-[#0F2D5E] hover:bg-[#16386E] font-display font-semibold flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>{tContact("sendMessage")}</span>
                        <PaperPlaneRight size={16} weight="bold" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
