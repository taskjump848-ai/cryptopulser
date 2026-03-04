import React, { useState, useCallback } from 'react';
import BetControls from '@/components/BetControls';
import { useGameState } from '@/hooks/useGameState';
import { Diamond, Bomb } from 'lucide-react';

const GRID_SIZE = 5;
const TOTAL_CELLS = GRID_SIZE * GRID_SIZE;

const MinesGame: React.FC = () => {
  const { balance, placeBet } = useGameState();
  const [betAmount, setBetAmount] = useState(100);
  const [mineCount, setMineCount] = useState(5);
  const [gameActive, setGameActive] = useState(false);
  const [mines, setMines] = useState<Set<number>>(new Set());
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [gameOver, setGameOver] = useState(false);
  const [hitMine, setHitMine] = useState(false);

  const multiplier = useCallback(() => {
    if (revealed.size === 0) return 1;
    const safe = TOTAL_CELLS - mineCount;
    let mult = 1;
    for (let i = 0; i < revealed.size; i++) {
      mult *= (safe - i) / (TOTAL_CELLS - i);
    }
    return 0.97 / mult;
  }, [revealed.size, mineCount]);

  const startGame = () => {
    if (betAmount > balance || betAmount <= 0) return;
    const mineSet = new Set<number>();
    while (mineSet.size < mineCount) {
      mineSet.add(Math.floor(Math.random() * TOTAL_CELLS));
    }
    setMines(mineSet);
    setRevealed(new Set());
    setGameActive(true);
    setGameOver(false);
    setHitMine(false);
  };

  const cashout = () => {
    if (!gameActive || revealed.size === 0) return;
    const mult = multiplier();
    placeBet('Mines', betAmount, mult, true);
    setGameActive(false);
    setGameOver(true);
  };

  const revealCell = (idx: number) => {
    if (!gameActive || revealed.has(idx) || gameOver) return;
    const newRevealed = new Set(revealed);
    newRevealed.add(idx);
    setRevealed(newRevealed);

    if (mines.has(idx)) {
      setHitMine(true);
      setGameActive(false);
      setGameOver(true);
      placeBet('Mines', betAmount, 0, false);
    }
  };

  const currentMult = multiplier();

  return (
    <div className="max-w-4xl mx-auto flex flex-col lg:flex-row gap-6">
      {/* Controls */}
      <div className="w-full lg:w-72 space-y-4">
        <BetControls
          betAmount={betAmount}
          onBetChange={setBetAmount}
          onAction={gameActive ? cashout : startGame}
          actionLabel={gameActive ? `Cashout ₹${(betAmount * currentMult).toFixed(0)}` : 'Start Game'}
          disabled={!gameActive && (betAmount > balance || betAmount <= 0)}
          maxBet={balance}
        />
        <div className="glass-elevated rounded-xl p-4 space-y-3">
          <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Mines</label>
          <div className="flex gap-2">
            {[3, 5, 7, 10].map(n => (
              <button
                key={n}
                disabled={gameActive}
                onClick={() => setMineCount(n)}
                className={`flex-1 py-2 rounded-lg text-sm font-bold click-glow ${mineCount === n ? 'bg-destructive/20 text-destructive border border-destructive/30' : 'bg-secondary text-muted-foreground'} disabled:opacity-40`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
        {gameActive && revealed.size > 0 && (
          <div className="glass-elevated rounded-xl p-4 text-center">
            <p className="text-xs text-muted-foreground">Current Multiplier</p>
            <p className="text-2xl font-black neon-text-green">{currentMult.toFixed(2)}×</p>
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="flex-1 flex items-center justify-center">
        <div className="grid grid-cols-5 gap-2 w-full max-w-md aspect-square">
          {Array.from({ length: TOTAL_CELLS }, (_, i) => {
            const isRevealed = revealed.has(i);
            const isMine = mines.has(i);
            const showAll = gameOver && !hitMine;
            const showMinesOnLoss = gameOver && hitMine;

            return (
              <button
                key={i}
                onClick={() => revealCell(i)}
                disabled={!gameActive || isRevealed}
                className={`mine-cell rounded-xl aspect-square flex items-center justify-center text-2xl font-bold click-glow
                  ${isRevealed && isMine ? 'revealed bomb' : ''}
                  ${isRevealed && !isMine ? 'revealed diamond' : ''}
                  ${showMinesOnLoss && isMine && !isRevealed ? 'revealed bomb opacity-60' : ''}
                  ${!gameActive && !isRevealed && !showMinesOnLoss ? 'opacity-50' : ''}
                `}
              >
                {(isRevealed || (showMinesOnLoss && isMine)) && (
                  isMine
                    ? <Bomb className="w-6 h-6 text-destructive" />
                    : <Diamond className="w-6 h-6 text-accent" />
                )}
                {showAll && !isRevealed && isMine && <Bomb className="w-5 h-5 text-destructive/50" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MinesGame;
