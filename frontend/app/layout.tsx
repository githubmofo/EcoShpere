import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/feedback/Toaster";
import PlatformFrame from "@/components/layout/PlatformFrame";
import { AuthProvider } from "@/components/auth/AuthProvider";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

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
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${jetbrainsMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full bg-background text-foreground flex overflow-hidden">
        <AuthProvider>
          <PlatformFrame>{children}</PlatformFrame>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
