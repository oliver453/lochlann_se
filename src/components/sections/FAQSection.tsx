"use client";

import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type Dictionary = {
  faq: {
    title: string;
    questions: Array<{
      question: string;
      answer: string;
    }>;
  };
};

interface FAQSectionProps {
  dict: Dictionary;
}

export function FAQSection({ dict }: FAQSectionProps) {
  return (
    <section className="flex items-center justify-center bg-black px-8 py-12">
      <div className="mx-auto w-full lg:px-64">
        <h2 className="mb-8 text-center font-rustic text-4xl uppercase text-white">
          {dict.faq.title}
        </h2>

        <Accordion type="single" collapsible className="w-full">
          {dict.faq.questions.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left font-roboto font-semibold text-white">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="font-roboto leading-relaxed text-white/80">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}