import React from 'react';

interface Props {
  betAmount: number;
  onBetChange: (v: number) => void;
  onAction: () => void;
  actionLabel: string;
  disabled?: boolean;
  maxBet?: number;
}

const BetControls: React.FC<Props> = ({ betAmount, onBetChange, onAction, actionLabel, disabled, maxBet = 100000 }) => {
  const presets = [100, 500, 1000, 5000];

  return (
    <div className="glass-elevated rounded-xl p-4 space-y-3">
      <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Bet Amount</label>
      <div className="flex items-center gap-2">
        <button onClick={() => onBetChange(Math.max(10, betAmount / 2))} className="px-3 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium click-glow">½</button>
        <input
          type="number"
          min={10}
          max={maxBet}
          value={betAmount}
          onChange={e => onBetChange(Number(e.target.value))}
          className="flex-1 bg-secondary rounded-lg px-3 py-2 text-center font-bold text-foreground text-sm outline-none focus:ring-1 focus:ring-primary"
        />
        <button onClick={() => onBetChange(Math.min(maxBet, betAmount * 2))} className="px-3 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium click-glow">2×</button>
      </div>
      <div className="flex gap-2">
        {presets.map(p => (
          <button key={p} onClick={() => onBetChange(p)} className={`flex-1 py-1.5 rounded-lg text-xs font-medium click-glow ${betAmount === p ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-secondary text-muted-foreground'}`}>
            ${p}
          </button>
        ))}
      </div>
      <button
        onClick={onAction}
        disabled={disabled}
        className="w-full py-3 rounded-xl font-bold text-sm tracking-wider uppercase click-glow transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-primary text-primary-foreground hover:brightness-110 neon-glow-gold"
      >
        {actionLabel}
      </button>
    </div>
  );
};

export default BetControls;
