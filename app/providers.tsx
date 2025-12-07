"use client";

import { WalletProvider } from "@suiet/wallet-kit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import "@suiet/wallet-kit/style.css";

// --- NÜKLEER SUSTURUCU (GLOBAL SCOPE) ---
// Bu kod bileşenler yüklenmeden ÖNCE çalışır.
if (typeof window !== "undefined") {
  const originalError = console.error;
  console.error = (...args) => {
    // Hata mesajlarını birleştirip küçük harfe çevir
    const msg = args.map(arg => String(arg)).join(' ').toLowerCase();

    // 1. Suiet Wallet boş resim hatası
    if (msg.includes("an empty string") && msg.includes("src")) return;
    
    // 2. React 19 ref hatası
    if (msg.includes("element.ref")) return;

    // Diğer tüm hataları göster
    originalError.apply(console, args);
  };
}
// ----------------------------------------

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        {children}
      </WalletProvider>
    </QueryClientProvider>
  );
}