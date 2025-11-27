import React from "react";
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebookF, FaInstagram, FaTripadvisor } from "react-icons/fa";
import { socialLinks } from '@/lib/social-links'
import type { Locale } from "../../../i18n.config";

type Dictionary = {
  footer: {
    contactTitle: string;
    credits: string;
    privacy: string;
  };
};

interface FooterProps {
  dict: Dictionary;
  lang: Locale;
}


export default function Footer({ dict, lang }: FooterProps) {
  return (
    <footer id="kontakt" className="bg-black text-white">
      <div className="mx-auto w-full">
        <div className="flex flex-col md:grid md:grid-cols-2 md:gap-12">
          {/* Map */}
          <div className="h-60 md:h-72 w-full overflow-hidden md:h-96 md:px-0">
            <iframe
              src="https://maps.google.com/maps?q=Lochlann%20Steakhouse%2C%20Stationsgatan%209%2C%20673%2032%20Charlottenberg%2C%20Sweden&t=m&z=15&output=embed&iwloc=near"
              title="Lochlann Steakhouse, 673 32 Charlottenberg"
              aria-label="Lochlann Steakhouse, 673 32 Charlottenberg"
              loading="lazy"
              className="h-full w-full border-0"
            />
          </div>

          {/* Contact info */}
          <div className="h-80 md:h-72 mx-auto flex flex-col justify-center space-y-6 px-6 py-10 text-center sm:px-8 md:h-96 md:px-10">
            <h3 className="font-rustic text-2xl font-bold uppercase tracking-wide">
              {dict.footer.contactTitle}
            </h3>
            <ul className="space-y-2 font-roboto">
              <li>
                <a
                  href="tel:+4657120999"
                  className="flex items-center justify-center gap-2 hover:underline"
                >
                  <FaPhone className="h-4 w-4 scale-x-[-1] transform" />
                  <span>0571-20 999</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:hello@theoven.se"
                  className="flex items-center justify-center gap-2 hover:underline"
                >
                  <FaEnvelope className="h-4 w-4" />
                  <span>info@lochlannsteakhouse.com</span>
                </a>
              </li>

              <li className="flex items-center justify-center gap-2">
                <FaMapMarkerAlt className="h-4 w-4" />
                <span>Stationsgatan 9, 673 32 Charlottenberg</span>
              </li>
            </ul>
            {/* Social icons */}
<div className="pb-10 flex justify-center gap-6 mt-4 lg:hidden">
  {socialLinks.map((social) => {
    const Icon = social.icon;
    return (
      <a
        key={social.name}
        href={social.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={social.name}
        title={social.name}
        className="text-white hover:text-white transition-transform hover:scale-110"
      >
        <Icon className="h-6 w-6" />
      </a>
    );
  })}
</div>
          </div>
        </div>
        
        {/* Credits */}
        <div className="border-t border-white/10 lg:border-0 py-6 text-center flex items-center justify-center gap-4">
          <p className="font-roboto text-sm text-white/50">
            <a 
              href={`/${lang}/integritetspolicy`}
              className="hover:text-white/80 transition-colors"
            >
              {dict.footer.privacy}
            </a>
          </p>
          <span className="text-white/30">|</span>
         
          <p className="font-roboto text-sm text-white/50">
            {dict.footer.credits}{" "}
            <a 
              href="https://otdesign.se?utm_source=lochlannsteakhouse&utm_medium=referral" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-white/80 transition-colors"
            >
              Otd
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}