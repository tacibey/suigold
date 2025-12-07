"use client";

import { EnokiFlowProvider } from "@mysten/enoki/react";
import { createNetworkConfig, SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { getFullnodeUrl } from "@mysten/sui/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import "@mysten/dapp-kit/dist/index.css";

// --- NÜKLEER SUSTURUCU ---
if (typeof window !== "undefined") {
  const originalError = console.error;
  console.error = (...args) => {
    const msg = args.map(arg => String(arg)).join(' ').toLowerCase();
    if (msg.includes("an empty string") && msg.includes("src")) return;
    if (msg.includes("element.ref")) return;
    originalError.apply(console, args);
  };
}

const { networkConfig } = createNetworkConfig({
  mainnet: { url: getFullnodeUrl("mainnet") },
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="mainnet">
        {/* ENOKI PROVIDER: Google Girişi İçin */}
        <EnokiFlowProvider apiKey="enoki_public_demo_key"> 
          <WalletProvider autoConnect={true}>
            {children}
          </WalletProvider>
        </EnokiFlowProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}