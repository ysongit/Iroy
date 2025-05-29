import { TomoEVMKitProvider } from '@tomo-inc/tomo-evm-kit';
import '@tomo-inc/tomo-evm-kit/styles.css';

import ConnectButton from './components/ConnectButton';
import { Web3Providers } from './lib/providers';
import Landing from './pages/Landing';

function App() {
  return (
    <Web3Providers>
      <TomoEVMKitProvider>
        <div>
          <Landing />
          <ConnectButton />
        </div>
      </TomoEVMKitProvider>
    </Web3Providers>
  )
}

export default App;