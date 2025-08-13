import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { AuthProvider } from "@/src/lib/auth/auth-context";
import { appInsights } from "@/src/lib/services/app-insights";
import "./globals.css";

if (typeof window !== "undefined") {
  appInsights.initialize();
}

export const metadata: Metadata = {
  title: "Qodda - AI Skin Health Classifier",
  description:
    "AI-powered skin health condition classification using Azure Custom Vision",
  generator: "Qodda",
  keywords: ["AI", "skin health", "Azure", "computer vision", "healthcare"],
  authors: [{ name: "Qodda Team" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
