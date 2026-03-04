import React, { useState } from 'react';
import BetControls from '@/components/BetControls';
import { useGameState } from '@/hooks/useGameState';
import { Star, Skull } from 'lucide-react';

const TOWER_ROWS = 8;
const COLS = 3;

interface TowerRow {
  safe: number[]; // indices of safe tiles
}

const TowerGame: React.FC = () => {
  const { balance, placeBet } = useGameState();
  const [betAmount, setBetAmount] = useState(100);
  const [gameActive, setGameActive] = useState(false);
  const [tower, setTower] = useState<TowerRow[]>([]);
  const [currentRow, setCurrentRow] = useState(0);
  const [revealed, setRevealed] = useState<Map<number, number>>(new Map()); // row -> chosen col
  const [gameOver, setGameOver] = useState(false);
  const [hitTrap, setHitTrap] = useState(false);

  const multiplierForRow = (row: number) => {
    return Number((1.4 ** (row + 1)).toFixed(2));
  };

  const startGame = () => {
    if (betAmount > balance || betAmount <= 0) return;
    // Generate tower: each row has 2 safe tiles out of 3
    const newTower: TowerRow[] = [];
    for (let i = 0; i < TOWER_ROWS; i++) {
      const trap = Math.floor(Math.random() * COLS);
      const safe = [0, 1, 2].filter(c => c !== trap);
      newTower.push({ safe });
    }
    setTower(newTower);
    setCurrentRow(0);
    setRevealed(new Map());
    setGameActive(true);
    setGameOver(false);
    setHitTrap(false);
  };

  const cashout = () => {
    if (!gameActive || currentRow === 0) return;
    const mult = multiplierForRow(currentRow - 1);
    placeBet('Tower', betAmount, mult, true);
    setGameActive(false);
    setGameOver(true);
  };

  const selectTile = (row: number, col: number) => {
    if (!gameActive || row !== currentRow || gameOver) return;

    const newRevealed = new Map(revealed);
    newRevealed.set(row, col);
    setRevealed(newRevealed);

    if (!tower[row].safe.includes(col)) {
      // Hit trap
      setHitTrap(true);
      setGameActive(false);
      setGameOver(true);
      placeBet('Tower', betAmount, 0, false);
    } else {
      // Safe
      if (row === TOWER_ROWS - 1) {
        // Reached top!
        const mult = multiplierForRow(row);
        placeBet('Tower', betAmount, mult, true);
        setGameActive(false);
        setGameOver(true);
      } else {
        setCurrentRow(row + 1);
      }
    }
  };

  const currentMult = currentRow > 0 ? multiplierForRow(currentRow - 1) : 1;

  return (
    <div className="max-w-4xl mx-auto flex flex-col lg:flex-row gap-6">
      <div className="w-full lg:w-72 space-y-4">
        <BetControls
          betAmount={betAmount}
          onBetChange={setBetAmount}
          onAction={gameActive ? cashout : startGame}
          actionLabel={gameActive && currentRow > 0 ? `Cashout ₹${(betAmount * currentMult).toFixed(0)}` : gameActive ? 'Pick a tile' : 'Start Climbing'}
          disabled={gameActive ? currentRow === 0 : (betAmount > balance || betAmount <= 0)}
          maxBet={balance}
        />
        {gameActive && currentRow > 0 && (
          <div className="glass-elevated rounded-xl p-4 text-center">
            <p className="text-xs text-muted-foreground">Current Floor</p>
            <p className="text-2xl font-black neon-text-green">{currentMult.toFixed(2)}×</p>
          </div>
        )}
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-sm space-y-2">
          {Array.from({ length: TOWER_ROWS }, (_, rowIdx) => {
            const row = TOWER_ROWS - 1 - rowIdx; // render top to bottom
            const mult = multiplierForRow(row);
            const isCurrentRow = row === currentRow && gameActive;
            const isRevealed = revealed.has(row);
            const chosenCol = revealed.get(row);
            const isSafe = isRevealed && tower[row]?.safe.includes(chosenCol!);
            const isPast = row < currentRow;

            return (
              <div key={row} className="flex items-center gap-2">
                <span className={`w-14 text-right text-xs font-mono ${isCurrentRow ? 'neon-text-gold' : 'text-muted-foreground'}`}>
                  {mult}×
                </span>
                <div className="flex gap-2 flex-1">
                  {Array.from({ length: COLS }, (_, col) => {
                    const chosen = chosenCol === col;
                    const showTrap = gameOver && hitTrap && row === currentRow - (isPast ? 0 : 0) && isRevealed && !tower[row]?.safe.includes(col) && chosen;
                    const showSafe = (isRevealed && chosen && isSafe);
                    const showAllTraps = gameOver && hitTrap && row >= currentRow && !tower[row]?.safe.includes(col);

                    return (
                      <button
                        key={col}
                        onClick={() => selectTile(row, col)}
                        disabled={!gameActive || row !== currentRow}
                        className={`flex-1 h-12 rounded-lg flex items-center justify-center click-glow transition-all
                          ${isCurrentRow ? 'mine-cell border-primary/30 hover:border-primary/60 hover:neon-glow-gold cursor-pointer' : 'mine-cell opacity-50'}
                          ${showSafe ? 'revealed diamond' : ''}
                          ${(showTrap || (showAllTraps && !chosen)) ? 'revealed bomb' : ''}
                          ${isPast && chosen && isSafe ? 'revealed diamond' : ''}
                        `}
                      >
                        {showSafe || (isPast && chosen && isSafe) ? <Star className="w-5 h-5 text-accent" /> : null}
                        {(showTrap || (showAllTraps && !chosen)) ? <Skull className="w-5 h-5 text-destructive opacity-50" /> : null}
                        {chosen && !isSafe && isRevealed ? <Skull className="w-5 h-5 text-destructive" /> : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TowerGame;
