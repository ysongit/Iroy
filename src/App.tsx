import { Buffer } from 'buffer';
window.Buffer = Buffer;

import { getDefaultConfig, TomoEVMKitProvider } from '@tomo-inc/tomo-evm-kit';
import { WagmiProvider } from 'wagmi';
import { mainnet, polygon, optimism, arbitrum, base } from 'wagmi/chains';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import '@tomo-inc/tomo-evm-kit/styles.css';

import ConnectButton from './components/ConnectButton';

function App() {
  const config = getDefaultConfig({
    clientId: '', // Replace with your clientId
    appName: 'My TomoEVMKit App',
    projectId: '', // Note: Every dApp that relies on WalletConnect now needs to obtain a projectId from WalletConnect Cloud.
    chains: [mainnet, polygon, optimism, arbitrum, base],
    ssr: false, // If your dApp uses server-side rendering (SSR)
  });

  const queryClient = new QueryClient();

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <TomoEVMKitProvider>
          {/* Your App */}
          <h1>Test</h1>
          <ConnectButton />
        </TomoEVMKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App
