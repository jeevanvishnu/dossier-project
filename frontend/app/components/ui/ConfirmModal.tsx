import React from "react";
import { Warning, Trash, X } from "@phosphor-icons/react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  variant?: "danger" | "warning";
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
  variant = "danger",
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-surface border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${
                variant === "danger"
                  ? "bg-rose-500/15 text-rose-400 border-rose-500/20"
                  : "bg-amber-500/15 text-amber-400 border-amber-500/20"
              }`}
            >
              {variant === "danger" ? (
                <Trash size={20} weight="bold" />
              ) : (
                <Warning size={20} weight="bold" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold font-lexend text-primary">{title}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1 rounded-lg text-secondary hover:text-primary hover:bg-bg transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="text-sm text-secondary leading-relaxed">{description}</div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 bg-bg hover:bg-surface-raised border border-border rounded-xl text-sm font-semibold text-secondary hover:text-primary transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-white rounded-xl text-sm font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-2 cursor-pointer ${
              variant === "danger"
                ? "bg-rose-600 hover:bg-rose-700"
                : "bg-amber-600 hover:bg-amber-700"
            }`}
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
