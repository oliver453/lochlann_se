// src/components/booking/BookingButton.tsx
"use client";

import React, { useState } from "react";
import { BookingModal } from "./BookingModal";
import type { Locale } from "../../../i18n.config";

interface BookingButtonProps {
  dict: {
    bookingBtn: {
      buttonText: string;
      buttonAriaLabel: string;
    };
    booking: any;
  };
  lang?: Locale;
}

export function BookingButton({ dict, lang = "sv" }: BookingButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        dict={dict}
        lang={lang}
      />

      <div className="fixed bottom-4 right-4 z-10">
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center font-rustic rounded-full bg-white
            px-6 py-4 text-base
            sm:px-6 sm:py-4 text-xl lg:text-2xl
            font-medium uppercase text-black
            shadow-lg transition-all duration-300
            hover:scale-105 hover:opacity-90 hover:shadow-xl
          "
          aria-label={dict.bookingBtn.buttonAriaLabel}
        >
          <span>{dict.bookingBtn.buttonText}</span>
        </button>
      </div>
    </>
  );
}