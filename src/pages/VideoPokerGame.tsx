import React, { useState } from 'react';
import BetControls from '@/components/BetControls';
import { useGameState } from '@/hooks/useGameState';

const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];

interface Card { rank: string; suit: string; }
const newDeck = (): Card[] => SUITS.flatMap(s => RANKS.map(r => ({ rank: r, suit: s })));
const shuffle = (d: Card[]) => { for (let i = d.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [d[i], d[j]] = [d[j], d[i]]; } return d; };

function evaluate(hand: Card[]): { name: string; mult: number } {
  const ranks = hand.map(c => RANKS.indexOf(c.rank)).sort((a, b) => a - b);
  const suits = hand.map(c => c.suit);
  const isFlush = suits.every(s => s === suits[0]);
  const isStraight = ranks.every((r, i) => i === 0 || r === ranks[i - 1] + 1);
  const counts: Record<number, number> = {};
  ranks.forEach(r => counts[r] = (counts[r] || 0) + 1);
  const vals = Object.values(counts).sort((a, b) => b - a);

  if (isFlush && isStraight && ranks[4] === 12) return { name: 'Royal Flush', mult: 250 };
  if (isFlush && isStraight) return { name: 'Straight Flush', mult: 50 };
  if (vals[0] === 4) return { name: 'Four of a Kind', mult: 25 };
  if (vals[0] === 3 && vals[1] === 2) return { name: 'Full House', mult: 9 };
  if (isFlush) return { name: 'Flush', mult: 6 };
  if (isStraight) return { name: 'Straight', mult: 4 };
  if (vals[0] === 3) return { name: 'Three of a Kind', mult: 3 };
  if (vals[0] === 2 && vals[1] === 2) return { name: 'Two Pair', mult: 2 };
  if (vals[0] === 2 && ranks.some(r => r >= 10)) return { name: 'Jacks or Better', mult: 1 };
  return { name: 'No Hand', mult: 0 };
}

const VideoPokerGame: React.FC = () => {
  const { balance, placeBet } = useGameState();
  const [betAmount, setBetAmount] = useState(100);
  const [hand, setHand] = useState<Card[]>([]);
  const [held, setHeld] = useState<Set<number>>(new Set());
  const [deck, setDeck] = useState<Card[]>([]);
  const [phase, setPhase] = useState<'bet' | 'hold' | 'result'>('bet');
  const [result, setResult] = useState<{ name: string; mult: number } | null>(null);

  const deal = () => {
    if (betAmount > balance) return;
    const d = shuffle(newDeck());
    setHand(d.slice(0, 5));
    setDeck(d.slice(5));
    setHeld(new Set());
    setPhase('hold');
    setResult(null);
  };

  const draw = () => {
    const newHand = [...hand];
    let deckIdx = 0;
    for (let i = 0; i < 5; i++) {
      if (!held.has(i)) { newHand[i] = deck[deckIdx++]; }
    }
    setHand(newHand);
    const res = evaluate(newHand);
    setResult(res);
    setPhase('result');
    placeBet('Video Poker', betAmount, res.mult, res.mult > 0);
  };

  const toggleHold = (i: number) => {
    if (phase !== 'hold') return;
    const next = new Set(held);
    next.has(i) ? next.delete(i) : next.add(i);
    setHeld(next);
  };

  const isRed = (s: string) => s === '♥' || s === '♦';

  return (
    <div className="max-w-4xl mx-auto flex flex-col lg:flex-row gap-6">
      <div className="w-full lg:w-72 space-y-4">
        <BetControls betAmount={betAmount} onBetChange={setBetAmount} onAction={phase === 'hold' ? draw : deal} actionLabel={phase === 'hold' ? 'Draw' : phase === 'result' ? 'New Deal' : 'Deal'} disabled={phase === 'bet' && betAmount > balance} maxBet={balance} />
        {result && <div className="glass-elevated rounded-xl p-4 text-center"><p className="text-lg font-bold neon-text-gold">{result.name}</p><p className={`text-2xl font-black ${result.mult > 0 ? 'neon-text-green' : 'text-destructive'}`}>{result.mult > 0 ? `${result.mult}× — $${(betAmount * result.mult).toFixed(2)}` : 'No win'}</p></div>}
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="flex gap-3">
          {hand.length > 0 ? hand.map((card, i) => (
            <button key={i} onClick={() => toggleHold(i)} className={`w-20 h-32 rounded-xl glass-elevated flex flex-col items-center justify-center gap-1 click-glow transition-all ${held.has(i) ? 'ring-2 ring-accent neon-glow-green' : ''}`}>
              <span className={`text-3xl font-black ${isRed(card.suit) ? 'text-red-500' : 'text-foreground'}`}>{card.rank}</span>
              <span className={`text-2xl ${isRed(card.suit) ? 'text-red-500' : 'text-foreground'}`}>{card.suit}</span>
              {held.has(i) && <span className="text-[10px] text-accent font-bold">HELD</span>}
            </button>
          )) : Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="w-20 h-32 rounded-xl mine-cell flex items-center justify-center text-2xl text-muted-foreground/30">?</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideoPokerGame;
