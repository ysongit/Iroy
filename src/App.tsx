import { TomoEVMKitProvider } from '@tomo-inc/tomo-evm-kit';
import '@tomo-inc/tomo-evm-kit/styles.css';

import { Web3Providers } from './lib/providers';
import Landing from './pages/Landing';

function App() {
  return (
    <Web3Providers>
      <TomoEVMKitProvider>
        <div>
          <Landing />
        </div>
      </TomoEVMKitProvider>
    </Web3Providers>
  )
}

export default App;