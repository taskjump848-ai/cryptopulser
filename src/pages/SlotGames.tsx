import React, { useState } from 'react';
import BetControls from '@/components/BetControls';
import { useGameState } from '@/hooks/useGameState';

interface SlotConfig {
  name: string;
  symbols: string[];
  bgEmoji: string;
}

const createSlotGame = (config: SlotConfig) => {
  const SlotGame: React.FC = () => {
    const { balance, placeBet } = useGameState();
    const [betAmount, setBetAmount] = useState(100);
    const [grid, setGrid] = useState<string[][]>([]);
    const [spinning, setSpinning] = useState(false);
    const [result, setResult] = useState<{ mult: number; matches: number } | null>(null);

    const spin = () => {
      if (betAmount > balance || spinning) return;
      setSpinning(true);
      setResult(null);

      setTimeout(() => {
        const g = Array.from({ length: 3 }, () =>
          Array.from({ length: 5 }, () => config.symbols[Math.floor(Math.random() * config.symbols.length)])
        );
        setGrid(g);

        // Count symbol occurrences across all cells
        const counts: Record<string, number> = {};
        g.flat().forEach(s => counts[s] = (counts[s] || 0) + 1);
        const maxCount = Math.max(...Object.values(counts));

        // Scatter-style payouts
        let mult = 0;
        if (maxCount >= 12) mult = 100;
        else if (maxCount >= 10) mult = 50;
        else if (maxCount >= 8) mult = 15;
        else if (maxCount >= 6) mult = 5;
        else if (maxCount >= 5) mult = 2;
        else if (maxCount >= 4) mult = 0.5;

        setResult({ mult, matches: maxCount });
        placeBet(config.name, betAmount, mult, mult > 0);
        setSpinning(false);
      }, 1200);
    };

    return (
      <div className="max-w-4xl mx-auto flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-72 space-y-4">
          <BetControls betAmount={betAmount} onBetChange={setBetAmount} onAction={spin} actionLabel={spinning ? 'Spinning...' : 'Spin'} disabled={betAmount > balance || spinning} maxBet={balance} />
          {result && (
            <div className="glass-elevated rounded-xl p-4 text-center">
              <p className="text-xs text-muted-foreground">{result.matches} matching symbols</p>
              <p className={`text-2xl font-black ${result.mult > 0 ? 'neon-text-green' : 'text-destructive'}`}>
                {result.mult > 0 ? `${result.mult}× — $${(betAmount * result.mult).toFixed(2)}` : 'No win'}
              </p>
            </div>
          )}
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="glass-elevated rounded-2xl p-6 space-y-1">
            {(grid.length > 0 ? grid : Array.from({ length: 3 }, () => Array(5).fill(config.bgEmoji))).map((row, ri) => (
              <div key={ri} className="flex gap-1">
                {row.map((sym, ci) => (
                  <div key={ci} className="w-16 h-16 mine-cell rounded-lg flex items-center justify-center text-2xl transition-all">
                    {sym}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  SlotGame.displayName = config.name.replace(/\s/g, '');
  return SlotGame;
};

export const GatesOfOlympusGame = createSlotGame({
  name: 'Gates of Olympus',
  symbols: ['⚡', '👑', '💍', '⏳', '🔮', '🏛️'],
  bgEmoji: '⚡',
});

export const SweetBonanzaGame = createSlotGame({
  name: 'Sweet Bonanza',
  symbols: ['🍬', '🍭', '🧁', '🍩', '🍪', '🎂'],
  bgEmoji: '🍬',
});

export const StarlightPrincessGame = createSlotGame({
  name: 'Starlight Princess',
  symbols: ['⭐', '🌙', '💫', '🦋', '🌸', '👸'],
  bgEmoji: '⭐',
});

export const SugarRushGame = createSlotGame({
  name: 'Sugar Rush',
  symbols: ['🍭', '🍬', '🎀', '🧸', '🌈', '🎪'],
  bgEmoji: '🍭',
});

export const WantedDeadGame = createSlotGame({
  name: 'Wanted Dead',
  symbols: ['🔫', '💰', '🤠', '🐴', '🌵', '⭐'],
  bgEmoji: '🔫',
});
