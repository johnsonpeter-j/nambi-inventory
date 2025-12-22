"use client";

import { useState, useRef, useEffect } from "react";

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  name: string;
  value: string;
  onChange: (e: { target: { name: string; value: string } }) => void;
  options: Option[];
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export default function CustomSelect({
  name,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  error,
  disabled = false,
  className = "",
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (optionValue: string) => {
    onChange({
      target: {
        name,
        value: optionValue,
      },
    });
    setIsOpen(false);
  };

  return (
    <div ref={selectRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full pl-4 pr-10 py-2 rounded-lg border ${
          error
            ? "border-red-500 dark:border-red-500"
            : "border-slate-300 dark:border-[#324d67]"
        } bg-slate-50 dark:bg-[#101922] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary text-left flex items-center justify-between ${
          disabled
            ? "cursor-not-allowed opacity-50"
            : "cursor-pointer hover:border-primary/50 dark:hover:border-primary/50"
        } transition-colors`}
      >
        <span
          className={`${
            selectedOption
              ? "text-slate-900 dark:text-white"
              : "text-slate-500 dark:text-[#92adc9]"
          }`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span
          className={`absolute right-3 top-0 bottom-0 flex items-center pointer-events-none text-slate-500 dark:text-slate-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <span className="material-symbols-outlined text-xl">expand_more</span>
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-[#1a232e] rounded-lg shadow-xl border border-slate-200 dark:border-[#324d67] overflow-hidden max-h-60 overflow-y-auto transition-all duration-200 ease-out opacity-100 transform translate-y-0">
          {options.length === 0 ? (
            <div className="px-4 py-3 text-sm text-slate-500 dark:text-[#92adc9] text-center">
              No options available
            </div>
          ) : (
            options.map((option, index) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                  value === option.value
                    ? "bg-primary/10 dark:bg-primary/20 text-primary dark:text-blue-400 font-medium"
                    : "text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-[#101922]"
                } ${
                  index !== options.length - 1
                    ? "border-b border-slate-200 dark:border-[#324d67]"
                    : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  {value === option.value && (
                    <span className="material-symbols-outlined text-sm">
                      check
                    </span>
                  )}
                  <span className={value === option.value ? "" : "pl-6"}>
                    {option.label}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-500 dark:text-red-400 mt-1">{error}</p>
      )}
    </div>
  );
}

