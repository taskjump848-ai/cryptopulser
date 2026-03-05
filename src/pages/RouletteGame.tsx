import React, { useState } from 'react';
import BetControls from '@/components/BetControls';
import { useGameState } from '@/hooks/useGameState';

type BetType = 'red' | 'black' | 'green';
const COLORS: Record<number, BetType> = { 0: 'green' };
for (let i = 1; i <= 36; i++) COLORS[i] = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(i) ? 'red' : 'black';

const RouletteGame: React.FC = () => {
  const { balance, placeBet } = useGameState();
  const [betAmount, setBetAmount] = useState(100);
  const [betColor, setBetColor] = useState<BetType>('red');
  const [result, setResult] = useState<number | null>(null);
  const [won, setWon] = useState<boolean | null>(null);
  const [spinning, setSpinning] = useState(false);

  const spin = () => {
    if (betAmount > balance || spinning) return;
    setSpinning(true);
    setResult(null);
    setWon(null);

    setTimeout(() => {
      const r = Math.floor(Math.random() * 37);
      const color = COLORS[r];
      const isWin = color === betColor;
      const mult = betColor === 'green' ? 35 : 2;
      setResult(r);
      setWon(isWin);
      placeBet('Roulette', betAmount, isWin ? mult : 0, isWin);
      setSpinning(false);
    }, 1500);
  };

  const colorClass = (c: BetType) => c === 'red' ? 'bg-red-600' : c === 'black' ? 'bg-gray-900' : 'bg-green-600';

  return (
    <div className="max-w-4xl mx-auto flex flex-col lg:flex-row gap-6">
      <div className="w-full lg:w-72 space-y-4">
        <BetControls betAmount={betAmount} onBetChange={setBetAmount} onAction={spin} actionLabel={spinning ? 'Spinning...' : 'Spin'} disabled={betAmount > balance || spinning} maxBet={balance} />
        <div className="glass-elevated rounded-xl p-4 space-y-3">
          <label className="text-xs text-muted-foreground uppercase tracking-wider">Bet On</label>
          <div className="flex gap-2">
            {(['red', 'black', 'green'] as BetType[]).map(c => (
              <button key={c} onClick={() => setBetColor(c)} className={`flex-1 py-3 rounded-lg font-bold text-sm click-glow capitalize text-white ${colorClass(c)} ${betColor === c ? 'ring-2 ring-primary' : 'opacity-60'}`}>{c}{c === 'green' ? ' (35×)' : ' (2×)'}</button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="glass-elevated rounded-2xl p-16 text-center space-y-6 w-full max-w-md">
          <div className={`w-28 h-28 rounded-full mx-auto flex items-center justify-center text-5xl font-black text-white ${result !== null ? colorClass(COLORS[result]) : 'bg-secondary'}`}>
            {result !== null ? result : '?'}
          </div>
          {won !== null && <p className={`text-xl font-bold ${won ? 'neon-text-green' : 'text-destructive'}`}>{won ? `Won $${(betAmount * (betColor === 'green' ? 35 : 2)).toFixed(2)}!` : 'No luck!'}</p>}
        </div>
      </div>
    </div>
  );
};

export default RouletteGame;
