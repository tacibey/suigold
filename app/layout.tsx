import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "SuiGold | Financial Alchemy",
  description: "Turn your Dollar into Gold.",
  manifest: "/manifest.json",
  icons: {
    icon: "https://cryptologos.cc/logos/pax-gold-paxg-logo.png",
  }
};

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // DEĞİŞİKLİK BURADA: suppressHydrationWarning eklendi
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-[#050505]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}