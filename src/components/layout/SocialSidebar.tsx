import React from "react";
import {
  FaFacebookF,
  FaInstagram,
  FaTripadvisor,
} from "react-icons/fa";
import { socialLinks } from '@/lib/social-links'

export default function SocialSidebar() {
  return (
    <div className="fixed right-0 top-1/2 z-50 hidden -translate-y-1/2 transform lg:block">
      <div className="flex flex-col bg-black">
        {socialLinks.map((social) => {
          const IconComponent = social.icon;
          return (
            <a
              key={social.name}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-black p-3 transition-transform duration-300 hover:-translate-x-1 hover:scale-110"
              aria-label={social.name}
              title={social.name}
            >
              <IconComponent className="h-6 w-6 text-white" />
            </a>
          );
        })}
      </div>
    </div>
  );
}
