import React, { useState } from 'react';
import BetControls from '@/components/BetControls';
import { useGameState } from '@/hooks/useGameState';

const DiceGame: React.FC = () => {
  const { balance, placeBet } = useGameState();
  const [betAmount, setBetAmount] = useState(100);
  const [target, setTarget] = useState(50);
  const [rollOver, setRollOver] = useState(true);
  const [result, setResult] = useState<number | null>(null);
  const [won, setWon] = useState<boolean | null>(null);
  const [rolling, setRolling] = useState(false);

  const winChance = rollOver ? 100 - target : target;
  const multiplier = Math.max(1.01, (99 / winChance) * 0.97);

  const roll = () => {
    if (betAmount > balance || betAmount <= 0 || rolling) return;
    setRolling(true);
    setResult(null);
    setWon(null);

    setTimeout(() => {
      const r = Math.random() * 100;
      const isWin = rollOver ? r > target : r < target;
      setResult(parseFloat(r.toFixed(2)));
      setWon(isWin);
      placeBet('Dice', betAmount, isWin ? multiplier : 0, isWin);
      setRolling(false);
    }, 600);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col lg:flex-row gap-6">
      <div className="w-full lg:w-72 space-y-4">
        <BetControls betAmount={betAmount} onBetChange={setBetAmount} onAction={roll} actionLabel={rolling ? 'Rolling...' : 'Roll Dice'} disabled={betAmount > balance || betAmount <= 0 || rolling} maxBet={balance} />
        <div className="glass-elevated rounded-xl p-4 space-y-3">
          <div className="flex gap-2">
            <button onClick={() => setRollOver(true)} className={`flex-1 py-2 rounded-lg text-sm font-bold click-glow ${rollOver ? 'bg-accent/20 text-accent border border-accent/30' : 'bg-secondary text-muted-foreground'}`}>Over</button>
            <button onClick={() => setRollOver(false)} className={`flex-1 py-2 rounded-lg text-sm font-bold click-glow ${!rollOver ? 'bg-accent/20 text-accent border border-accent/30' : 'bg-secondary text-muted-foreground'}`}>Under</button>
          </div>
          <label className="text-xs text-muted-foreground">Target: {target}</label>
          <input type="range" min={5} max={95} value={target} onChange={e => setTarget(Number(e.target.value))} className="w-full accent-primary" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Win: {winChance.toFixed(1)}%</span>
            <span>Multi: {multiplier.toFixed(2)}×</span>
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="glass-elevated rounded-2xl p-12 text-center space-y-6 w-full max-w-md">
          <div className={`text-7xl font-black transition-all duration-300 ${won === true ? 'neon-text-green' : won === false ? 'text-destructive' : 'text-foreground'}`}>
            {result !== null ? result.toFixed(2) : '??'}
          </div>
          <div className="h-3 bg-secondary rounded-full overflow-hidden relative">
            <div className={`absolute inset-y-0 ${rollOver ? 'right-0' : 'left-0'} bg-accent/40 rounded-full`} style={{ width: `${winChance}%` }} />
            {result !== null && <div className="absolute top-0 bottom-0 w-1 bg-primary rounded-full" style={{ left: `${result}%` }} />}
          </div>
          <p className="text-sm text-muted-foreground">Roll {rollOver ? 'over' : 'under'} {target} to win</p>
          {won !== null && <p className={`text-lg font-bold ${won ? 'neon-text-green' : 'text-destructive'}`}>{won ? `Won $${(betAmount * multiplier).toFixed(2)}!` : 'Lost!'}</p>}
        </div>
      </div>
    </div>
  );
};

export default DiceGame;
