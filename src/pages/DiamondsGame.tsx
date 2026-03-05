import React, { useState } from 'react';
import BetControls from '@/components/BetControls';
import { useGameState } from '@/hooks/useGameState';
import { Diamond } from 'lucide-react';

const GEMS = ['💎', '🔷', '🟣', '🟡', '🔴'];

const DiamondsGame: React.FC = () => {
  const { balance, placeBet } = useGameState();
  const [betAmount, setBetAmount] = useState(100);
  const [gems, setGems] = useState<string[]>([]);
  const [playing, setPlaying] = useState(false);
  const [result, setResult] = useState<{ matches: number; mult: number } | null>(null);

  const play = () => {
    if (betAmount > balance || playing) return;
    setPlaying(true);
    setResult(null);
    setGems([]);

    const final = Array.from({ length: 5 }, () => GEMS[Math.floor(Math.random() * GEMS.length)]);

    let idx = 0;
    const interval = setInterval(() => {
      setGems(prev => [...prev, final[idx]]);
      idx++;
      if (idx >= 5) {
        clearInterval(interval);
        const counts: Record<string, number> = {};
        final.forEach(g => counts[g] = (counts[g] || 0) + 1);
        const maxMatch = Math.max(...Object.values(counts));
        const payouts: Record<number, number> = { 1: 0, 2: 0.5, 3: 2, 4: 10, 5: 50 };
        const mult = payouts[maxMatch] || 0;
        setResult({ matches: maxMatch, mult });
        placeBet('Diamonds', betAmount, mult, mult > 0);
        setPlaying(false);
      }
    }, 400);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col lg:flex-row gap-6">
      <div className="w-full lg:w-72 space-y-4">
        <BetControls betAmount={betAmount} onBetChange={setBetAmount} onAction={play} actionLabel={playing ? 'Revealing...' : 'Play'} disabled={betAmount > balance || playing} maxBet={balance} />
        {result && (
          <div className="glass-elevated rounded-xl p-4 text-center">
            <p className="text-xs text-muted-foreground">{result.matches} matching gems</p>
            <p className={`text-2xl font-black ${result.mult > 0 ? 'neon-text-green' : 'text-destructive'}`}>{result.mult > 0 ? `${result.mult}× — $${(betAmount * result.mult).toFixed(2)}` : 'No match'}</p>
          </div>
        )}
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="flex gap-3">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="w-20 h-24 glass-elevated rounded-xl flex items-center justify-center text-4xl transition-all">
              {gems[i] || <Diamond className="w-8 h-8 text-muted-foreground/30" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DiamondsGame;
