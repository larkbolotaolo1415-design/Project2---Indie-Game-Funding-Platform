'use client';
import { useState } from 'react';
import type { WalletState } from '@/hooks/useWallet';

export default function ConnectWallet({
  publicKey,
  connecting,
  error,
  connect,
  disconnect,
}: WalletState) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!publicKey) return;
    await navigator.clipboard.writeText(publicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (publicKey) {
    return (
      <div className="flex flex-col items-end gap-1">
        <div className="flex items-center gap-2">
          <button
            onClick={copy}
            title="Copy full address"
            className="rounded bg-slate-800 px-3 py-1 font-mono text-sm text-brand-secondary border border-slate-700 transition-colors hover:bg-slate-700"
          >
            {copied ? 'COPIED!' : `${publicKey.slice(0, 6)}…${publicKey.slice(-6)}`}
          </button>
          <button
            onClick={disconnect}
            className="text-xs text-red-400 hover:text-red-300 uppercase font-bold tracking-tighter"
          >
            LOG OUT
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-right">
      <button
        onClick={connect}
        disabled={connecting}
        className="btn-primary"
      >
        {connecting ? 'CONNECTING…' : 'CONNECT WALLET'}
      </button>
      {error && <p className="mt-2 max-w-xs text-sm text-red-400">{error}</p>}
    </div>
  );
}
