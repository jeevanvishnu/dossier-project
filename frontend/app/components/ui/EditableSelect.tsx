"use client";

import React, { useState, useRef, useEffect } from "react";
import { CaretDown, Check, CheckCircle } from "@phosphor-icons/react";

export interface SelectOption {
  label: string;
  value: string;
}

export interface EditableSelectProps {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  options: SelectOption[];
  isSaved?: boolean;
  isDisabled?: boolean;
  required?: boolean;
  placeholder?: string;
  className?: string;
  size?: "sm" | "md";
}

export const EditableSelect: React.FC<EditableSelectProps> = ({
  label,
  value = "",
  onChange,
  options = [],
  isSaved = false,
  isDisabled = false,
  required = false,
  placeholder = "Select or type...",
  className = "",
  size = "md",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsUserTyping(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  // Compute filtered options
  let displayOptions = options;
  if (isUserTyping && searchTerm.trim() !== "") {
    const searchLower = searchTerm.toLowerCase().trim();
    const filtered = options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(searchLower) ||
        opt.value.toLowerCase().includes(searchLower)
    );
    // If typing matches some options, show filtered; if non match, fallback to showing all options
    if (filtered.length > 0) {
      displayOptions = filtered;
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    onChange(newVal);
    setIsUserTyping(true);
    setSearchTerm(newVal);
    if (!isOpen && !isDisabled) {
      setIsOpen(true);
    }
    setHighlightedIndex(0);
  };

  const handleToggleOpen = () => {
    if (isDisabled) return;
    if (!isOpen) {
      setIsUserTyping(false);
      setSearchTerm("");
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleInputFocus = () => {
    if (isDisabled) return;
    if (!isOpen) {
      setIsUserTyping(false);
      setSearchTerm("");
      setIsOpen(true);
    }
  };

  const handleSelectOption = (optValue: string) => {
    onChange(optValue);
    setIsOpen(false);
    setIsUserTyping(false);
    setSearchTerm("");
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isDisabled) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isOpen) {
        setIsUserTyping(false);
        setSearchTerm("");
        setIsOpen(true);
        setHighlightedIndex(0);
      } else {
        setHighlightedIndex((prev) =>
          prev < displayOptions.length - 1 ? prev + 1 : prev
        );
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (isOpen) {
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      }
    } else if (e.key === "Enter") {
      if (isOpen) {
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < displayOptions.length) {
          handleSelectOption(displayOptions[highlightedIndex].value);
        } else {
          setIsOpen(false);
          setIsUserTyping(false);
        }
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setIsUserTyping(false);
    }
  };

  const isSmall = size === "sm";

  return (
    <div className={`space-y-1.5 ${className}`} ref={containerRef}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-secondary">
            {label} {required && <span className="text-red-400">*</span>}
          </label>
          {isSaved && (
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
              <CheckCircle size={12} weight="fill" />
              Valid
            </span>
          )}
        </div>
      )}

      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          disabled={isDisabled}
          value={value}
          placeholder={placeholder}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          className={`w-full bg-bg border ${
            isDisabled
              ? "border-border/60 text-secondary bg-surface-raised/40 cursor-not-allowed opacity-75"
              : isSaved
              ? "border-emerald-500/70 focus:border-emerald-500 bg-emerald-950/10 text-primary"
              : "border-border focus:border-accent text-primary"
          } ${isSmall ? "text-xs rounded-lg px-2.5 py-1.5" : "text-xs rounded-xl px-3 py-2.5"} ${
            isSaved ? "pr-14" : "pr-8"
          } focus:outline-none transition-all`}
        />

        <div className="absolute right-2.5 flex items-center gap-1.5 z-10">
          {isSaved && <CheckCircle size={15} weight="fill" className="text-emerald-400" />}
          <button
            type="button"
            disabled={isDisabled}
            tabIndex={-1}
            onClick={handleToggleOpen}
            className={`p-0.5 rounded text-secondary hover:text-primary transition-colors cursor-pointer ${
              isDisabled ? "cursor-not-allowed opacity-50" : ""
            }`}
          >
            <CaretDown
              size={13}
              className={`transition-transform duration-200 ${isOpen ? "rotate-180 text-accent" : ""}`}
            />
          </button>
        </div>

        {/* Dropdown Options Popup */}
        {isOpen && !isDisabled && displayOptions.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-surface border border-border rounded-xl shadow-xl max-h-56 overflow-y-auto py-1 animate-in fade-in-50 duration-150 scrollbar-thin">
            {displayOptions.map((opt, idx) => {
              const isSelected = opt.value === value || opt.label === value;
              const isHighlighted = idx === highlightedIndex;

              return (
                <div
                  key={opt.value}
                  onMouseDown={(e) => {
                    e.preventDefault(); // Prevent input blur before click registers
                    handleSelectOption(opt.value);
                  }}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={`px-3 py-2 text-xs cursor-pointer transition-colors flex items-center justify-between font-medium ${
                    isSelected
                      ? "bg-accent/15 text-accent font-bold"
                      : isHighlighted
                      ? "bg-surface-raised text-primary"
                      : "text-secondary hover:text-primary hover:bg-surface-raised/60"
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <Check size={14} className="text-accent shrink-0 ml-2" weight="bold" />}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
