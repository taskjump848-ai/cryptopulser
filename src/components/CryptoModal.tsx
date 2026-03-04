import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useGameState } from '@/hooks/useGameState';

const CRYPTOS = [
  { symbol: 'BTC', name: 'Bitcoin', icon: '₿' },
  { symbol: 'ETH', name: 'Ethereum', icon: 'Ξ' },
  { symbol: 'USDT', name: 'Tether', icon: '₮' },
  { symbol: 'BNB', name: 'BNB', icon: '◆' },
  { symbol: 'SOL', name: 'Solana', icon: '◎' },
  { symbol: 'XRP', name: 'Ripple', icon: '✕' },
  { symbol: 'USDC', name: 'USD Coin', icon: '$' },
  { symbol: 'ADA', name: 'Cardano', icon: '₳' },
  { symbol: 'AVAX', name: 'Avalanche', icon: 'A' },
  { symbol: 'DOGE', name: 'Dogecoin', icon: 'Ð' },
  { symbol: 'DOT', name: 'Polkadot', icon: '●' },
  { symbol: 'TRX', name: 'TRON', icon: '◈' },
  { symbol: 'MATIC', name: 'Polygon', icon: '⬡' },
  { symbol: 'LINK', name: 'Chainlink', icon: '⬡' },
  { symbol: 'TON', name: 'Toncoin', icon: '◇' },
  { symbol: 'SHIB', name: 'Shiba Inu', icon: '🐕' },
  { symbol: 'LTC', name: 'Litecoin', icon: 'Ł' },
  { symbol: 'BCH', name: 'Bitcoin Cash', icon: '₿' },
  { symbol: 'UNI', name: 'Uniswap', icon: '🦄' },
  { symbol: 'ATOM', name: 'Cosmos', icon: '⚛' },
];

interface Props {
  open: boolean;
  onClose: () => void;
  mode: 'deposit' | 'withdraw';
}

const CryptoModal: React.FC<Props> = ({ open, onClose, mode }) => {
  const { balance, setBalance } = useGameState();
  const [selected, setSelected] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<'select' | 'amount'>('select');

  const handleSelect = (symbol: string) => {
    setSelected(symbol);
    setStep('amount');
    setAmount('');
  };

  const handleConfirm = () => {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) return;
    if (mode === 'withdraw' && amt > balance) return;

    if (mode === 'deposit') {
      setBalance(balance + amt);
    } else {
      setBalance(balance - amt);
    }
    setStep('select');
    setSelected(null);
    setAmount('');
    onClose();
  };

  const handleClose = () => {
    setStep('select');
    setSelected(null);
    setAmount('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="glass-elevated border-border/30 max-w-lg">
        <DialogHeader>
          <DialogTitle className="neon-text-gold text-lg tracking-wider">
            {mode === 'deposit' ? '💰 Deposit Crypto' : '📤 Withdraw Crypto'}
          </DialogTitle>
        </DialogHeader>

        {step === 'select' ? (
          <div className="grid grid-cols-4 gap-2 max-h-80 overflow-y-auto pr-1">
            {CRYPTOS.map(crypto => (
              <button
                key={crypto.symbol}
                onClick={() => handleSelect(crypto.symbol)}
                className="flex flex-col items-center gap-1 p-3 rounded-xl mine-cell hover:border-primary/60 hover:neon-glow-gold click-glow transition-all"
              >
                <span className="text-lg">{crypto.icon}</span>
                <span className="text-xs font-bold text-foreground">{crypto.symbol}</span>
                <span className="text-[10px] text-muted-foreground">{crypto.name}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 glass rounded-xl p-3">
              <span className="text-2xl">{CRYPTOS.find(c => c.symbol === selected)?.icon}</span>
              <div>
                <p className="font-bold text-foreground">{selected}</p>
                <p className="text-xs text-muted-foreground">{CRYPTOS.find(c => c.symbol === selected)?.name}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Amount (USDT)
              </label>
              <input
                type="number"
                min={1}
                max={mode === 'withdraw' ? balance : 1000000}
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-secondary rounded-lg px-4 py-3 text-foreground font-bold outline-none focus:ring-1 focus:ring-primary"
              />
              {mode === 'withdraw' && (
                <p className="text-xs text-muted-foreground">Available: ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
              )}
            </div>

            <div className="flex gap-2">
              <button onClick={() => { setStep('select'); setSelected(null); }} className="flex-1 py-3 rounded-xl bg-secondary text-secondary-foreground font-bold text-sm click-glow">
                Back
              </button>
              <button
                onClick={handleConfirm}
                disabled={!amount || parseFloat(amount) <= 0 || (mode === 'withdraw' && parseFloat(amount) > balance)}
                className="flex-1 py-3 rounded-xl font-bold text-sm click-glow disabled:opacity-40 bg-primary text-primary-foreground neon-glow-gold"
              >
                {mode === 'deposit' ? 'Deposit' : 'Withdraw'}
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CryptoModal;
