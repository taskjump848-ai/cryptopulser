import React, { useState } from 'react';
import BetControls from '@/components/BetControls';
import { useGameState } from '@/hooks/useGameState';

const SYMBOLS = ['⚔️', '🏯', '🐉', '🌸', '💎', '🎴'];
const REELS = 5;
const ROWS = 3;

const BlueSamuraiGame: React.FC = () => {
  const { balance, placeBet } = useGameState();
  const [betAmount, setBetAmount] = useState(100);
  const [grid, setGrid] = useState<string[][]>([]);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{ mult: number } | null>(null);

  const spin = () => {
    if (betAmount > balance || spinning) return;
    setSpinning(true);
    setResult(null);

    setTimeout(() => {
      const g = Array.from({ length: ROWS }, () => Array.from({ length: REELS }, () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]));
      setGrid(g);
      // Check middle row for matches
      const mid = g[1];
      let maxRun = 1, run = 1;
      for (let i = 1; i < mid.length; i++) { if (mid[i] === mid[i - 1]) { run++; maxRun = Math.max(maxRun, run); } else run = 1; }
      const payouts: Record<number, number> = { 1: 0, 2: 0.5, 3: 3, 4: 10, 5: 50 };
      const mult = payouts[maxRun] || 0;
      setResult({ mult });
      placeBet('Blue Samurai', betAmount, mult, mult > 0);
      setSpinning(false);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col lg:flex-row gap-6">
      <div className="w-full lg:w-72 space-y-4">
        <BetControls betAmount={betAmount} onBetChange={setBetAmount} onAction={spin} actionLabel={spinning ? 'Spinning...' : 'Spin'} disabled={betAmount > balance || spinning} maxBet={balance} />
        {result && <div className="glass-elevated rounded-xl p-4 text-center"><p className={`text-2xl font-black ${result.mult > 0 ? 'neon-text-green' : 'text-destructive'}`}>{result.mult > 0 ? `${result.mult}× — $${(betAmount * result.mult).toFixed(2)}` : 'No win'}</p></div>}
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="glass-elevated rounded-2xl p-6 space-y-1">
          {(grid.length > 0 ? grid : Array.from({ length: ROWS }, () => Array(REELS).fill('?'))).map((row, ri) => (
            <div key={ri} className={`flex gap-1 ${ri === 1 ? 'border-y border-primary/30 py-1' : ''}`}>
              {row.map((sym, ci) => (
                <div key={ci} className="w-16 h-16 mine-cell rounded-lg flex items-center justify-center text-2xl">{sym}</div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlueSamuraiGame;
