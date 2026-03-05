import React, { useState } from 'react';
import BetControls from '@/components/BetControls';
import { useGameState } from '@/hooks/useGameState';

const GRID = 40;
const MAX_PICKS = 10;

const KenoGame: React.FC = () => {
  const { balance, placeBet } = useGameState();
  const [betAmount, setBetAmount] = useState(100);
  const [picks, setPicks] = useState<Set<number>>(new Set());
  const [drawn, setDrawn] = useState<Set<number>>(new Set());
  const [playing, setPlaying] = useState(false);
  const [result, setResult] = useState<{ hits: number; mult: number } | null>(null);

  const toggle = (n: number) => {
    if (playing) return;
    const next = new Set(picks);
    if (next.has(n)) next.delete(n);
    else if (next.size < MAX_PICKS) next.add(n);
    setPicks(next);
  };

  const play = () => {
    if (picks.size === 0 || betAmount > balance || playing) return;
    setPlaying(true);
    setResult(null);
    const drawnSet = new Set<number>();
    while (drawnSet.size < 10) drawnSet.add(Math.floor(Math.random() * GRID) + 1);
    setDrawn(drawnSet);

    setTimeout(() => {
      const hits = [...picks].filter(p => drawnSet.has(p)).length;
      const payouts: Record<number, number> = { 0: 0, 1: 0.5, 2: 1.5, 3: 3, 4: 6, 5: 15, 6: 40, 7: 100, 8: 300, 9: 700, 10: 2000 };
      const mult = payouts[hits] || 0;
      setResult({ hits, mult });
      placeBet('Keno', betAmount, mult, mult > 0);
      setPlaying(false);
    }, 1000);
  };

  const reset = () => { setPicks(new Set()); setDrawn(new Set()); setResult(null); };

  return (
    <div className="max-w-4xl mx-auto flex flex-col lg:flex-row gap-6">
      <div className="w-full lg:w-72 space-y-4">
        <BetControls betAmount={betAmount} onBetChange={setBetAmount} onAction={drawn.size > 0 ? reset : play} actionLabel={drawn.size > 0 ? 'New Game' : `Play (${picks.size} picks)`} disabled={picks.size === 0 || betAmount > balance} maxBet={balance} />
        {result && (
          <div className="glass-elevated rounded-xl p-4 text-center">
            <p className="text-xs text-muted-foreground">Hits: {result.hits}/{picks.size}</p>
            <p className={`text-2xl font-black ${result.mult > 0 ? 'neon-text-green' : 'text-destructive'}`}>{result.mult > 0 ? `${result.mult}× — $${(betAmount * result.mult).toFixed(2)}` : 'No win'}</p>
          </div>
        )}
      </div>
      <div className="flex-1">
        <div className="grid grid-cols-8 gap-1.5 max-w-lg mx-auto">
          {Array.from({ length: GRID }, (_, i) => {
            const n = i + 1;
            const picked = picks.has(n);
            const hit = drawn.has(n);
            return (
              <button key={n} onClick={() => toggle(n)} className={`aspect-square rounded-lg text-sm font-bold click-glow transition-all
                ${picked && hit ? 'bg-accent/30 text-accent border border-accent/60 neon-glow-green' : ''}
                ${picked && !hit && drawn.size > 0 ? 'bg-destructive/20 text-destructive border border-destructive/30' : ''}
                ${picked && drawn.size === 0 ? 'bg-primary/20 text-primary border border-primary/40' : ''}
                ${!picked && hit ? 'bg-muted text-muted-foreground border border-accent/20' : ''}
                ${!picked && !hit ? 'mine-cell' : ''}
              `}>{n}</button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default KenoGame;
