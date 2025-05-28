import { TomoEVMKitProvider } from '@tomo-inc/tomo-evm-kit';
import '@tomo-inc/tomo-evm-kit/styles.css';

import ConnectButton from './components/ConnectButton';
import { Web3Providers } from './lib/providers';

function App() {
  return (
    <Web3Providers>
      <TomoEVMKitProvider>
        <div>
          <h1>Iroy</h1>
          <ConnectButton />
        </div>
      </TomoEVMKitProvider>
    </Web3Providers>
  )
}

export default App;