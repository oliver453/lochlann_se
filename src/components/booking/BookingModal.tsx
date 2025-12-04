// src/components/booking/BookingModal.tsx
"use client";

import React, { useState, useCallback } from "react";
import { FaTimes } from "react-icons/fa";
import { BookingStep1 } from "./BookingStep1";
import { BookingStep2 } from "./BookingStep2";
import { BookingStep3 } from "./BookingStep3";
import { BookingStep4 } from "./BookingStep4";
import type { BookingFormData } from "../../../types/booking";
import type { Locale } from "../../../i18n.config";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  dict: {
    bookingBtn: {
      buttonText: string;
      buttonAriaLabel: string;
    };
    booking: any;
  };
  lang?: Locale;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  dict,
  lang = "sv",
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingData, setBookingData] = useState<BookingFormData>({
    partySize: 0,
    date: "",
    time: 0,
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    notes: "",
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

  const handleCustomerInfoUpdate = useCallback((info: Partial<BookingFormData>) => {
    setBookingData((prev) => ({ ...prev, ...info }));
  }, []);

  const handleFinalBooking = useCallback(async () => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/booking/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: bookingData.date,
          time: bookingData.time,
          partySize: bookingData.partySize,
          customerName: bookingData.customerName,
          customerEmail: bookingData.customerEmail,
          customerPhone: bookingData.customerPhone,
          notes: bookingData.notes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Booking failed');
      }

      // Success
      alert(dict.booking?.success || 'Bokning genomförd! Du kommer få en bekräftelse via e-post.');
      onClose();
      resetForm();
    } catch (error) {
      console.error('Booking error:', error);
      alert(error instanceof Error ? error.message : 'Något gick fel. Försök igen.');
    } finally {
      setIsSubmitting(false);
    }
  }, [bookingData, dict, onClose]);

  const resetForm = () => {
    setBookingData({
      partySize: 0,
      date: "",
      time: 0,
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      notes: "",
    });
    setCurrentStep(1);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      resetForm();
    }
  };

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 4));
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
            onNext={nextStep}
            onPrev={prevStep}
            dict={dict}
            lang={lang}
          />
        );
      case 4:
        return (
          <BookingStep4
            bookingData={bookingData}
            onUpdate={handleCustomerInfoUpdate}
            onBook={handleFinalBooking}
            onPrev={prevStep}
            dict={dict}
            lang={lang}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300 z-[80]"
        onClick={handleClose}
      />

      <div className="fixed bottom-0 left-2 right-2 z-[100] transform rounded-t-2xl bg-black transition-all duration-300 ease-out md:left-auto md:right-2 md:w-[500px]">
        <div className="max-h-[85vh] overflow-y-auto p-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex space-x-2">
              {[1, 2, 3, 4].map((step) => (
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
              disabled={isSubmitting}
              className="text-gray-400 transition-colors hover:text-white disabled:opacity-50"
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