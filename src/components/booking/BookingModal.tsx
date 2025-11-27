"use client";

import React, { useState, useCallback } from "react";
import { FaTimes } from "react-icons/fa";
import { BookingStep1 } from "./BookingStep1";
import { BookingStep2 } from "./BookingStep2";
import { BookingStep3 } from "./BookingStep3";
import type { BookingFormData } from "../../../types/booking";
import type { Locale } from "../../../i18n.config";

type Dictionary = {
  bookingBtn: {
    buttonText: string;
    buttonAriaLabel: string;
  };
  booking: any;
};

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  dict: Dictionary;
  lang?: Locale;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  dict,
  lang = "sv",
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState<BookingFormData>({
    partySize: 0,
    date: "",
    time: 0,
    offerUuid: "",
  });

  const handlePartySizeSelect = useCallback((size: number) => {
    setBookingData((prev) => ({ ...prev, partySize: size }));
  }, []);

  const handleDateSelect = useCallback((date: string) => {
    setBookingData((prev) => ({ ...prev, date }));
  }, []);

  const handleTimeSelect = useCallback((time: number) => {
    setBookingData((prev) => ({ ...prev, time }));
  }, []);

  const handleFinalBooking = useCallback(() => {
    const locale = lang === "en" ? "en-GB" : "sv";
    const restaurantUuid = "1e84bc93-cf21-42ac-8bc2-6d2c234f393e";
    const utmSource = "theoven.se";
    
    const theForkUrl = `https://widget.thefork.com/${locale}/${restaurantUuid}?utm_source=${utmSource}&step=info&pax=${bookingData.partySize}&date=${bookingData.date}&time=${bookingData.time}`;
    
    window.open(theForkUrl, '_blank');
    onClose();
  }, [bookingData, lang, onClose]);

  const resetForm = () => {
    setBookingData({ partySize: 0, date: "", time: 0, offerUuid: "" });
    setCurrentStep(1);
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  if (!isOpen) return null;

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <BookingStep1
            selectedPartySize={bookingData.partySize}
            onPartySizeSelect={handlePartySizeSelect}
            onNext={nextStep}
            dict={dict}
          />
        );
      case 2:
        return (
          <BookingStep2
            partySize={bookingData.partySize}
            selectedDate={bookingData.date}
            onDateSelect={handleDateSelect}
            onNext={nextStep}
            onPrev={prevStep}
            dict={dict}
            lang={lang}
          />
        );
      case 3:
        return (
          <BookingStep3
            partySize={bookingData.partySize}
            selectedDate={bookingData.date}
            selectedTime={bookingData.time || null}
            onTimeSelect={handleTimeSelect}
            onBook={handleFinalBooking}
            onPrev={prevStep}
            dict={dict}
            lang={lang}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300 z-[80]"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed bottom-0 left-2 right-2 z-[100] transform rounded-t-2xl bg-black transition-all duration-300 ease-out md:left-auto md:w-[50vh]">
        <div className="max-h-[80vh] overflow-y-auto p-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex space-x-2">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    step === currentStep
                      ? "bg-white"
                      : step < currentStep
                      ? "bg-gray-400"
                      : "bg-gray-600"
                  }`}
                />
              ))}
            </div>
            
            <button
              onClick={handleClose}
              className="text-gray-400 transition-colors hover:text-white"
            >
              <FaTimes className="h-4 w-4" />
            </button>
          </div>

          {renderStep()}
        </div>
      </div>
    </>
  );
};