import React from "react";
import { Button } from "./ui/button";
import { FaEnvelope } from "react-icons/fa";

interface ContentBoxProps {
  subheading?: string;
  title: string;
  text: string;
  buttonText?: string;
  buttonLink?: string;
  onButtonClick?: () => void;
  position?: "left" | "right";
}

export function ContentBox({
  subheading,
  title,
  text,
  buttonText,
  buttonLink,
  onButtonClick,
  position = "right", // Default till höger
}: ContentBoxProps) {
  // Funktion för att rendera text med radbrytningar
  const renderTextWithLineBreaks = (text: string) => {
    return text.split("\n").map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < text.split("\n").length - 1 && <br />}
      </React.Fragment>
    ));
  };

  const handleButtonClick = () => {
    if (buttonLink) {
      window.open(buttonLink, "_blank");
    } else if (onButtonClick) {
      onButtonClick();
    }
  };

  // Bestäm CSS-klasser baserat på position
  // På mobil: centrera med px-4, på desktop: använd ml/mr för positionering
  const positionClasses =
  position === "left" 
    ? "px-6 mx-4 md:mx-auto lg:ml-24"
    : "px-6 mx-4 md:mx-auto lg:mr-24";

  return (
    <div
      className={`content-box mx-auto max-w-lg text-center ${positionClasses}`}
    >
      {subheading && (
        <h4 className="hidden font-rustic uppercase tracking-wider lg:block mb-6">
          {subheading}
        </h4>
      )}

      <h3 className="mb-4 font-rustic text-3xl uppercase text-white">
        {title}
      </h3>
      <div className="font-roboto leading-relaxed text-white/80">
        {renderTextWithLineBreaks(text)}
      </div>
      {buttonText && (
        <Button
          onClick={handleButtonClick}
          variant="ghost"
          className="mt-6 px-8 py-7 text-lg text-white font-rustic uppercase"
        >
          <FaEnvelope className="mr-2 h-5 w-5" />
          {buttonText}
        </Button>
      )}
    </div>
  );
}