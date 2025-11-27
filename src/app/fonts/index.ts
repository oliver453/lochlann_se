import { Roboto } from "next/font/google";
import localFont from "next/font/local";

// Google Font
export const robotoSlab = Roboto({
  subsets: ["latin"],
  variable: "--font-roboto-slab",
  weight: ["400", "700"],
  display: "swap",
});

export const rusticPrinted = localFont({
  src: [
    { path: "./GearedSlab-regular.woff2", weight: "800", style: "normal" },
    { path: "./GearedSlab-bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-rustic",
  display: "swap",
  preload: true,
  fallback: ["Georgia", "serif"],
});

