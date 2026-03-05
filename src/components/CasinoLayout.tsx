import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import CasinoSidebar from './CasinoSidebar';
import SystemConsole from './SystemConsole';
import CryptoModal from './CryptoModal';
import CursorGlow from './CursorGlow';
import { useGameState } from '@/hooks/useGameState';
import { Terminal, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';

const CasinoLayout: React.FC = () => {
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [cryptoMode, setCryptoMode] = useState<'deposit' | 'withdraw' | null>(null);
  const { balance, resetBalance } = useGameState();

  return (
    <div className="flex min-h-screen w-full casino-gradient">
      <CursorGlow />
      <CasinoSidebar />

      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="h-14 flex items-center justify-between px-6 glass border-b border-border/30">
          <h1 className="text-lg font-bold neon-text-gold tracking-wider">NEXUS CASINO</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCryptoMode('deposit')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent/15 text-accent font-bold text-xs tracking-wider click-glow hover:bg-accent/25 transition-colors border border-accent/20"
            >
              <ArrowDownToLine className="w-3.5 h-3.5" />
              DEPOSIT
            </button>
            <div className="glass-elevated rounded-lg px-4 py-2 flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Balance:</span>
              <span className="font-bold neon-text-gold">${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            <button
              onClick={() => setCryptoMode('withdraw')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary/15 text-primary font-bold text-xs tracking-wider click-glow hover:bg-primary/25 transition-colors border border-primary/20"
            >
              <ArrowUpFromLine className="w-3.5 h-3.5" />
              WITHDRAW
            </button>
            {balance <= 0 && (
              <button onClick={resetBalance} className="text-xs px-3 py-1.5 rounded-md bg-accent/20 text-accent click-glow">
                Reset
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto flex flex-col items-center">
          <div className="w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Floating console button */}
      <button
        onClick={() => setConsoleOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center glass-elevated neon-glow-green click-glow animate-glow-pulse"
      >
        <Terminal className="w-6 h-6 text-accent" />
      </button>

      <SystemConsole open={consoleOpen} onClose={() => setConsoleOpen(false)} />
      <CryptoModal open={cryptoMode !== null} onClose={() => setCryptoMode(null)} mode={cryptoMode || 'deposit'} />
    </div>
  );
};

export default CasinoLayout;
