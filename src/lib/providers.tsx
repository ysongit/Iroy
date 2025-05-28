import { Buffer } from 'buffer';
import React, { ReactNode } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { getDefaultConfig } from '@tomo-inc/tomo-evm-kit';
import { mainnet, polygon, optimism, arbitrum, base } from 'wagmi/chains';

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
  clientId: '', // Replace with your clientId
  appName: 'My TomoEVMKit App',
  projectId: '', // Note: Every dApp that relies on WalletConnect now needs to obtain a projectId from WalletConnect Cloud.
  chains: [mainnet, polygon, optimism, arbitrum, base],
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
