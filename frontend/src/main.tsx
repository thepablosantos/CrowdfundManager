import React from 'react';
import ReactDOM from 'react-dom/client';
import { WagmiConfig, createConfig } from 'wagmi';
import { createPublicClient, http } from 'viem';
import { createWeb3Modal } from '@web3modal/wagmi';
import App from './App';

const localChain = {
  id: 31337,
  name: 'Hardhat Local',
  network: 'hardhat',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: ['http://127.0.0.1:8545'] } },
  testnet: true,
};

// Crie o client
const client = createPublicClient({
  chain: localChain,
  transport: http(),
});

// Ajuste createConfig p/ usar client function ou client object, dependendo da doc
const wagmiConfig = createConfig({
  chains: [localChain],
  client: () => client, // se a doc exigir que "client" seja uma função
  // ou apenas: client,
});

const { open } = createWeb3Modal({
  wagmiConfig,
  projectId: 'SEU_PROJECT_ID',
});

const rootEl = document.getElementById('root')!;
const root = ReactDOM.createRoot(rootEl);
root.render(
  <WagmiConfig config={wagmiConfig}>
    <App openModal={open} />
  </WagmiConfig>
);