"use client";

import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import type { Locale } from "../../i18n.config";

type Dictionary = {
  newMenuModal?: {
    title?: string;
    description?: string;
    button?: string;
    menuButton?: string;
  };
};

export interface NewMenuModalProps {
  triggerDelay?: number;
  storageKey?: string;
  backgroundImage?: string;
  onOpen?: () => void;
  onClose?: () => void;
  onViewMenu?: () => void;
  dict: Dictionary;
  lang?: Locale;
}

export function NewMenuModal({
  triggerDelay = 1000,
  storageKey = "promo:b1f1-modal-seen",
  backgroundImage = "/images/lunch.webp",
  onOpen,
  onClose,
  onViewMenu,
  dict,
  lang = "sv"
}: NewMenuModalProps): JSX.Element {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [hasSeenModal, setHasSeenModal] = useState<boolean>(false);
  const router = useRouter();

  // Check localStorage on mount
  useEffect(() => {
    const seen = localStorage.getItem(storageKey);
    setHasSeenModal(seen === "true");
  }, [storageKey]);

  const handleClose = (): void => {
    setIsOpen(false);
    localStorage.setItem(storageKey, "true");
    setHasSeenModal(true);
    onClose?.();
  };

  const handleViewMenu = (): void => {
    const menuPath = lang === "en" ? "tel:0570-10100" : "tel:0570-10100";
    router.push(menuPath);
    onViewMenu?.();
    handleClose();
  };

  const handleMenuClick = (): void => {
    const menuPath = lang === "en" ? "/en/lunch" : "/sv/lunch";
    router.push(menuPath);
    handleClose();
  };

  const handleOpenChange = (open: boolean): void => {
    if (open) {
      setIsOpen(true);
      onOpen?.();
    } else {
      handleClose();
    }
  };

  const handleImageLoad = (): void => {
    setImageLoaded(true);
  };

  const handleImageError = (): void => {
    setImageLoaded(true);
  };

  // Preload image when component mounts
  useEffect(() => {
    if (!backgroundImage) return;
    
    const img = new window.Image();
    img.onload = () => setImageLoaded(true);
    img.onerror = () => setImageLoaded(true);
    img.src = backgroundImage;
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [backgroundImage]);

  useEffect(() => {
    if (hasSeenModal) return;

    const timer = setTimeout(() => {
      setIsOpen(true);
      onOpen?.();
    }, triggerDelay);

    return () => clearTimeout(timer);
  }, [hasSeenModal, triggerDelay, onOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        // Optional: tab navigation logic
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md mx-4 min-h-[500px] p-0 overflow-hidden">
        {/* Bakgrundsfärg som fallback */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900"
          aria-hidden="true" 
        />
        
        {/* Optimerad bakgrundsbild med fade-in effekt */}
        <div className="absolute inset-0">
          <Image
            src={backgroundImage}
            alt="Background"
            fill
            className={`object-cover transition-opacity duration-500 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            priority
            sizes="(max-width: 768px) 100vw, 448px"
            onLoad={handleImageLoad}
            onError={handleImageError}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
          />
        </div>
        
        {/* Overlay med mjukare transition */}
        <div 
          className={`absolute inset-0 bg-black/30 z-10 transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-50'
          }`} 
          aria-hidden="true" 
        />

        {/* Content */}
        <div className="relative z-20 h-full flex flex-col min-h-[500px]">
          {/* Close Button */}
          <div className="absolute top-4 right-4 z-30">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="text-white border-0"
              aria-label="Close modal"
            >
              <FaTimes className="h-4 w-4" />
            </Button>
          </div>

          {/* Centered Content med fade-in animation */}
          <div className="flex-1 flex flex-col items-center justify-center px-8 py-16">
            <div 
              className={`text-center max-w-xs mx-auto space-y-6 transition-all duration-700 ${
                imageLoaded 
                  ? 'opacity-100 transform translate-y-0' 
                  : 'opacity-70 transform translate-y-4'
              }`}
            >
              <h1 className="text-white font-rustic uppercase text-3xl">
                {dict.newMenuModal?.title || "Ny Meny"}
              </h1>
              <p className="text-white leading-relaxed text-lg">
                {dict.newMenuModal?.description || "Kolla in vår nya meny med spännande rätter!"}
              </p>
              <div className="space-y-3 w-full">
              {/*   <Button 
                  onClick={handleViewMenu}
                  className="bg-white text-black hover:bg-gray-200 focus:bg-gray-200 font-rustic uppercase text-lg py-3 px-8 transition-colors duration-200 w-full"
                  aria-describedby="view-menu-description"
                >
                  {dict.newMenuModal?.button || "Ring och beställ"}
                </Button>
              */}
                <Button 
                  onClick={handleMenuClick}
                  className="bg-white text-black hover:bg-gray-200 focus:bg-gray-200 font-rustic uppercase text-lg py-3 px-8 transition-colors duration-200 w-full"
                >
                  {dict.newMenuModal?.menuButton || "Se meny"}
                </Button>
              </div>
              <span id="view-menu-description" className="sr-only">
                Navigate to page
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default NewMenuModal;