"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Slideshow from "../ui/slideshow";
import type { Locale } from "../../../i18n.config";

const heroImages = [
  {
    src: "/images/15.webp",
    alt: "Färgglada drinkar serverade i glas med is och garnering",
  },
  {
    src: "/images/1.webp",
    alt: "Smashburgare med smält ost, sallad och tomat på briochebröd",
  },
  {
    src: "/images/2.webp",
    alt: "Haitham serverar vin",
  },
];

type Dictionary = {
  welcome: {
    subheading: string;
    title: string;
    text: string;
    button: string;
  };
};

interface WelcomeSectionProps {
  dict: Dictionary;
  lang?: Locale;
}

export function WelcomeSection({ dict, lang = "sv" }: WelcomeSectionProps) {
  return (
    <section id="om-oss" className="relative flex min-h-screen items-center justify-center bg-black">
      {/* Content */}
      <div className="relative z-10 mx-auto h-full max-w-7xl px-6">
        <div className="grid min-h-screen items-center gap-12 py-20 lg:grid-cols-2">
          {/* Image slideshow with 4:5 aspect ratio - shown first on mobile */}
          <div className="relative order-1 mx-auto w-full max-w-md lg:order-2 lg:max-w-none">
            <Slideshow
              images={heroImages}
              autoPlay={true}
              autoPlayInterval={6000}
              className="w-full"
            />
          </div>
          
          <div className="order-2 space-y-6 text-center text-white lg:order-1">
            <h4 className="hidden font-rustic uppercase tracking-wider lg:block">
              {dict.welcome.subheading}
            </h4>
            <h1 className="mb-4 font-rustic text-3xl uppercase text-white">
              {dict.welcome.title}
            </h1>
            <p className="text-md mx-auto max-w-lg leading-relaxed text-white/80 lg:mx-0">
              {dict.welcome.text}
            </p>
            <div className="flex justify-center mx-auto gap-4">
            <Link href={`/${lang}/meny`} className="block">
              <Button className="bg-white hover:bg-gray-200 px-8 py-7 font-rustic text-lg uppercase text-black">
                {dict.welcome.button}
              </Button>
            </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}