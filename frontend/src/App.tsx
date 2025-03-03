// src/App.tsx
import React from 'react';
import Home from './pages/Home';

interface AppProps {
  openModal: () => void;
}

export default function App({ openModal }: AppProps) {
  function handleConnect() {
    openModal();
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Crowdfund Front-End</h1>
      <button onClick={handleConnect}>Connect Wallet</button>
      <Home />
    </div>
  );
}