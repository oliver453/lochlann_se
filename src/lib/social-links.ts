import { FaFacebookF, FaInstagram, FaTripadvisor } from "react-icons/fa";

export interface SocialLink {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
}

export const socialLinks: SocialLink[] = [
  {
    name: "Facebook",
    href: "https://www.facebook.com/LochlannSteakhouse",
    icon: FaFacebookF,
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/steakhouselochlann/",
    icon: FaInstagram,
  },
  {
    name: "TripAdvisor",
    href: "https://www.tripadvisor.com/Restaurant_Review-g1572359-d10047147-Reviews-Lochlann-Charlottenberg_Varmland_County.html",
    icon: FaTripadvisor,
  },
];
