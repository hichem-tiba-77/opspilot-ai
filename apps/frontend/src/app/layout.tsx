import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppNavbar } from "@/components/AppNavbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OpsPilot AI",
  description: "AI-powered DevOps incident platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-slate-950 text-white antialiased`}
      >
        <AppNavbar />
        {children}
      </body>
    </html>
  );
}