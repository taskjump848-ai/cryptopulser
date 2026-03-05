import React, { useState } from 'react';
import BetControls from '@/components/BetControls';
import { useGameState } from '@/hooks/useGameState';

const CupBallGame: React.FC = () => {
  const { balance, placeBet } = useGameState();
  const [betAmount, setBetAmount] = useState(100);
  const [ballPosition, setBallPosition] = useState(-1);
  const [guess, setGuess] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [cups, setCups] = useState(3);

  const play = (picked: number) => {
    if (betAmount > balance || revealed) return;
    const ball = Math.floor(Math.random() * cups);
    setBallPosition(ball);
    setGuess(picked);
    setRevealed(true);
    const won = picked === ball;
    placeBet('Cup & Ball', betAmount, won ? cups * 0.95 : 0, won);
  };

  const reset = () => { setRevealed(false); setGuess(null); setBallPosition(-1); };

  return (
    <div className="max-w-4xl mx-auto flex flex-col lg:flex-row gap-6">
      <div className="w-full lg:w-72 space-y-4">
        <BetControls betAmount={betAmount} onBetChange={setBetAmount} onAction={reset} actionLabel={revealed ? 'Play Again' : 'Pick a Cup!'} disabled={!revealed && betAmount > balance} maxBet={balance} />
        <div className="glass-elevated rounded-xl p-4 space-y-3">
          <label className="text-xs text-muted-foreground uppercase tracking-wider">Cups</label>
          <div className="flex gap-2">
            {[3, 4, 5].map(n => (
              <button key={n} onClick={() => { if (!revealed) setCups(n); }} className={`flex-1 py-2 rounded-lg text-sm font-bold click-glow ${cups === n ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-secondary text-muted-foreground'}`}>{n}</button>
            ))}
          </div>
          <p className="text-xs text-center text-muted-foreground">Multiplier: {(cups * 0.95).toFixed(2)}×</p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="flex gap-4">
          {Array.from({ length: cups }, (_, i) => (
            <button key={i} onClick={() => !revealed && play(i)} className={`w-24 h-32 rounded-2xl glass-elevated flex flex-col items-center justify-center gap-2 click-glow transition-all text-4xl
              ${revealed && i === ballPosition ? 'neon-glow-green border-accent/50' : ''}
              ${revealed && i === guess && i !== ballPosition ? 'border-destructive/50' : ''}
              ${!revealed ? 'hover:neon-glow-gold cursor-pointer' : ''}
            `}>
              <span>🏆</span>
              {revealed && i === ballPosition && <span className="text-sm">⚽</span>}
              {revealed && i === guess && i !== ballPosition && <span className="text-sm text-destructive">✗</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CupBallGame;
