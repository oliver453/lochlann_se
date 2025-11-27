"use client";

import "flag-icons/css/flag-icons.min.css";
import { usePathname, useRouter } from "next/navigation";
import type { Locale } from "../../i18n.config";

interface LanguageSwitcherProps {
  currentLang: Locale;
}

const LanguageSwitcher = ({ currentLang }: LanguageSwitcherProps) => {
  const pathname = usePathname();
  const router = useRouter();

  const toggleLanguage = () => {
    const newLang: Locale = currentLang === "sv" ? "en" : "sv";
    
    // Remove current locale from pathname
    const pathWithoutLocale = pathname.replace(/^\/(sv|en)/, '') || '/';
    
    // Build new path with new locale
    const newPath = `/${newLang}${pathWithoutLocale}`;
    
    // Set cookie for persistence
    document.cookie = `NEXT_LOCALE=${newLang}; path=/; max-age=31536000`;
    
    router.push(newPath);
  };

  const flagClass = currentLang === "sv" ? "fi fi-gb" : "fi fi-se";
  const ariaLabel = currentLang === "sv" ? "Switch to English" : "Byt till Svenska";

  return (
    <button
      onClick={toggleLanguage}
      title={ariaLabel}
      className="flex h-full items-center justify-center transition hover:scale-110"
      aria-label={ariaLabel}
    >
      <span className={`${flagClass} text-[1.2rem] rounded-sm`} />
    </button>
  );
};

export default LanguageSwitcher;