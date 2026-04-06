import type { Metadata } from "next";
import LandingNavbar from "@/components/landing/LandingNavbar";
import LandingFooter from "@/components/landing/LandingFooter";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "Climate Asset Registry | Verified Low-Carbon Action Registry",
  description: "Register and verify low-carbon actions across India. Track CO₂e reduction and sustainability. India's transparent climate action registry.",
  openGraph: {
    title: "Climate Asset Registry | Verified Low-Carbon Action Registry",
    description: "Register and verify low-carbon actions across India. Track CO₂e reduction and impact.",
    url: "https://climateassetregistry.org",
    siteName: "Climate Asset Registry",
    images: [
      {
        url: "/og-image.png", // Ensure this exists or fallback
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_IN",
    type: "website",
  },
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen">
        <LandingNavbar />
        <main className="flex-grow pt-20">
          {children}
        </main>
        <LandingFooter />

        <style dangerouslySetInnerHTML={{ __html: `
          html {
            scroll-behavior: smooth;
          }
        ` }} />
      </div>
    </AuthProvider>
  );
}
