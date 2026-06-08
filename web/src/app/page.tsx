'use client';
import { useState, useCallback } from 'react';
import { useWallet } from '@/hooks/useWallet';
import ConnectWallet from '@/components/ConnectWallet';
import FundAccount from '@/components/FundAccount';
import AddTrustline from '@/components/AddTrustline';
import BalanceCard from '@/components/BalanceCard';
import SendPayment from '@/components/SendPayment';
import LaroFund from '@/components/LaroFund';
import ProjectCard from '@/components/ProjectCard';

export default function Home() {
  const wallet = useWallet();
  const { publicKey, connecting } = wallet;
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  return (
    <main className="min-h-screen w-full bg-[#0f172a] text-slate-100 selection:bg-brand-primary selection:text-white">
      {/* Decorative Background */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px]"></div>
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-brand-primary/20 blur-[100px] rounded-full z-0"></div>
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-brand-accent/20 blur-[100px] rounded-full z-0"></div>

      <div className="relative z-10 mx-auto max-w-2xl px-4 py-12">
        <header className="mb-12 flex items-center justify-between gap-4 border-b border-slate-800 pb-8">
          <div>
            <h1 className="text-4xl font-black tracking-tighter neon-text italic">
              LARO<span className="text-brand-secondary">FUND</span>
            </h1>
            <p className="text-sm font-medium text-slate-400 uppercase tracking-widest mt-1">
              Fueling Filipino Indie Games
            </p>
          </div>
          <ConnectWallet {...wallet} />
        </header>

        <section className="mb-12 text-center py-8">
          <h2 className="text-3xl font-bold mb-4">Invest in the next Pinoy Hit.</h2>
          <p className="text-slate-400 max-w-md mx-auto">
            LaroFund connects local developers with backers. Buy game equity as tokens and receive automated revenue shares directly in your wallet.
          </p>
        </section>

        {!publicKey && !connecting && (
          <div className="card text-center py-16 neon-border bg-slate-900/50 backdrop-blur-md">
            <p className="mb-6 text-lg">Ready to start your journey?</p>
            <p className="text-slate-400 text-sm mb-8">
              Connect your Freighter wallet on Testnet to explore projects and manage your investments.
            </p>
            <a
              href="https://freighter.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-secondary hover:underline font-bold"
            >
              Get Freighter Wallet →
            </a>
          </div>
        )}

        {publicKey && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <FundAccount publicKey={publicKey} onFunded={refresh} />
              <AddTrustline publicKey={publicKey} onDone={refresh} />
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              <BalanceCard publicKey={publicKey} refreshKey={refreshKey} />
              <SendPayment publicKey={publicKey} onSent={refresh} />
            </div>

            <button
              onClick={refresh}
              className="w-full py-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-brand-primary transition-colors border border-slate-800 rounded-lg"
            >
              Refresh On-Chain Data
            </button>
          </div>
        )}

        <LaroFund publicKey={publicKey} />

        <div className="mt-12">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span className="w-2 h-6 bg-brand-primary rounded-full"></span>
            ACTIVE PROJECTS
          </h2>
          <ProjectCard publicKey={publicKey} onInvest={refresh} />
        </div>

        <footer className="mt-20 text-center border-t border-slate-800 pt-10 pb-6">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-[0.2em]">
            Built with ⚡ on Stellar for the PUP Workshop
          </p>
          <p className="text-[10px] text-slate-600 mt-2">
            LaroFund © 2026 • Mabuhay ang Pinoy Gamedev!
          </p>
        </footer>
      </div>
    </main>
  );
}
