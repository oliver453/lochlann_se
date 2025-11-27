"use client";

import React, { useState, useEffect, useCallback } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { fetchAvailabilities } from "../../utils/theForkApi";
import {
  formatDateForAPI,
  getDaysInMonth,
} from "../../utils/dateHelpers";
import type { TheForkAvailability } from "../../../types/booking";
import type { Locale } from "../../../i18n.config";

type Dictionary = {
  booking: {
    step2?: {
      title?: string;
      subtitle?: string;
    };
    backButton?: string;
    nextButton?: string;
  };
};

interface BookingStep2Props {
  partySize: number;
  selectedDate: string;
  onDateSelect: (date: string) => void;
  onNext: () => void;
  onPrev: () => void;
  dict: Dictionary;
  lang?: Locale;
}

export const BookingStep2: React.FC<BookingStep2Props> = ({
  partySize,
  selectedDate,
  onDateSelect,
  onNext,
  onPrev,
  dict,
  lang = "sv",
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availabilities, setAvailabilities] = useState<TheForkAvailability[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Weekday names based on language
  const weekdays = lang === "en" 
    ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    : ["Mån", "Tis", "Ons", "Tor", "Fre", "Lör", "Sön"];

  // Get month name based on selected language
  const getMonthName = (date: Date): string => {
    const locale = lang === "en" ? "en-US" : "sv-SE";
    return date.toLocaleDateString(locale, { 
      month: "long", 
      year: "numeric" 
    });
  };

  // Helper function to create timezone-safe date strings
  const createDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const loadAvailabilities = useCallback(async () => {
    setIsLoading(true);
    try {
      const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      
      const startDate = formatDateForAPI(firstDay);
      const endDate = formatDateForAPI(lastDay);

      const data = await fetchAvailabilities(partySize, startDate, endDate);
      setAvailabilities(data);
    } catch (error) {
      console.error("Failed to load availabilities:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentMonth, partySize]);

  useEffect(() => {
    loadAvailabilities();
  }, [loadAvailabilities]);

  const isDateAvailable = (date: Date): boolean => {
    const dateStr = createDateString(date);
    return availabilities.some(
      (avail) => avail.date === dateStr && avail.hasNormalStock,
    );
  };

  const isDateSelected = (date: Date): boolean => {
    return createDateString(date) === selectedDate;
  };

  const navigateMonth = (direction: "prev" | "next") => {
    const newMonth = new Date(currentMonth);
    if (direction === "prev") {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const handleDateClick = (date: Date) => {
    const dateStr = createDateString(date);
    
    if (isDateAvailable(date)) {
      onDateSelect(dateStr);
    }
  };

  const daysInMonth = getDaysInMonth(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
  );
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="mb-2 text-xl font-semibold text-white">
          {dict.booking?.step2?.title || "Vilken dag?"}
        </h3>
        <p className="text-sm text-gray-300">
          {dict.booking?.step2?.subtitle || "Välj datum för din bokning"}
        </p>
      </div>

      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigateMonth("prev")}
          className="p-2 text-gray-400 transition-colors hover:text-white disabled:opacity-50"
          disabled={isLoading}
        >
          <FaChevronLeft className="h-4 w-4" />
        </button>

        <h4 className="font-medium capitalize text-white">
          {getMonthName(currentMonth)}
        </h4>

        <button
          onClick={() => navigateMonth("next")}
          className="p-2 text-gray-400 transition-colors hover:text-white disabled:opacity-50"
          disabled={isLoading}
        >
          <FaChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Calendar Grid with loading overlay */}
      <div className="relative">
        <div className={`transition-opacity duration-300 ${isLoading ? 'opacity-30' : 'opacity-100'}`}>
          <div className="grid grid-cols-7 gap-1">
            {/* Weekday headers */}
            {weekdays.map((day) => (
              <div
                key={day}
                className="py-2 text-center text-xs font-medium text-gray-400"
              >
                {day}
              </div>
            ))}

            {/* Empty cells for days before month start */}
            {Array.from({ length: (daysInMonth[0].getDay() + 6) % 7 }, (_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {/* Calendar days */}
            {daysInMonth.map((date) => {
              const available = isDateAvailable(date);
              const selected = isDateSelected(date);
              
              const dateWithoutTime = new Date(date.getFullYear(), date.getMonth(), date.getDate());
              const isPast = dateWithoutTime < today;
              const canSelect = available && !isPast;

              return (
                <button
                  key={date.toISOString()}
                  onClick={() => handleDateClick(date)}
                  disabled={!canSelect || isLoading}
                  className={`
                    aspect-square rounded text-sm font-medium transition-all duration-200
                    ${
                      selected
                        ? "bg-white text-black"
                        : canSelect
                        ? "border border-gray-600 bg-gray-800 text-white hover:bg-gray-700"
                        : "cursor-not-allowed text-gray-500 opacity-50"
                    }
                  `}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
          </div>
        )}
      </div>

      <div className="flex space-x-3">
        <button
          onClick={onPrev}
          className="flex-1 rounded-lg bg-gray-700 py-3 font-medium text-white transition-colors hover:bg-gray-600"
        >
          {dict.booking?.backButton || "Tillbaka"}
        </button>
        <button
          onClick={onNext}
          disabled={!selectedDate}
          className="flex-1 rounded-lg bg-white py-3 font-medium text-black transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {dict.booking?.nextButton || "Nästa"}
        </button>
      </div>
    </div>
  );
};