'use client';
import { useState, useEffect, useCallback } from 'react';
import {
  readLaroFundInfo,
  buildClaimXDR,
  buildDistributeXDR,
  contractConfigured,
  LaroFundInfo,
} from '@/lib/contract';

export default function LaroFund({ publicKey }: { publicKey: string | null }) {
  const [info, setInfo] = useState<LaroFundInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('10');
  const [status, setStatus] = useState('');

  const refresh = useCallback(async () => {
    if (!contractConfigured()) return;
    try {
      const data = await readLaroFundInfo(publicKey || undefined);
      setInfo(data);
    } catch (err) {
      console.error(err);
    }
  }, [publicKey]);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, 10000);
    return () => clearInterval(timer);
  }, [refresh]);

  if (!contractConfigured()) {
    return (
      <div className="card mt-8 neon-border bg-slate-900">
        <h2 className="text-xl font-bold neon-text mb-4">LaroFund: Smart Revenue Share</h2>
        <p className="text-slate-400 text-sm">
          Contract not deployed yet. Use <code>.\scripts\deploy.ps1</code> to launch the LaroFund engine on testnet.
        </p>
      </div>
    );
  }

  const handleClaim = async () => {
    if (!publicKey) return;
    setLoading(true);
    setStatus('Preparing claim...');
    try {
      const { signTransaction } = await import('@stellar/freighter-api');
      const xdr = await buildClaimXDR(publicKey);
      const { signedTxXdr } = await signTransaction(xdr);
      
      const { server } = await import('@/lib/stellar');
      const tx = new (await import('@stellar/stellar-sdk')).Transaction(signedTxXdr, (await import('@/lib/stellar')).NETWORK_PASSPHRASE);
      const response = await server.submitTransaction(tx);
      console.log('Claim success:', response);
      setStatus('Success! Revenue claimed.');
      refresh();
    } catch (err: any) {
      console.error(err);
      setStatus(`Error: ${err.message || 'Claim failed'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDistribute = async () => {
    if (!publicKey) return;
    setLoading(true);
    setStatus('Distributing revenue...');
    try {
      const { signTransaction } = await import('@stellar/freighter-api');
      const xdr = await buildDistributeXDR(publicKey, parseFloat(amount));
      const { signedTxXdr } = await signTransaction(xdr);
      
      const { server } = await import('@/lib/stellar');
      const tx = new (await import('@stellar/stellar-sdk')).Transaction(signedTxXdr, (await import('@/lib/stellar')).NETWORK_PASSPHRASE);
      await server.submitTransaction(tx);
      setStatus('Success! Revenue distributed.');
      refresh();
    } catch (err: any) {
      console.error(err);
      setStatus(`Error: ${err.message || 'Distribution failed'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card mt-8 neon-border bg-slate-900">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold neon-text">LaroFund Dashboard</h2>
          <p className="text-slate-400 text-sm">Automated Revenue Sharing</p>
        </div>
        <div className="text-right">
          <span className="text-xs uppercase tracking-widest text-slate-500">Total Dist. per Share</span>
          <p className="text-brand-secondary font-mono font-bold">{(info?.totalRevenuePerShare || 0) / 1000000000}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
          <h3 className="text-sm font-semibold text-slate-300 mb-2">Your Equity Balance</h3>
          <p className="text-3xl font-bold text-white">{info?.userBalance || 0} <span className="text-sm text-brand-primary">LARO</span></p>
        </div>
        <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
          <h3 className="text-sm font-semibold text-slate-300 mb-2">Pending Revenue</h3>
          <p className="text-3xl font-bold text-brand-secondary">{info?.claimable || 0} <span className="text-sm text-slate-400">USDC</span></p>
        </div>
      </div>

      {publicKey && (
        <div className="space-y-4">
          <div className="flex gap-4">
            <button
              onClick={handleClaim}
              disabled={loading || (info?.claimable || 0) <= 0}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Claim My Share'}
            </button>
          </div>

          <div className="pt-6 border-t border-slate-800">
            <h4 className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">Developer Actions</h4>
            <div className="flex gap-2">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white w-24 focus:outline-none focus:border-brand-primary"
              />
              <button
                onClick={handleDistribute}
                disabled={loading}
                className="btn-secondary flex-1"
              >
                Distribute Revenue (USDC)
              </button>
            </div>
          </div>
        </div>
      )}

      {status && (
        <p className="mt-4 text-center text-sm font-medium text-brand-accent animate-pulse">
          {status}
        </p>
      )}
    </div>
  );
}
