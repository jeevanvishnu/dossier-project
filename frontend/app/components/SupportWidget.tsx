"use client";

import React, { useState } from "react";
import { QrCode, TelegramLogo, Clock, ShieldCheck, X } from "@phosphor-icons/react";

export function SupportWidget() {
  const [showQrModal, setShowQrModal] = useState(false);

  return (
    <>
      <div className="bg-bg border border-border rounded-xl p-3 text-xs shadow-md">
        <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-border">
          <div className="flex items-center gap-1.5 font-semibold text-primary">
            <TelegramLogo className="text-accent text-base" />
            <span>Tech Support</span>
          </div>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            Online
          </span>
        </div>

        <p className="text-secondary text-[11px] leading-relaxed mb-2.5">
          Telegram assist & issue resolution for eCTD submissions.
        </p>

        <div className="flex items-center gap-1.5 text-[11px] text-muted mb-3">
          <Clock className="text-accent shrink-0" size={13} />
          <span>Mon–Fri, 09:00–18:00 (Astana)</span>
        </div>

        <div className="flex items-center justify-between bg-surface-raised rounded-lg p-2 border border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent/10 rounded flex items-center justify-center text-accent">
              <QrCode size={18} />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-primary">@ectc_support</p>
              <p className="text-[9px] text-muted">SLA: Max 2h response</p>
            </div>
          </div>
          <button
            onClick={() => setShowQrModal(true)}
            className="px-2 py-1 text-[10px] font-semibold bg-accent/15 hover:bg-accent/25 text-accent rounded transition-colors"
          >
            QR Code
          </button>
        </div>
      </div>

      {/* QR Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative bg-surface border border-border rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 text-secondary hover:text-primary transition-colors p-1"
            >
              <X size={20} />
            </button>

            <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/20 text-accent flex items-center justify-center mx-auto mb-4">
              <TelegramLogo size={24} />
            </div>

            <h3 className="font-lexend font-bold text-lg text-primary mb-1">
              Technical Support Telegram
            </h3>
            <p className="text-xs text-secondary mb-4 leading-relaxed">
              Scan this QR code with your mobile device or Telegram app to launch a direct technical ticket.
            </p>

            {/* Generated QR Code representation */}
            <div className="bg-white p-4 rounded-xl inline-block mx-auto mb-4 shadow-inner border border-gray-200">
              <svg viewBox="0 0 100 100" className="w-36 h-36">
                <rect width="100" height="100" fill="white" />
                <rect x="10" y="10" width="25" height="25" fill="#121824" />
                <rect x="15" y="15" width="15" height="15" fill="white" />
                <rect x="18" y="18" width="9" height="9" fill="#121824" />

                <rect x="65" y="10" width="25" height="25" fill="#121824" />
                <rect x="70" y="15" width="15" height="15" fill="white" />
                <rect x="73" y="18" width="9" height="9" fill="#121824" />

                <rect x="10" y="65" width="25" height="25" fill="#121824" />
                <rect x="15" y="70" width="15" height="15" fill="white" />
                <rect x="18" y="73" width="9" height="9" fill="#121824" />

                <rect x="40" y="10" width="15" height="10" fill="#121824" />
                <rect x="45" y="25" width="10" height="15" fill="#121824" />
                <rect x="10" y="40" width="15" height="15" fill="#121824" />
                <rect x="40" y="40" width="20" height="20" fill="#38BDF8" />
                <rect x="65" y="45" width="25" height="10" fill="#121824" />
                <rect x="45" y="65" width="15" height="25" fill="#121824" />
                <rect x="70" y="65" width="20" height="20" fill="#121824" />
              </svg>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-muted">
              <ShieldCheck className="text-emerald-500" size={16} />
              <span>Provide your Organization User ID when contacting support</span>
            </div>

            <div className="mt-5 pt-4 border-t border-border">
              <a
                href="https://t.me/ectc_support"
                target="_blank"
                rel="noreferrer"
                className="btn btn-accent w-full text-white font-semibold text-xs py-2.5 rounded-lg flex items-center justify-center gap-2"
              >
                <TelegramLogo size={18} />
                Open Telegram Chat directly
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
