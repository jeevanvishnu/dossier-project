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
  Sparkle,
  ArrowRight,
  ArrowClockwise
} from "@phosphor-icons/react";

export function ContactSection() {
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
    
    // Basic validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.company.trim()) {
      setErrorMsg("Please fill in all required fields (Name, Phone, Email, Company).");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    // Simulate API call
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
    <div className="max-w-7xl mx-auto flex flex-col gap-12 lg:gap-16">
      {/* Section Header */}
      <div className="text-center max-w-5xl mx-auto flex flex-col items-center gap-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accent/10 border border-accent/25 text-accent text-xs font-semibold tracking-wider uppercase">
          <Sparkle size={14} className="animate-pulse" />
          <span>Get In Touch</span>
        </div>
        
        <h2 className="font-lexend text-2xl sm:text-3xl md:text-4xl lg:text-[2.5rem] font-bold text-primary tracking-tight leading-tight md:whitespace-nowrap">
          Request a Custom Dossier &amp; Compliance Report
        </h2>
        
        <p className="text-secondary text-sm sm:text-base leading-relaxed mt-1 max-w-2xl">
          Have questions about our regulatory portal, subscription tariffs, or eCTD dossier formatting? Submit your request and our specialists will generate a detailed report.
        </p>
      </div>

      {/* Single Master Unified Container Card */}
      <div className="relative bg-surface/80 border border-border/80 rounded-3xl shadow-2xl backdrop-blur-md overflow-hidden">
        {/* Ambient Glow Accents */}
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-accent/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-accent/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch divide-y lg:divide-y-0 lg:divide-x divide-border/60 relative z-10">
          
          {/* LEFT SIDE: Content & Benefits (Integrated Panel) */}
          <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 bg-gradient-to-b from-surface-raised/40 to-surface/20 flex flex-col justify-between gap-8">
            <div className="flex flex-col gap-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-accent mb-2 block">
                  Direct Communication
                </span>
                <h3 className="font-lexend text-xl sm:text-2xl font-bold text-primary leading-snug">
                  Expert Assistance for Your Regulatory Needs
                </h3>
              </div>
              
              <p className="text-secondary text-sm sm:text-base leading-relaxed">
                Whether you are preparing a multi-country registration dossier or evaluating tariff structures, our team provides full end-to-end guidance within 24 business hours.
              </p>

              {/* Quick Benefits List */}
              <div className="flex flex-col gap-3.5 pt-2">
                {[
                  { title: "24-Hour Express Report Delivery", desc: "Detailed breakdown tailored to your company size." },
                  { title: "Strict Confidentiality & NDA", desc: "Your regulatory assets and project data remain 100% secure." },
                  { title: "Dedicated Regulatory Advisor", desc: "Direct access to eCTD and Kazakh submission experts." }
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3.5 p-3.5 rounded-xl bg-surface/80 border border-border/50 shadow-sm hover:border-accent/30 transition-all">
                    <div className="w-8 h-8 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle size={18} className="text-accent" weight="fill" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-primary">{item.title}</h4>
                      <p className="text-xs text-secondary mt-0.5 leading-normal">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Support Badge */}
            <div className="pt-6 border-t border-border/40 flex items-center gap-3 text-xs text-secondary">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
              <span>Specialists Online • Average response under 2 hours</span>
            </div>
          </div>


          {/* RIGHT SIDE: Form Section */}
          <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
            {isSubmitted ? (
              /* Success State Card */
              <div className="flex flex-col items-center justify-center py-6 px-4 text-center gap-6 animate-fadeIn">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-inner">
                  <CheckCircle size={36} weight="fill" />
                </div>

                <div className="flex flex-col gap-2 max-w-md">
                  <h3 className="font-lexend text-2xl font-bold text-primary">
                    Report Request Submitted!
                  </h3>
                  <p className="text-secondary text-sm leading-relaxed">
                    Thank you, <span className="text-primary font-semibold">{formData.name}</span>. We have received your request for <span className="text-accent font-semibold">{formData.company}</span>.
                  </p>
                  <p className="text-xs text-muted mt-2">
                    A copy of your inquiry details and the initial confirmation have been sent to <span className="text-primary">{formData.email}</span>. Our regulatory specialist will get back to you shortly.
                  </p>
                </div>

                {/* Submitted Summary Card */}
                <div className="w-full bg-surface-raised border border-border/70 rounded-xl p-4 text-left flex flex-col gap-2.5 text-xs">
                  <div className="flex justify-between border-b border-border/50 pb-2">
                    <span className="text-secondary">Company Name:</span>
                    <span className="text-accent font-semibold">{formData.company}</span>
                  </div>
                  <div className="flex justify-between border-b border-border/50 pb-2">
                    <span className="text-secondary">Contact Phone:</span>
                    <span className="text-primary font-medium">{formData.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">Turnaround Time:</span>
                    <span className="text-emerald-400 font-medium flex items-center gap-1">
                      <Clock size={13} /> Within 24 Business Hours
                    </span>
                  </div>
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
              /* Contact Form */
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                
                {/* Form Header */}
                <div className="flex flex-col gap-1 border-b border-border/60 pb-5">
                  <h3 className="font-lexend text-2xl font-bold text-primary tracking-tight">
                    Submit Your Request
                  </h3>
                  <p className="text-secondary text-xs sm:text-sm">
                    Fill out the information below to request a tailored regulatory dossier report.
                  </p>
                </div>

                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-center gap-2">
                    <ShieldCheck size={16} className="shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Row 1: Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  
                  {/* Full Name */}
                  <div className="flex flex-col gap-2">
                    <label htmlFor="name" className="text-xs font-semibold text-secondary flex items-center gap-1.5">
                      <User size={14} className="text-accent" />
                      Full Name <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. Alexander Petrov"
                        required
                        className="w-full bg-surface-raised border border-border rounded-xl px-4 py-3 text-sm text-primary placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="flex flex-col gap-2">
                    <label htmlFor="phone" className="text-xs font-semibold text-secondary flex items-center gap-1.5">
                      <Phone size={14} className="text-accent" />
                      Phone Number <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
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

                </div>

                {/* Row 2: Email & Company Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  
                  {/* Work Email */}
                  <div className="flex flex-col gap-2">
                    <label htmlFor="email" className="text-xs font-semibold text-secondary flex items-center gap-1.5">
                      <EnvelopeSimple size={14} className="text-accent" />
                      Work Email <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="alexander@pharma.com"
                        required
                        className="w-full bg-surface-raised border border-border rounded-xl px-4 py-3 text-sm text-primary placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                      />
                    </div>
                  </div>

                  {/* Company Name */}
                  <div className="flex flex-col gap-2">
                    <label htmlFor="company" className="text-xs font-semibold text-secondary flex items-center gap-1.5">
                      <Buildings size={14} className="text-accent" />
                      Company Name <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        placeholder="BioPharma Kazakhstan Ltd."
                        required
                        className="w-full bg-surface-raised border border-border rounded-xl px-4 py-3 text-sm text-primary placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                      />
                    </div>
                  </div>

                </div>


                {/* Row 4: Report Details / Message */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="reportDetails" className="text-xs font-semibold text-secondary flex items-center gap-1.5">
                    <ChatTeardropText size={14} className="text-accent" />
                    Report Details / Message <span className="text-muted font-normal">(Optional)</span>
                  </label>
                  <textarea
                    id="reportDetails"
                    name="reportDetails"
                    rows={4}
                    value={formData.reportDetails}
                    onChange={handleChange}
                    placeholder="Provide additional details about your dossier size, target regulatory authorities, or specific deadlines..."
                    className="w-full bg-surface-raised border border-border rounded-xl px-4 py-3 text-sm text-primary placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all resize-none"
                  ></textarea>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn btn-primary bg-accent hover:bg-accent-hover text-[#0D1117] border-none font-semibold rounded-xl py-3.5 min-h-[48px] text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-accent/20 transition-all cursor-pointer disabled:opacity-70 mt-1"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-[#0D1117] border-t-transparent rounded-full animate-spin"></div>
                      <span>Generating Report Request...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Request &amp; Get Report</span>
                      <PaperPlaneRight size={18} weight="bold" />
                    </>
                  )}
                </button>

                {/* Privacy & Guarantee note */}
                <div className="flex items-center justify-center gap-2 text-center text-xs text-muted pt-1">
                  <ShieldCheck size={14} className="text-emerald-400" />
                  <span>Your information is encrypted &amp; never shared with third parties.</span>
                </div>

              </form>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
