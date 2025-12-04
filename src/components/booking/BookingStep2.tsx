// src/components/booking/BookingStep2.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { getDaysInMonth, formatDateForAPI } from "@/lib/utils/date";
import type { Locale } from "../../../i18n.config";

interface BookingStep2Props {
  partySize: number;
  selectedDate: string;
  onDateSelect: (date: string) => void;
  onNext: () => void;
  onPrev: () => void;
  dict: {
    booking: {
      step2?: {
        title?: string;
        subtitle?: string;
      };
      backButton?: string;
      nextButton?: string;
    };
  };
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
  const [availableDates, setAvailableDates] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const weekdays = lang === "en" 
    ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    : ["Mån", "Tis", "Ons", "Tor", "Fre", "Lör", "Sön"];

  const getMonthName = (date: Date): string => {
    const locale = lang === "en" ? "en-US" : "sv-SE";
    return date.toLocaleDateString(locale, { 
      month: "long", 
      year: "numeric" 
    });
  };

  const loadAvailability = useCallback(async () => {
    setIsLoading(true);
    const daysInMonth = getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth());
    const available = new Set<string>();

    try {
      // BATCHA: Hämta bara första och sista dagen för att se om det finns slots överhuvudtaget
      const firstDay = formatDateForAPI(daysInMonth[0]);
      const lastDay = formatDateForAPI(daysInMonth[daysInMonth.length - 1]);

      // Kolla ett sample av dagar för att avgöra mönster
      const sampleDates = [
        daysInMonth[0], // Första dagen
        daysInMonth[Math.floor(daysInMonth.length / 3)],
        daysInMonth[Math.floor(daysInMonth.length / 2)],
        daysInMonth[Math.floor(daysInMonth.length * 2 / 3)],
        daysInMonth[daysInMonth.length - 1], // Sista dagen
      ];

      const samplePromises = sampleDates.map(async (date) => {
        const dateStr = formatDateForAPI(date);
        const response = await fetch(
          `/api/booking/availability?date=${dateStr}&partySize=${partySize}`
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.slots && data.slots.some((slot: any) => slot.isAvailable)) {
            return dateStr;
          }
        }
        return null;
      });

      const sampleResults = await Promise.all(samplePromises);
      
      // Om sample har tillgänglighet, markera alla dagar som potentiellt tillgängliga
      // Användare kan fortfarande klicka och få exakt info i nästa steg
      if (sampleResults.some(r => r !== null)) {
        daysInMonth.forEach(date => {
          const dateStr = formatDateForAPI(date);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const dateWithoutTime = new Date(date.getFullYear(), date.getMonth(), date.getDate());
          
          // Lägg bara till framtida datum
          if (dateWithoutTime >= today) {
            available.add(dateStr);
          }
        });
      }
      
      setAvailableDates(available);
    } catch (error) {
      console.error("Failed to load availability:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentMonth, partySize]);

  useEffect(() => {
    loadAvailability();
  }, [loadAvailability]);

  const isDateAvailable = (date: Date): boolean => {
    return availableDates.has(formatDateForAPI(date));
  };

  const isDateSelected = (date: Date): boolean => {
    return formatDateForAPI(date) === selectedDate;
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
    if (isDateAvailable(date)) {
      onDateSelect(formatDateForAPI(date));
    }
  };

  const daysInMonth = getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth());
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

      <div className="relative">
        <div className={`transition-opacity duration-300 ${isLoading ? 'opacity-30' : 'opacity-100'}`}>
          <div className="grid grid-cols-7 gap-1">
            {weekdays.map((day) => (
              <div key={day} className="py-2 text-center text-xs font-medium text-gray-400">
                {day}
              </div>
            ))}

            {Array.from({ length: (daysInMonth[0].getDay() + 6) % 7 }, (_, i) => (
              <div key={`empty-${i}`} />
            ))}

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
                    ${selected
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