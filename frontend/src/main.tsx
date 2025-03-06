// src/main.tsx
import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { WagmiConfig, createConfig } from 'wagmi';
import { createPublicClient, http } from 'viem';
import { createWeb3Modal } from '@web3modal/wagmi';
import App from './App';

// Import do React Query
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// 1) Crie um queryClient
const queryClient = new QueryClient();

const localChain = {
  id: 31337,
  name: 'Hardhat Local',
  network: 'hardhat',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: ['http://127.0.0.1:8545'] } },
  testnet: true,
};

const client = createPublicClient({
  chain: localChain,
  transport: http(),
});

const wagmiConfig = createConfig({
  chains: [localChain],
  client: () => client,
});

const { open } = createWeb3Modal({
  wagmiConfig,
  projectId: 'SEU_PROJECT_ID',
});

const rootEl = document.getElementById('root')!;
const root = ReactDOM.createRoot(rootEl);

// 2) Envolver no QueryClientProvider + WagmiConfig
root.render(
  <QueryClientProvider client={queryClient}>
    <WagmiConfig config={wagmiConfig}>
      <App openModal={open} />
    </WagmiConfig>
  </QueryClientProvider>
);