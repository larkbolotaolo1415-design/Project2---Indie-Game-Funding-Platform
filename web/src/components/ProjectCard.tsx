'use client';
import { useState } from 'react';

export default function ProjectCard({ 
  publicKey, 
  onInvest 
}: { 
  publicKey: string | null; 
  onInvest: () => void;
}) {
  const [amount, setAmount] = useState('50');

  return (
    <div className="card neon-border bg-slate-900 overflow-hidden relative group">
      <div className="absolute top-0 right-0 bg-brand-secondary text-brand-bg px-3 py-1 font-black text-xs uppercase italic transform translate-x-1 translate-y-2 rotate-12 group-hover:rotate-0 transition-transform">
        Hot Project
      </div>
      
      <div className="mb-4">
        <h3 className="text-xl font-bold text-white mb-1">Combat Mech: Manila</h3>
        <p className="text-xs text-brand-primary font-bold uppercase tracking-widest">Action / RPG • 85% Funded</p>
      </div>

      <p className="text-sm text-slate-400 mb-6">
        A high-octane mech combat game set in a futuristic neo-Manila. Help us reach the finish line and share in the global release revenue!
      </p>

      <div className="w-full bg-slate-800 h-2 rounded-full mb-6 overflow-hidden">
        <div className="bg-brand-primary h-full w-[85%] shadow-[0_0_10px_rgba(139,92,246,0.8)]"></div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1">
          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Investment (USDC)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-brand-primary"
          />
        </div>
        <button
          onClick={onInvest}
          disabled={!publicKey}
          className="btn-secondary mt-5 disabled:opacity-50"
        >
          INVEST
        </button>
      </div>
    </div>
  );
}
