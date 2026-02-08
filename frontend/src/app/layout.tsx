"use client";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import React, { useState } from "react";
import Header from "@/components/layout/Header";
import { usePathname } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { Outfit } from "next/font/google";
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  const isVerifyPage = pathname?.startsWith("/verify");
  const isPublicPage = isLoginPage || isVerifyPage;

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} antialiased flex min-h-screen bg-background text-foreground`}
        suppressHydrationWarning
      >
        {/* Sidebar Component - Hidden on public pages */}
        {!isPublicPage && <Sidebar />}

        {/* Content Area */}
        <main className={`flex-1 min-h-screen bg-background ${!isPublicPage ? "ml-64" : ""}`}>
          {/* Header Component - Hidden on public pages */}
          {!isPublicPage && <Header />}

          <div className={`${!isPublicPage ? "px-8 pb-8 pt-8" : "w-full"}`}>
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
