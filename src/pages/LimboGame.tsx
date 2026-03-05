import React, { useState } from 'react';
import BetControls from '@/components/BetControls';
import { useGameState } from '@/hooks/useGameState';

const LimboGame: React.FC = () => {
  const { balance, placeBet } = useGameState();
  const [betAmount, setBetAmount] = useState(100);
  const [targetMultiplier, setTargetMultiplier] = useState(2);
  const [result, setResult] = useState<number | null>(null);
  const [won, setWon] = useState<boolean | null>(null);
  const [playing, setPlaying] = useState(false);

  const play = () => {
    if (betAmount > balance || betAmount <= 0 || playing) return;
    setPlaying(true);
    setResult(null);
    setWon(null);

    setTimeout(() => {
      const crash = 0.99 / (1 - Math.random());
      const clampedResult = Math.min(parseFloat(crash.toFixed(2)), 1000);
      const isWin = clampedResult >= targetMultiplier;
      setResult(clampedResult);
      setWon(isWin);
      placeBet('Limbo', betAmount, isWin ? targetMultiplier : 0, isWin);
      setPlaying(false);
    }, 500);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col lg:flex-row gap-6">
      <div className="w-full lg:w-72 space-y-4">
        <BetControls betAmount={betAmount} onBetChange={setBetAmount} onAction={play} actionLabel={playing ? 'Playing...' : 'Play'} disabled={betAmount > balance || betAmount <= 0 || playing} maxBet={balance} />
        <div className="glass-elevated rounded-xl p-4 space-y-3">
          <label className="text-xs text-muted-foreground uppercase tracking-wider">Target Multiplier</label>
          <input type="number" min={1.01} max={1000} step={0.1} value={targetMultiplier} onChange={e => setTargetMultiplier(Number(e.target.value))} className="w-full bg-secondary rounded-lg px-3 py-2 text-center font-bold text-foreground outline-none focus:ring-1 focus:ring-primary" />
          <p className="text-xs text-muted-foreground text-center">Win chance: {((1 / targetMultiplier) * 97).toFixed(1)}%</p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="glass-elevated rounded-2xl p-16 text-center space-y-4 w-full max-w-md">
          <div className={`text-8xl font-black transition-all ${won === true ? 'neon-text-green' : won === false ? 'text-destructive' : 'neon-text-gold'}`}>
            {result !== null ? `${result}×` : '?'}
          </div>
          <p className="text-muted-foreground">Target: {targetMultiplier}×</p>
          {won !== null && <p className={`text-xl font-bold ${won ? 'neon-text-green' : 'text-destructive'}`}>{won ? `Won $${(betAmount * targetMultiplier).toFixed(2)}!` : 'Crashed below target!'}</p>}
        </div>
      </div>
    </div>
  );
};

export default LimboGame;
