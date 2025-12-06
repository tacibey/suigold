import type { Metadata, Viewport } from "next"; // Viewport eklendi
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "SuiGold | Financial Alchemy",
  description: "Turn your Dollar into Gold.",
  manifest: "/manifest.json", // PWA Manifest
  icons: {
    icon: "https://cryptologos.cc/logos/pax-gold-paxg-logo.png", // Favicon
  }
};

// Mobil tarayıcıda üst barın rengini ayarlar
export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Zoom yapmayı engeller (App hissi için)
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#050505]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}