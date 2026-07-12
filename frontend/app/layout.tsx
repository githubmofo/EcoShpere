import type { Metadata } from "next";
<<<<<<< HEAD
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});
=======
import "./globals.css";
import { Toaster } from "@/components/feedback/Toaster";
import PlatformFrame from "@/components/layout/PlatformFrame";
>>>>>>> origin/feature/member2-social-governance

export const metadata: Metadata = {
  title: "EcoSphere: ESG Management Platform",
  description: "Executive ESG dashboard and compliance manager",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
<<<<<<< HEAD
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${jetbrainsMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full bg-background text-foreground flex overflow-hidden">
        {/* Left Navigation Sidebar */}
        <Sidebar />

        {/* Right Actionable Container */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-background">
          {/* Header Dashboard Utility Panel */}
          <TopBar />

          {/* Screen Content Render */}
          <main className="flex-1 overflow-y-auto p-6 md:p-8">
            {children}
          </main>
        </div>
=======
    <html lang="en" className="h-full antialiased font-sans">
      <body className="min-h-full flex flex-col">
        <PlatformFrame>{children}</PlatformFrame>
        <Toaster />
>>>>>>> origin/feature/member2-social-governance
      </body>
    </html>
  );
}
