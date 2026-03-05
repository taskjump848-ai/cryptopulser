import React, { useState } from 'react';
import BetControls from '@/components/BetControls';
import { useGameState } from '@/hooks/useGameState';

const CARDS = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
const cardValue = (c: string) => CARDS.indexOf(c);

const HiLoGame: React.FC = () => {
  const { balance, placeBet } = useGameState();
  const [betAmount, setBetAmount] = useState(100);
  const [currentCard, setCurrentCard] = useState(CARDS[Math.floor(Math.random() * 13)]);
  const [nextCard, setNextCard] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [lost, setLost] = useState(false);

  const multiplier = Math.max(1, 1 + streak * 0.5);

  const startGame = () => {
    if (betAmount > balance || betAmount <= 0) return;
    setCurrentCard(CARDS[Math.floor(Math.random() * 13)]);
    setNextCard(null);
    setStreak(0);
    setGameActive(true);
    setLost(false);
  };

  const guess = (higher: boolean) => {
    if (!gameActive) return;
    const next = CARDS[Math.floor(Math.random() * 13)];
    setNextCard(next);
    const isHigher = cardValue(next) >= cardValue(currentCard);
    const correct = higher ? isHigher : !isHigher;

    if (correct) {
      setStreak(s => s + 1);
      setTimeout(() => { setCurrentCard(next); setNextCard(null); }, 800);
    } else {
      setLost(true);
      setGameActive(false);
      placeBet('HiLo', betAmount, 0, false);
    }
  };

  const cashout = () => {
    if (!gameActive || streak === 0) return;
    placeBet('HiLo', betAmount, multiplier, true);
    setGameActive(false);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col lg:flex-row gap-6">
      <div className="w-full lg:w-72 space-y-4">
        <BetControls betAmount={betAmount} onBetChange={setBetAmount} onAction={gameActive ? cashout : startGame} actionLabel={gameActive ? `Cashout $${(betAmount * multiplier).toFixed(0)}` : 'Start Game'} disabled={!gameActive && (betAmount > balance || betAmount <= 0)} maxBet={balance} />
        {gameActive && <div className="glass-elevated rounded-xl p-4 text-center"><p className="text-xs text-muted-foreground">Streak</p><p className="text-3xl font-black neon-text-green">{streak}</p><p className="text-xs text-muted-foreground">{multiplier.toFixed(2)}×</p></div>}
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="space-y-8 text-center">
          <div className="flex gap-8 items-center justify-center">
            <div className="w-32 h-48 glass-elevated rounded-2xl flex items-center justify-center text-5xl font-black neon-text-gold">{currentCard}</div>
            {nextCard && <div className={`w-32 h-48 glass-elevated rounded-2xl flex items-center justify-center text-5xl font-black ${lost ? 'text-destructive' : 'neon-text-green'}`}>{nextCard}</div>}
          </div>
          {gameActive && !nextCard && (
            <div className="flex gap-4 justify-center">
              <button onClick={() => guess(true)} className="px-8 py-4 rounded-xl glass-elevated text-lg font-bold neon-text-green click-glow hover:neon-glow-green">↑ Higher</button>
              <button onClick={() => guess(false)} className="px-8 py-4 rounded-xl glass-elevated text-lg font-bold text-destructive click-glow">↓ Lower</button>
            </div>
          )}
          {lost && <p className="text-xl font-bold text-destructive">Wrong guess! You lost ${betAmount}</p>}
        </div>
      </div>
    </div>
  );
};

export default HiLoGame;
