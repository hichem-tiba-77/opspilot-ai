import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth-context";
import { AppNavbar } from "@/components/AppNavbar";
import "./globals.css";

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
      <body className="bg-slate-950 text-white antialiased">
        <AuthProvider>
          <AppNavbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
