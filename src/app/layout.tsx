import type { ReactNode } from "react";
import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  metadataBase: new URL("https://registryearthcarbon.org"),
  title: {
    default: "Earth Carbon Registry | Verified Carbon Actions",
    template: "%s | Earth Carbon Registry",
  },
  description: "Register and verify carbon-reducing actions. Track CO₂e reduction and Atmanirbhar impact with verified digital certificates.",
  keywords: ["carbon registry", "climate action", "atmanirbhar", "carbon credits", "India", "sustainability", "CO2e", "low carbon"],
  authors: [{ name: "Earth Carbon Foundation" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://registryearthcarbon.org",
    siteName: "Earth Carbon Registry",
    title: "Earth Carbon Registry | Verified Carbon Actions",
    description: "Register and verify carbon-reducing actions. Track CO₂e reduction and Atmanirbhar impact.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Earth Carbon Registry | Verified Carbon Actions",
    description: "Register and verify carbon-reducing actions. Track CO₂e reduction and Atmanirbhar impact.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800;900&family=Merriweather+Sans:wght@400;500;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased text-slate-800">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
