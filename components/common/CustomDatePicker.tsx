"use client";

import { useState, useRef, useEffect } from "react";

interface CustomDatePickerProps {
  name: string;
  value: string;
  onChange: (e: { target: { name: string; value: string } }) => void;
  label?: React.ReactNode;
  error?: string;
  disabled?: boolean;
  min?: string;
  max?: string;
  className?: string;
}

export default function CustomDatePicker({
  name,
  value,
  onChange,
  label,
  error,
  disabled = false,
  min,
  max,
  className = "",
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value ? new Date(value) : null
  );
  const [currentMonth, setCurrentMonth] = useState(
    selectedDate || new Date()
  );
  const datePickerRef = useRef<HTMLDivElement>(null);

  // Update selectedDate when value prop changes
  useEffect(() => {
    if (value) {
      setSelectedDate(new Date(value));
      setCurrentMonth(new Date(value));
    } else {
      setSelectedDate(null);
    }
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target as Node)
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

  const formatDate = (date: Date | null): string => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatDisplayDate = (date: Date | null): string => {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    setSelectedDate(newDate);
    onChange({
      target: {
        name,
        value: formatDate(newDate),
      },
    });
    setIsOpen(false);
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleMonthChange = (monthIndex: number) => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(monthIndex);
      return newDate;
    });
  };

  const handleYearChange = (year: number) => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setFullYear(year);
      return newDate;
    });
  };

  // Generate year options (current year ± 10 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);

  const getDaysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isToday = (day: number): boolean => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day: number): boolean => {
    if (!selectedDate) return false;
    return (
      day === selectedDate.getDate() &&
      currentMonth.getMonth() === selectedDate.getMonth() &&
      currentMonth.getFullYear() === selectedDate.getFullYear()
    );
  };

  const isDisabled = (day: number): boolean => {
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    if (min && formatDate(date) < min) return true;
    if (max && formatDate(date) > max) return true;
    return false;
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <div ref={datePickerRef} className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-white mb-2">
          {label}
        </label>
      )}
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
          className={
            selectedDate
              ? "text-slate-900 dark:text-white"
              : "text-slate-500 dark:text-[#92adc9]"
          }
        >
          {selectedDate ? formatDisplayDate(selectedDate) : "Select date"}
        </span>
        <span className="absolute right-3 top-0 bottom-0 flex items-center pointer-events-none text-slate-500 dark:text-slate-400">
          <span className="material-symbols-outlined text-xl">calendar_today</span>
        </span>
      </button>

      {/* Calendar Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-50 mt-1 bg-white dark:bg-[#1a232e] rounded-lg shadow-xl border border-slate-200 dark:border-[#324d67] p-4 w-80 transition-all duration-200 ease-out">
          {/* Month/Year Navigation */}
          <div className="flex items-center gap-2 mb-4">
            {/* Month Selector */}
            <div className="flex-1 relative">
              <select
                value={currentMonth.getMonth()}
                onChange={(e) => handleMonthChange(Number(e.target.value))}
                className="w-full pl-3 pr-8 py-2 rounded-lg border border-slate-300 dark:border-[#324d67] bg-slate-50 dark:bg-[#101922] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary appearance-none text-sm font-medium cursor-pointer hover:border-primary/50 dark:hover:border-primary/50 transition-colors"
              >
                {monthNames.map((month, index) => (
                  <option key={index} value={index}>
                    {month}
                  </option>
                ))}
              </select>
              <span className="absolute right-2 top-0 bottom-0 flex items-center pointer-events-none text-slate-500 dark:text-slate-400">
                <span className="material-symbols-outlined text-sm">expand_more</span>
              </span>
            </div>

            {/* Year Selector */}
            <div className="flex-1 relative">
              <select
                value={currentMonth.getFullYear()}
                onChange={(e) => handleYearChange(Number(e.target.value))}
                className="w-full pl-3 pr-8 py-2 rounded-lg border border-slate-300 dark:border-[#324d67] bg-slate-50 dark:bg-[#101922] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary appearance-none text-sm font-medium cursor-pointer hover:border-primary/50 dark:hover:border-primary/50 transition-colors"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <span className="absolute right-2 top-0 bottom-0 flex items-center pointer-events-none text-slate-500 dark:text-slate-400">
                <span className="material-symbols-outlined text-sm">expand_more</span>
              </span>
            </div>

            {/* Quick Navigation Buttons */}
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => navigateMonth("prev")}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#101922] text-slate-700 dark:text-white transition-colors"
                title="Previous month"
              >
                <span className="material-symbols-outlined text-lg">chevron_left</span>
              </button>
              <button
                type="button"
                onClick={() => navigateMonth("next")}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#101922] text-slate-700 dark:text-white transition-colors"
                title="Next month"
              >
                <span className="material-symbols-outlined text-lg">chevron_right</span>
              </button>
            </div>
          </div>

          {/* Day Labels */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-slate-500 dark:text-[#92adc9] py-1"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days before month starts */}
            {emptyDays.map((_, index) => (
              <div key={`empty-${index}`} className="aspect-square" />
            ))}

            {/* Days of the month */}
            {days.map((day) => {
              const disabled = isDisabled(day);
              const selected = isSelected(day);
              const today = isToday(day);

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => !disabled && handleDateSelect(day)}
                  disabled={disabled}
                  className={`aspect-square rounded-lg text-sm font-medium transition-colors ${
                    disabled
                      ? "text-slate-300 dark:text-[#64748b] cursor-not-allowed"
                      : selected
                      ? "bg-primary text-white hover:bg-primary/90"
                      : today
                      ? "bg-primary/10 dark:bg-primary/20 text-primary dark:text-blue-400 hover:bg-primary/20 dark:hover:bg-primary/30 border border-primary dark:border-blue-400"
                      : "text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-[#101922]"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Today Button */}
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-[#324d67]">
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                setSelectedDate(today);
                setCurrentMonth(today);
                onChange({
                  target: {
                    name,
                    value: formatDate(today),
                  },
                });
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 rounded-lg bg-slate-100 dark:bg-[#101922] hover:bg-slate-200 dark:hover:bg-[#0f172a] text-slate-900 dark:text-white text-sm font-medium transition-colors"
            >
              Today
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-500 dark:text-red-400 mt-1">{error}</p>
      )}
    </div>
  );
}

