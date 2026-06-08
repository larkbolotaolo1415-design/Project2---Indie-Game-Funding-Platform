'use client';
import { useState, useEffect } from 'react';
import { fetchBalances, type Balances } from '@/lib/balances';

export default function BalanceCard({
  publicKey,
  refreshKey,
}: {
  publicKey: string;
  refreshKey: number;
}) {
  const [balances, setBalances] = useState<Balances | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchBalances(publicKey)
      .then((b) => active && setBalances(b))
      .catch(() => active && setBalances(null))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [publicKey, refreshKey]);

  if (loading) {
    return (
      <div className="grid animate-pulse grid-cols-2 gap-4">
        <div className="h-20 rounded bg-slate-800" />
        <div className="h-20 rounded bg-slate-800" />
      </div>
    );
  }

  if (balances && !balances.funded) {
    return (
      <div className="rounded border border-amber-900/50 bg-amber-950/20 p-4 text-sm text-amber-200">
        <p className="font-bold mb-1">UNINITIALIZED ACCOUNT</p>
        <p className="opacity-80">This account isn’t funded on Testnet yet. Click “Fund with Friendbot” above.</p>
      </div>
    );
  }

  if (!balances) {
    return <p className="text-sm text-red-400">FAILED TO SYNC BALANCES</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="card bg-slate-900 border-slate-800">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-1">Native Asset</p>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-black text-white">{balances.xlm}</p>
          <span className="text-xs font-bold text-slate-500 uppercase">XLM</span>
        </div>
      </div>
      <div className="card bg-slate-900 border-slate-800">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-1">Investment Fund</p>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-black text-brand-accent">{balances.usdc}</p>
          <span className="text-xs font-bold text-slate-500 uppercase">USDC</span>
        </div>
      </div>
    </div>
  );
}
