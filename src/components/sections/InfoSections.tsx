"use client";

import React from "react";
import { ContentBox } from "@/components/ContentBox";
import { motion } from "framer-motion";

const sectionBackgrounds = ["/images/13.webp", "/images/14.webp"];

type Dictionary = {
  info: {
    section1: {
      title: string;
      text: string;
    };
    section2: {
      subheading: string;
      title: string;
      text: string;
      button: string;
    };
  };
};

interface InfoSectionsProps {
  dict: Dictionary;
}

export function InfoSections({ dict }: InfoSectionsProps) {
  const sections = [
    {
      key: "section1",
      id: "ugnen",
      background: sectionBackgrounds[0],
      hasButton: false,
      position: "right" as const,
    },
    {
      key: "section2",
      id: "stora",
      background: sectionBackgrounds[1],
      hasButton: true,
      buttonLink: "mailto:hello@theoven.se",
      position: "left" as const,
    },
  ];

  return (
    <>
      {sections.map((section) => {
        const sectionData = dict.info[section.key as keyof typeof dict.info];

        return (
          <section
            key={section.key}
            id={section.id}
            className="parallax flex h-screen items-center justify-center md:justify-start"
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.2)), url(${section.background})`,
            }}
          >
            <div className="w-full px-4">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <ContentBox
                  title={sectionData.title}
                  text={sectionData.text}
                  buttonText={
                    section.hasButton ? (sectionData as any).button : undefined
                  }
                  buttonLink={section.buttonLink}
                  position={section.position}
                  subheading={
                    section.id === "stora"
                      ? dict.info.section2.subheading
                      : undefined
                  }
                />
              </motion.div>
            </div>
          </section>
        );
      })}
    </>
  );
}