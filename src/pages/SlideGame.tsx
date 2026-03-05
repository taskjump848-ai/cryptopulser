import React, { useState } from 'react';
import BetControls from '@/components/BetControls';
import { useGameState } from '@/hooks/useGameState';

const SlideGame: React.FC = () => {
  const { balance, placeBet } = useGameState();
  const [betAmount, setBetAmount] = useState(100);
  const [target, setTarget] = useState(2);
  const [result, setResult] = useState<number | null>(null);
  const [won, setWon] = useState<boolean | null>(null);
  const [playing, setPlaying] = useState(false);

  const play = () => {
    if (betAmount > balance || playing) return;
    setPlaying(true);
    setResult(null);
    setWon(null);

    setTimeout(() => {
      const r = parseFloat((1 + Math.random() * 9).toFixed(2));
      const isWin = r >= target;
      setResult(r);
      setWon(isWin);
      placeBet('Slide', betAmount, isWin ? target : 0, isWin);
      setPlaying(false);
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col lg:flex-row gap-6">
      <div className="w-full lg:w-72 space-y-4">
        <BetControls betAmount={betAmount} onBetChange={setBetAmount} onAction={play} actionLabel={playing ? 'Sliding...' : 'Slide'} disabled={betAmount > balance || playing} maxBet={balance} />
        <div className="glass-elevated rounded-xl p-4 space-y-3">
          <label className="text-xs text-muted-foreground uppercase tracking-wider">Target Multiplier</label>
          <input type="range" min={1.1} max={10} step={0.1} value={target} onChange={e => setTarget(Number(e.target.value))} className="w-full accent-primary" />
          <p className="text-center font-bold neon-text-gold">{target.toFixed(1)}×</p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="glass-elevated rounded-2xl p-16 text-center w-full max-w-md space-y-6">
          <div className="h-4 bg-secondary rounded-full overflow-hidden relative">
            {result !== null && <div className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ${won ? 'bg-accent' : 'bg-destructive'}`} style={{ width: `${Math.min(100, (result / 10) * 100)}%` }} />}
            <div className="absolute inset-y-0 w-0.5 bg-primary" style={{ left: `${(target / 10) * 100}%` }} />
          </div>
          <div className={`text-7xl font-black ${won === true ? 'neon-text-green' : won === false ? 'text-destructive' : 'neon-text-gold'}`}>
            {result !== null ? `${result}×` : '?'}
          </div>
          {won !== null && <p className={`text-lg font-bold ${won ? 'neon-text-green' : 'text-destructive'}`}>{won ? `Won $${(betAmount * target).toFixed(2)}!` : 'Too low!'}</p>}
        </div>
      </div>
    </div>
  );
};

export default SlideGame;
