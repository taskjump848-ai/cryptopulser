import React, { useState } from 'react';
import BetControls from '@/components/BetControls';
import { useGameState } from '@/hooks/useGameState';

const SEGMENTS = [
  { label: '0×', mult: 0, color: 'bg-destructive/40' },
  { label: '1.2×', mult: 1.2, color: 'bg-secondary' },
  { label: '1.5×', mult: 1.5, color: 'bg-primary/30' },
  { label: '0×', mult: 0, color: 'bg-destructive/40' },
  { label: '2×', mult: 2, color: 'bg-accent/30' },
  { label: '1.2×', mult: 1.2, color: 'bg-secondary' },
  { label: '0×', mult: 0, color: 'bg-destructive/40' },
  { label: '3×', mult: 3, color: 'bg-accent/50' },
  { label: '1.5×', mult: 1.5, color: 'bg-primary/30' },
  { label: '0×', mult: 0, color: 'bg-destructive/40' },
  { label: '5×', mult: 5, color: 'bg-primary/50' },
  { label: '1.2×', mult: 1.2, color: 'bg-secondary' },
];

const WheelGame: React.FC = () => {
  const { balance, placeBet } = useGameState();
  const [betAmount, setBetAmount] = useState(100);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<typeof SEGMENTS[0] | null>(null);

  const spin = () => {
    if (betAmount > balance || spinning) return;
    setSpinning(true);
    setResult(null);
    const idx = Math.floor(Math.random() * SEGMENTS.length);
    const newRotation = rotation + 360 * 5 + (idx * (360 / SEGMENTS.length));
    setRotation(newRotation);

    setTimeout(() => {
      const seg = SEGMENTS[idx];
      setResult(seg);
      placeBet('Wheel', betAmount, seg.mult, seg.mult > 0);
      setSpinning(false);
    }, 3000);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col lg:flex-row gap-6">
      <div className="w-full lg:w-72 space-y-4">
        <BetControls betAmount={betAmount} onBetChange={setBetAmount} onAction={spin} actionLabel={spinning ? 'Spinning...' : 'Spin Wheel'} disabled={betAmount > balance || spinning} maxBet={balance} />
        {result && (
          <div className="glass-elevated rounded-xl p-4 text-center">
            <p className={`text-3xl font-black ${result.mult > 0 ? 'neon-text-green' : 'text-destructive'}`}>{result.label}</p>
            <p className="text-sm text-muted-foreground">{result.mult > 0 ? `Won $${(betAmount * result.mult).toFixed(2)}` : 'No win'}</p>
          </div>
        )}
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="relative">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 text-primary text-3xl">▼</div>
          <div className="w-72 h-72 rounded-full glass-elevated overflow-hidden transition-transform ease-out" style={{ transform: `rotate(${rotation}deg)`, transitionDuration: spinning ? '3s' : '0s' }}>
            <div className="w-full h-full relative">
              {SEGMENTS.map((seg, i) => (
                <div key={i} className={`absolute w-full h-full flex items-start justify-center pt-4`} style={{ transform: `rotate(${i * (360 / SEGMENTS.length)}deg)` }}>
                  <span className="text-xs font-bold text-foreground">{seg.label}</span>
                </div>
              ))}
              <div className="absolute inset-0 rounded-full border-4 border-primary/30" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WheelGame;
