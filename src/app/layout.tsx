import type { ReactNode } from "react";
import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  metadataBase: new URL("https://climateassetregistry.org"),
  title: {
    default: "Climate Asset Registry | Verified Carbon Actions",
    template: "%s | Climate Asset Registry",
  },
  description: "Register and verify carbon-reducing actions. Track CO₂e reduction and sustainability impact with verified digital certificates.",
  keywords: ["carbon registry", "climate action", "sustainability", "carbon credits", "India", "CO2e", "low carbon"],
  authors: [{ name: "Climate Asset Foundation" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://climateassetregistry.org",
    siteName: "Climate Asset Registry",
    title: "Climate Asset Registry | Verified Carbon Actions",
    description: "Register and verify carbon-reducing actions. Track CO₂e reduction and impact.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Climate Asset Registry | Verified Carbon Actions",
    description: "Register and verify carbon-reducing actions. Track CO₂e reduction and impact.",
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
