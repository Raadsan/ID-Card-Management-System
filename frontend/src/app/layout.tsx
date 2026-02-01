"use client";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { usePathname } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex min-h-screen bg-background text-foreground`}
        suppressHydrationWarning
      >
        {/* Sidebar Component - Hidden on login page */}
        {!isLoginPage && <Sidebar />}

        {/* Content Area */}
        <main className={`flex-1 min-h-screen bg-background ${!isLoginPage ? "ml-64" : ""}`}>
          {/* Header Component - Hidden on login page */}
          {!isLoginPage && <Header />}

          <div className={`${!isLoginPage ? "px-8 pb-8 pt-8" : "w-full"}`}>
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
