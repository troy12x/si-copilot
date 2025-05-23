import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { quincyFont } from './fonts';
import "./globals.css";
import "./black-white-theme.css";
import { ClerkProvider } from '@clerk/nextjs';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SI Copilot",
  description: "Generate high-quality synthetic datasets for AI training",
};

// Add font preloading
export const viewport = {
  themeColor: '#ffffff',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider publishableKey="pk_test_cHJlY2lzZS1waXJhbmhhLTk2LmNsZXJrLmFjY291bnRzLmRldiQ" >
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} ${quincyFont.variable} antialiased`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
