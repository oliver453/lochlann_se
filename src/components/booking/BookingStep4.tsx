// src/components/booking/BookingStep4.tsx
"use client";

import React from "react";
import { formatTimeFromMinutes } from "@/lib/utils/time";
import { formatDateForDisplay } from "@/lib/utils/date";
import type { BookingFormData } from "../../../types/booking";
import type { Locale } from "../../../i18n.config";

interface BookingStep4Props {
  bookingData: BookingFormData;
  onUpdate: (info: Partial<BookingFormData>) => void;
  onBook: () => void;
  onPrev: () => void;
  dict: {
    booking: {
      step4?: {
        title?: string;
        name?: string;
        email?: string;
        phone?: string;
        notes?: string;
        notesPlaceholder?: string;
        bookButton?: string;
      };
      backButton?: string;
    };
  };
  lang?: Locale;
  isSubmitting?: boolean;
}

export const BookingStep4: React.FC<BookingStep4Props> = ({
  bookingData,
  onUpdate,
  onBook,
  onPrev,
  dict,
  lang = "sv",
  isSubmitting = false,
}) => {
  const getPersonText = (count: number) => {
    if (lang === "en") {
      return count === 1 ? "person" : "people";
    } else {
      return count === 1 ? "person" : "personer";
    }
  };

  const isFormValid = bookingData.customerName && bookingData.customerEmail && bookingData.customerPhone;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="mb-2 text-xl font-semibold text-white">
          {dict.booking?.step4?.title || "Dina uppgifter"}
        </h3>
        <p className="text-sm text-gray-300">
          {formatDateForDisplay(bookingData.date, lang === "en" ? "en-US" : "sv-SE")} • {formatTimeFromMinutes(bookingData.time)} • {bookingData.partySize} {getPersonText(bookingData.partySize)}
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {dict.booking?.step4?.name || "Namn"} *
          </label>
          <input
            type="text"
            value={bookingData.customerName}
            onChange={(e) => onUpdate({ customerName: e.target.value })}
            className="w-full rounded-lg bg-gray-800 border border-gray-600 px-4 py-3 text-white focus:border-white focus:outline-none"
            placeholder="Förnamn Efternamn"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {dict.booking?.step4?.email || "E-post"} *
          </label>
          <input
            type="email"
            value={bookingData.customerEmail}
            onChange={(e) => onUpdate({ customerEmail: e.target.value })}
            className="w-full rounded-lg bg-gray-800 border border-gray-600 px-4 py-3 text-white focus:border-white focus:outline-none"
            placeholder="din@email.com"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {dict.booking?.step4?.phone || "Telefon"} *
          </label>
          <input
            type="tel"
            value={bookingData.customerPhone}
            onChange={(e) => onUpdate({ customerPhone: e.target.value })}
            className="w-full rounded-lg bg-gray-800 border border-gray-600 px-4 py-3 text-white focus:border-white focus:outline-none"
            placeholder="070-123 45 67"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {dict.booking?.step4?.notes || "Meddelande"} ({lang === "en" ? "optional" : "valfritt"})
          </label>
          <textarea
            value={bookingData.notes}
            onChange={(e) => onUpdate({ notes: e.target.value })}
            className="w-full rounded-lg bg-gray-800 border border-gray-600 px-4 py-3 text-white focus:border-white focus:outline-none resize-none"
            rows={3}
            placeholder={dict.booking?.step4?.notesPlaceholder || "Allergier, specialönskemål, etc..."}
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={onPrev}
          disabled={isSubmitting}
          className="flex-1 rounded-lg bg-gray-700 py-3 font-medium text-white transition-colors hover:bg-gray-600 disabled:opacity-50"
        >
          {dict.booking?.backButton || "Tillbaka"}
        </button>
        <button
          onClick={onBook}
          disabled={!isFormValid || isSubmitting}
          className="flex-1 rounded-lg bg-white py-3 font-medium text-black transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center"
        >
          {isSubmitting ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent mr-2"></div>
              {lang === "en" ? "Booking..." : "Bokar..."}
            </>
          ) : (
            dict.booking?.step4?.bookButton || "Bekräfta bokning"
          )}
        </button>
      </div>
    </div>
  );
};