import React from "react";
import Image from "next/image";

type Dictionary = {
  hero: {
    title: string;
    subtitle?: string;
  };
};

interface HeroSectionProps {
  dict: Dictionary;
}

export function HeroSection({ dict }: HeroSectionProps) {
  return (
    <section className="relative h-screen overflow-hidden">
      <video
        autoPlay
        muted
        loop
        playsInline
        poster="/images/hero-poster.webp"
        className="hero-video absolute inset-0 z-0"
      >
       <source src="/video/hero.webm" type="video/webm" />
        <source src="/video/hero.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="absolute inset-0 bg-black/30"></div>

      <div className="absolute inset-0 flex items-center justify-center">
        <Image
          src="/lochlann.svg"
          alt={dict.hero.title}
          width={300}
          height={150}
          priority
          sizes="(max-width: 640px) 200px, (max-width: 768px) 250px, 300px"
          className="invert max-w-[200px] object-contain lg:max-w-[250px]"
        />
      </div>
    </section>
  );
}