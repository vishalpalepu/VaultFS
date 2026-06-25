import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
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
  title: "VaultFS — Federated Knowledge & Resource Repository",
  description: "Secure folder hierarchy, markdown notes, PDF, video, and image storage federated across custom Cloudinary nodes with capacity-aware routing.",
  metadataBase: new URL("http://localhost:3000"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-neutral-950 text-neutral-100 dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased h-full`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
