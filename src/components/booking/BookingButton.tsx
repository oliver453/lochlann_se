"use client";

import React, { useState } from "react";
import { BookingModal } from "./BookingModal";
import type { Locale } from "../../../i18n.config";

type Dictionary = {
  bookingBtn: {
    buttonText: string;
    buttonAriaLabel: string;
  };
  booking: any;
};

interface BookingButtonProps {
  dict: Dictionary;
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
          className="flex items-center rounded-full bg-white
            px-6 py-4 text-xl
            sm:px-6 sm:py-4 md:text-2xl font-rustic
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