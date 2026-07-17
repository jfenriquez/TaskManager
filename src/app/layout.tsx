import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/src/components/nav/Navbar";
import { ThemeProvider } from "@/src/context/ThemeProvider";
import { ThemeSwitcher } from "@/src/components/ui/ThemeSwitcher";
import { ReduxProvider } from "@/src/store/provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Si No Lo Hace Llora - Task Manager",
  description: "Manage your tasks efficiently with role-based access control.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReduxProvider>
          <ThemeProvider>
            <Navbar />
            <ThemeSwitcher />
            {children}
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
