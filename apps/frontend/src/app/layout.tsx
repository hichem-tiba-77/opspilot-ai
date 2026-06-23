import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth-context";
import { AppNavbar } from "@/components/AppNavbar";
import { LayoutShell } from "@/components/LayoutShell";
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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
try {
  var theme = localStorage.getItem("opspilot-theme");
  if (theme !== "light" && theme !== "dark") {
    theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
} catch (_) {}
            `,
          }}
        />
      </head>
      <body className="bg-zinc-50 text-zinc-950 antialiased">
        <AuthProvider>
          <LayoutShell>
            <AppNavbar />
            {children}
          </LayoutShell>
        </AuthProvider>
      </body>
    </html>
  );
}
