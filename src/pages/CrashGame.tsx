import React, { useState, useRef, useEffect } from 'react';
import BetControls from '@/components/BetControls';
import { useGameState } from '@/hooks/useGameState';

const CrashGame: React.FC = () => {
  const { balance, placeBet } = useGameState();
  const [betAmount, setBetAmount] = useState(100);
  const [multiplier, setMultiplier] = useState(1);
  const [crashed, setCrashed] = useState(false);
  const [cashedOut, setCashedOut] = useState(false);
  const [gameActive, setGameActive] = useState(false);
  const [crashPoint, setCrashPoint] = useState(0);
  const intervalRef = useRef<number>(0);

  const start = () => {
    if (betAmount > balance) return;
    const cp = parseFloat((1 + (0.99 / Math.random() - 0.99)).toFixed(2));
    setCrashPoint(Math.min(cp, 100));
    setMultiplier(1);
    setCrashed(false);
    setCashedOut(false);
    setGameActive(true);
  };

  useEffect(() => {
    if (!gameActive || crashed || cashedOut) return;
    intervalRef.current = window.setInterval(() => {
      setMultiplier(prev => {
        const next = parseFloat((prev + 0.01 * prev).toFixed(2));
        if (next >= crashPoint) {
          clearInterval(intervalRef.current);
          setCrashed(true);
          setGameActive(false);
          placeBet('Crash', betAmount, 0, false);
          return crashPoint;
        }
        return next;
      });
    }, 50);
    return () => clearInterval(intervalRef.current);
  }, [gameActive, crashed, cashedOut, crashPoint, betAmount, placeBet]);

  const cashout = () => {
    if (!gameActive || crashed) return;
    clearInterval(intervalRef.current);
    setCashedOut(true);
    setGameActive(false);
    placeBet('Crash', betAmount, multiplier, true);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col lg:flex-row gap-6">
      <div className="w-full lg:w-72 space-y-4">
        <BetControls betAmount={betAmount} onBetChange={setBetAmount} onAction={gameActive ? cashout : start} actionLabel={gameActive ? `Cashout $${(betAmount * multiplier).toFixed(0)}` : 'Start'} disabled={!gameActive && betAmount > balance} maxBet={balance} />
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="glass-elevated rounded-2xl p-16 text-center w-full max-w-md space-y-4">
          <div className={`text-8xl font-black transition-colors ${crashed ? 'text-destructive' : cashedOut ? 'neon-text-green' : 'neon-text-gold'}`}>
            {multiplier.toFixed(2)}×
          </div>
          {crashed && <p className="text-xl font-bold text-destructive">CRASHED!</p>}
          {cashedOut && <p className="text-xl font-bold neon-text-green">Cashed out ${ (betAmount * multiplier).toFixed(2)}!</p>}
          {!gameActive && !crashed && !cashedOut && <p className="text-muted-foreground">Place bet and start</p>}
        </div>
      </div>
    </div>
  );
};

export default CrashGame;
