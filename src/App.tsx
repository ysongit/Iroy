import { HashRouter, Route, Routes } from 'react-router-dom';
import { TomoEVMKitProvider } from '@tomo-inc/tomo-evm-kit';
import '@tomo-inc/tomo-evm-kit/styles.css';

import { Web3Providers } from './lib/providers';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Summary from './pages/Summary';

function App() {
  return (
    <Web3Providers>
      <TomoEVMKitProvider>
        <HashRouter>
          <Routes>
            <Route
              path="/summary"
              element={<Summary />} />
            <Route
              path="/dashboard"
              element={<Dashboard />} />
            <Route
              path="/"
              element={<Landing />} />
          </Routes>
        </HashRouter>
      </TomoEVMKitProvider>
    </Web3Providers>
  )
}

export default App;