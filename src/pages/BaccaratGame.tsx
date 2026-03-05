import React, { useState } from 'react';
import BetControls from '@/components/BetControls';
import { useGameState } from '@/hooks/useGameState';

type Side = 'player' | 'banker' | 'tie';

const drawCard = () => Math.floor(Math.random() * 10);
const handValue = (cards: number[]) => cards.reduce((a, b) => a + b, 0) % 10;

const BaccaratGame: React.FC = () => {
  const { balance, placeBet } = useGameState();
  const [betAmount, setBetAmount] = useState(100);
  const [betSide, setBetSide] = useState<Side>('player');
  const [playerCards, setPlayerCards] = useState<number[]>([]);
  const [bankerCards, setBankerCards] = useState<number[]>([]);
  const [result, setResult] = useState<string | null>(null);
  const [won, setWon] = useState<boolean | null>(null);
  const [dealing, setDealing] = useState(false);

  const deal = () => {
    if (betAmount > balance || dealing) return;
    setDealing(true);
    setResult(null);
    setWon(null);

    const p = [drawCard(), drawCard()];
    const b = [drawCard(), drawCard()];
    if (handValue(p) <= 5) p.push(drawCard());
    if (handValue(b) <= 5) b.push(drawCard());
    setPlayerCards(p);
    setBankerCards(b);

    setTimeout(() => {
      const pv = handValue(p), bv = handValue(b);
      let winner: Side = pv > bv ? 'player' : bv > pv ? 'banker' : 'tie';
      const isWin = winner === betSide;
      const mult = betSide === 'tie' ? 8 : betSide === 'banker' ? 1.95 : 2;
      setResult(`Player: ${pv} vs Banker: ${bv}`);
      setWon(isWin);
      placeBet('Baccarat', betAmount, isWin ? mult : 0, isWin);
      setDealing(false);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col lg:flex-row gap-6">
      <div className="w-full lg:w-72 space-y-4">
        <BetControls betAmount={betAmount} onBetChange={setBetAmount} onAction={deal} actionLabel={dealing ? 'Dealing...' : 'Deal'} disabled={betAmount > balance || dealing} maxBet={balance} />
        <div className="glass-elevated rounded-xl p-4 space-y-3">
          <label className="text-xs text-muted-foreground uppercase tracking-wider">Bet On</label>
          <div className="flex gap-2">
            {(['player', 'banker', 'tie'] as Side[]).map(s => (
              <button key={s} onClick={() => setBetSide(s)} className={`flex-1 py-2 rounded-lg text-sm font-bold click-glow capitalize ${betSide === s ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-secondary text-muted-foreground'}`}>{s}</button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="space-y-8 text-center">
          {playerCards.length > 0 && (
            <>
              <div><p className="text-xs text-muted-foreground mb-2">PLAYER</p><div className="flex gap-2 justify-center">{playerCards.map((c, i) => <div key={i} className="w-14 h-20 glass-elevated rounded-lg flex items-center justify-center text-2xl font-bold neon-text-gold">{c}</div>)}</div></div>
              <div><p className="text-xs text-muted-foreground mb-2">BANKER</p><div className="flex gap-2 justify-center">{bankerCards.map((c, i) => <div key={i} className="w-14 h-20 glass-elevated rounded-lg flex items-center justify-center text-2xl font-bold text-accent">{c}</div>)}</div></div>
            </>
          )}
          {result && <p className="text-lg font-bold text-foreground">{result}</p>}
          {won !== null && <p className={`text-xl font-bold ${won ? 'neon-text-green' : 'text-destructive'}`}>{won ? `Won!` : 'Lost!'}</p>}
        </div>
      </div>
    </div>
  );
};

export default BaccaratGame;
