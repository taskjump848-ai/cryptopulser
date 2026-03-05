import React, { useState } from 'react';
import BetControls from '@/components/BetControls';
import { useGameState } from '@/hooks/useGameState';
import { Flame } from 'lucide-react';

const COLS = 4;
const ROWS = 8;

const DragonTowerGame: React.FC = () => {
  const { balance, placeBet } = useGameState();
  const [betAmount, setBetAmount] = useState(100);
  const [gameActive, setGameActive] = useState(false);
  const [dragons, setDragons] = useState<number[]>([]);
  const [currentRow, setCurrentRow] = useState(0);
  const [revealed, setRevealed] = useState<Map<number, boolean>>(new Map());
  const [gameOver, setGameOver] = useState(false);

  const multiplier = 1 + currentRow * 0.6;

  const start = () => {
    if (betAmount > balance) return;
    const d = Array.from({ length: ROWS }, () => Math.floor(Math.random() * COLS));
    setDragons(d);
    setCurrentRow(0);
    setRevealed(new Map());
    setGameActive(true);
    setGameOver(false);
  };

  const pick = (row: number, col: number) => {
    if (!gameActive || row !== currentRow) return;
    const key = row * COLS + col;
    const isDragon = dragons[row] === col;
    const newRevealed = new Map(revealed);
    newRevealed.set(key, isDragon);
    setRevealed(newRevealed);

    if (isDragon) {
      setGameActive(false);
      setGameOver(true);
      placeBet('Dragon Tower', betAmount, 0, false);
    } else {
      setCurrentRow(currentRow + 1);
      if (currentRow + 1 >= ROWS) {
        setGameActive(false);
        setGameOver(true);
        placeBet('Dragon Tower', betAmount, multiplier + 0.6, true);
      }
    }
  };

  const cashout = () => {
    if (!gameActive || currentRow === 0) return;
    placeBet('Dragon Tower', betAmount, multiplier, true);
    setGameActive(false);
    setGameOver(true);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col lg:flex-row gap-6">
      <div className="w-full lg:w-72 space-y-4">
        <BetControls betAmount={betAmount} onBetChange={setBetAmount} onAction={gameActive ? cashout : start} actionLabel={gameActive ? `Cashout $${(betAmount * multiplier).toFixed(0)}` : 'Start'} disabled={!gameActive && betAmount > balance} maxBet={balance} />
        {gameActive && <div className="glass-elevated rounded-xl p-4 text-center"><p className="text-xs text-muted-foreground">Floor {currentRow}/{ROWS}</p><p className="text-2xl font-black neon-text-green">{multiplier.toFixed(2)}×</p></div>}
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="space-y-1.5">
          {Array.from({ length: ROWS }, (_, row) => ROWS - 1 - row).map(row => (
            <div key={row} className="flex gap-1.5">
              {Array.from({ length: COLS }, (_, col) => {
                const key = row * COLS + col;
                const isRevealed = revealed.has(key);
                const isDragon = revealed.get(key);
                return (
                  <button key={col} onClick={() => pick(row, col)} disabled={!gameActive || row !== currentRow}
                    className={`w-16 h-12 rounded-lg font-bold text-sm click-glow transition-all
                      ${isRevealed && isDragon ? 'bg-destructive/30 border border-destructive/50' : ''}
                      ${isRevealed && !isDragon ? 'bg-accent/20 border border-accent/40' : ''}
                      ${!isRevealed && row === currentRow && gameActive ? 'mine-cell hover:border-primary/60' : ''}
                      ${!isRevealed && row !== currentRow ? 'mine-cell opacity-40' : ''}
                    `}>
                    {isRevealed ? (isDragon ? <Flame className="w-5 h-5 text-destructive mx-auto" /> : '✓') : ''}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DragonTowerGame;
