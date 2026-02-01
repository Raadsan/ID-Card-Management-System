import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ID Management System",
  description: "Secure and Efficient ID Card Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex min-h-screen bg-background text-foreground`}
        suppressHydrationWarning
      >
        {/* Sidebar Component */}
        <Sidebar />

        {/* Content Area */}
        <main className="flex-1 ml-64 min-h-screen bg-background">
          {/* Header Component */}
          <Header />

          <div className="px-8 pb-8 pt-8">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
