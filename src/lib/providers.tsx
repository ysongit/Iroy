import { Buffer } from 'buffer';

// @ts-ignore
import React, { ReactNode } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { getDefaultConfig } from '@tomo-inc/tomo-evm-kit';
import { aeneid } from './aeneid';

declare global {
  interface Window {
    Buffer: typeof Buffer;
  }
}

if (typeof window !== 'undefined') {
  window.Buffer = window.Buffer || Buffer;
}

const queryClient = new QueryClient();

const wagmiConfig = getDefaultConfig({
  clientId: 'LlIN2x0SOiWI5ZiNPYzBxh3RmeGAPZaTpJdChsgqP3M2MiRTTdwkm5VITDxSdmhNXKOWuXVrIjwWHjbZBjmwGoar', // Replace with your clientId
  appName: 'My TomoEVMKit App',
  projectId: 'e745d508df941ca8e1704642d31e913f', // Note: Every dApp that relies on WalletConnect now needs to obtain a projectId from WalletConnect Cloud.
  chains: [aeneid],
  ssr: false, // If your dApp uses server-side rendering (SSR)
});

interface Web3ProvidersProps {
  children: ReactNode;
}

/**
 * A wrapper component to provide Wagmi and React Query contexts to the application.
 * @param {Web3ProvidersProps} props - React props.
 * @param {React.ReactNode} props.children - The child components to be rendered within the providers.
 */
export const Web3Providers: React.FC<Web3ProvidersProps> = ({ children }) => {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
};
