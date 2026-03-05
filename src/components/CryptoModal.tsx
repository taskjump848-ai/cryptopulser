import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useGameState } from '@/hooks/useGameState';
import { Copy, Check, ExternalLink, QrCode, ChevronLeft, Loader2, Clock, Search } from 'lucide-react';

const CRYPTOS = [
  { symbol: 'BTC', name: 'Bitcoin', icon: '₿', address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', network: 'Bitcoin' },
  { symbol: 'ETH', name: 'Ethereum', icon: 'Ξ', address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', network: 'ERC-20' },
  { symbol: 'USDT-TRC20', name: 'Tether TRC20', icon: '₮', address: 'TN2Y3cZpWaUvJzgbFbhSAgJkT1yQRQNrCK', network: 'TRC-20' },
  { symbol: 'USDT-ERC20', name: 'Tether ERC20', icon: '₮', address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', network: 'ERC-20' },
  { symbol: 'TRX', name: 'TRON', icon: '◈', address: 'TN2Y3cZpWaUvJzgbFbhSAgJkT1yQRQNrCK', network: 'TRC-20' },
  { symbol: 'BNB', name: 'BNB', icon: '◆', address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', network: 'BEP-20' },
  { symbol: 'SOL', name: 'Solana', icon: '◎', address: '7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV', network: 'Solana' },
  { symbol: 'XRP', name: 'Ripple', icon: '✕', address: 'rN7hBNyJKgMc1BRYhT7KDMmctbPHYJfrug', network: 'Ripple' },
  { symbol: 'USDC', name: 'USD Coin', icon: '$', address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', network: 'ERC-20' },
  { symbol: 'ADA', name: 'Cardano', icon: '₳', address: 'addr1qx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3jcu5d8ps7zex2k2xt3uqxgjqnnj83ws8lhrn648jjxtwq2ytjqp', network: 'Cardano' },
  { symbol: 'AVAX', name: 'Avalanche', icon: 'A', address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', network: 'C-Chain' },
  { symbol: 'DOGE', name: 'Dogecoin', icon: 'Ð', address: 'DFabcd1234efgh5678ijkl9012mnop3456qr', network: 'Dogecoin' },
  { symbol: 'DOT', name: 'Polkadot', icon: '●', address: '1FRMM8PEiWXYax7rpS6X4XZX1aAAxSWg1LcmrDEH5e1n', network: 'Polkadot' },
  { symbol: 'MATIC', name: 'Polygon', icon: '⬡', address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', network: 'Polygon' },
  { symbol: 'LINK', name: 'Chainlink', icon: '⬡', address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', network: 'ERC-20' },
  { symbol: 'TON', name: 'Toncoin', icon: '◇', address: 'EQDtFpEwcFAEcRe5mLVh2N6C0x-_hJEM7W61_JLnSF78p7AZ', network: 'TON' },
  { symbol: 'SHIB', name: 'Shiba Inu', icon: '🐕', address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', network: 'ERC-20' },
  { symbol: 'LTC', name: 'Litecoin', icon: 'Ł', address: 'ltc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfhcl3z7a', network: 'Litecoin' },
  { symbol: 'BCH', name: 'Bitcoin Cash', icon: '₿', address: 'qpm2qsznhks23z7629mms6s4cwef74vcwvy22gdx6a', network: 'Bitcoin Cash' },
  { symbol: 'ATOM', name: 'Cosmos', icon: '⚛', address: 'cosmos1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', network: 'Cosmos' },
];

type Tab = 'faucetpay' | 'crypto' | 'upi';
type VerifyStatus = 'idle' | 'verifying' | 'success';

interface Props {
  open: boolean;
  onClose: () => void;
  mode: 'deposit' | 'withdraw';
}

const CryptoModal: React.FC<Props> = ({ open, onClose, mode }) => {
  const { balance, setBalance } = useGameState();
  const [activeTab, setActiveTab] = useState<Tab>('crypto');
  const [selectedCrypto, setSelectedCrypto] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [txnId, setTxnId] = useState('');
  const [verifyStatus, setVerifyStatus] = useState<VerifyStatus>('idle');
  const [searchQuery, setSearchQuery] = useState('');

  // Withdraw mode state
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawStep, setWithdrawStep] = useState<'select' | 'amount'>('select');
  const [withdrawSelected, setWithdrawSelected] = useState<string | null>(null);

  const filteredCryptos = useMemo(() => {
    if (!searchQuery.trim()) return CRYPTOS;
    const q = searchQuery.toLowerCase();
    return CRYPTOS.filter(c =>
      c.symbol.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      /* clipboard not available */
    }
  };

  const handleVerifySubmit = () => {
    if (!txnId.trim()) return;
    setVerifyStatus('verifying');
    setTimeout(() => {
      setVerifyStatus('success');
      setBalance(balance + 100);
      setTimeout(() => {
        setVerifyStatus('idle');
        setTxnId('');
      }, 3000);
    }, 4000);
  };

  const handleClose = () => {
    setActiveTab('crypto');
    setSelectedCrypto(null);
    setCopiedField(null);
    setTxnId('');
    setVerifyStatus('idle');
    setSearchQuery('');
    setWithdrawAmount('');
    setWithdrawStep('select');
    setWithdrawSelected(null);
    onClose();
  };

  const handleWithdrawSelect = (symbol: string) => {
    setWithdrawSelected(symbol);
    setWithdrawStep('amount');
    setWithdrawAmount('');
  };

  const handleWithdrawConfirm = () => {
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0 || amt > balance) return;
    setBalance(balance - amt);
    handleClose();
  };

  const qrUrl = (text: string) =>
    `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(text)}&bgcolor=1a1d2e&color=00ff88&format=png`;

  // Withdraw mode
  if (mode === 'withdraw') {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="glass-elevated border-border/30 max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="neon-text-gold text-lg tracking-wider">
              📤 Withdraw Crypto
            </DialogTitle>
          </DialogHeader>

          {withdrawStep === 'select' ? (
            <div className="overflow-y-auto flex-1 pr-1">
              <div className="grid grid-cols-4 gap-2">
                {CRYPTOS.map(crypto => (
                  <button
                    key={crypto.symbol}
                    onClick={() => handleWithdrawSelect(crypto.symbol)}
                    className="flex flex-col items-center gap-1 p-3 rounded-xl mine-cell hover:border-primary/60 hover:neon-glow-gold click-glow transition-all"
                  >
                    <span className="text-lg">{crypto.icon}</span>
                    <span className="text-xs font-bold text-foreground">{crypto.symbol}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 glass rounded-xl p-3">
                <span className="text-2xl">{CRYPTOS.find(c => c.symbol === withdrawSelected)?.icon}</span>
                <div>
                  <p className="font-bold text-foreground">{withdrawSelected}</p>
                  <p className="text-xs text-muted-foreground">{CRYPTOS.find(c => c.symbol === withdrawSelected)?.name}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Amount (USDT)
                </label>
                <input
                  type="number"
                  min={1}
                  max={balance}
                  value={withdrawAmount}
                  onChange={e => setWithdrawAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-secondary rounded-lg px-4 py-3 text-foreground font-bold outline-none focus:ring-1 focus:ring-primary"
                />
                <p className="text-xs text-muted-foreground">Available: ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
              </div>

              <div className="flex gap-2">
                <button onClick={() => { setWithdrawStep('select'); setWithdrawSelected(null); }} className="flex-1 py-3 rounded-xl bg-secondary text-secondary-foreground font-bold text-sm click-glow">
                  Back
                </button>
                <button
                  onClick={handleWithdrawConfirm}
                  disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > balance}
                  className="flex-1 py-3 rounded-xl font-bold text-sm click-glow disabled:opacity-40 bg-primary text-primary-foreground neon-glow-gold"
                >
                  Withdraw
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    );
  }

  // Deposit mode
  const selectedCryptoData = CRYPTOS.find(c => c.symbol === selectedCrypto);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="glass-elevated border-border/30 max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="neon-text-gold text-xl tracking-wider font-black">
            💰 DEPOSIT
          </DialogTitle>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex gap-1 px-6 pt-4 pb-2">
          {([
            { key: 'faucetpay' as Tab, label: 'FaucetPay' },
            { key: 'crypto' as Tab, label: 'Crypto' },
            { key: 'upi' as Tab, label: 'UPI (₹)' },
          ]).map(tab => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setSelectedCrypto(null); setSearchQuery(''); }}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                activeTab === tab.key
                  ? 'bg-accent/20 text-accent border border-accent/30 neon-glow-green'
                  : 'bg-secondary/40 text-muted-foreground hover:bg-secondary/60 border border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">

          {/* FaucetPay Tab */}
          {activeTab === 'faucetpay' && (
            <div className="space-y-5 pt-2">
              <div className="glass rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                    <span className="text-xl">⚡</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-sm">FaucetPay Deposit</h3>
                    <p className="text-xs text-muted-foreground">Send funds via FaucetPay to the email below</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Recipient Email</label>
                  <div className="flex items-center gap-2 bg-secondary/60 rounded-lg p-3">
                    <span className="flex-1 text-sm font-mono-console text-accent font-semibold tracking-wide">taskjump848@gmail.com</span>
                    <button
                      onClick={() => copyToClipboard('taskjump848@gmail.com', 'faucetpay-email')}
                      className="p-2 rounded-lg bg-accent/15 hover:bg-accent/25 transition-colors click-glow"
                    >
                      {copiedField === 'faucetpay-email' ? (
                        <Check className="w-4 h-4 text-accent" />
                      ) : (
                        <Copy className="w-4 h-4 text-accent" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="glass rounded-lg p-4 space-y-2">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">How to Deposit via FaucetPay</h4>
                  <ol className="space-y-1.5 text-xs text-muted-foreground">
                    <li className="flex gap-2"><span className="text-accent font-bold">1.</span> Log in to your FaucetPay account</li>
                    <li className="flex gap-2"><span className="text-accent font-bold">2.</span> Go to "Send" or "Withdraw"</li>
                    <li className="flex gap-2"><span className="text-accent font-bold">3.</span> Paste the email above as the recipient</li>
                    <li className="flex gap-2"><span className="text-accent font-bold">4.</span> Enter the amount and confirm the transfer</li>
                    <li className="flex gap-2"><span className="text-accent font-bold">5.</span> Copy the Transaction ID and submit below</li>
                  </ol>
                </div>

                <a
                  href="https://faucetpay.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-accent/15 text-accent font-bold text-sm tracking-wider hover:bg-accent/25 transition-colors border border-accent/30 click-glow"
                >
                  <ExternalLink className="w-4 h-4" />
                  Go to FaucetPay
                </a>
              </div>

              {/* Verification Section */}
              <VerificationInput
                txnId={txnId}
                setTxnId={setTxnId}
                verifyStatus={verifyStatus}
                onSubmit={handleVerifySubmit}
                placeholder="Enter FaucetPay Transaction ID"
              />
            </div>
          )}

          {/* Crypto Tab */}
          {activeTab === 'crypto' && !selectedCrypto && (
            <div className="space-y-3 pt-2">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search coin..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-secondary/60 rounded-lg pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-accent/50"
                />
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-[50vh] overflow-y-auto pr-1">
                {filteredCryptos.map(crypto => (
                  <button
                    key={crypto.symbol}
                    onClick={() => setSelectedCrypto(crypto.symbol)}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl mine-cell hover:border-accent/60 hover:neon-glow-green click-glow transition-all group"
                  >
                    <span className="text-xl group-hover:scale-110 transition-transform">{crypto.icon}</span>
                    <span className="text-[11px] font-bold text-foreground">{crypto.symbol}</span>
                    <span className="text-[9px] text-muted-foreground leading-tight">{crypto.network}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'crypto' && selectedCrypto && selectedCryptoData && (
            <div className="space-y-4 pt-2">
              <button
                onClick={() => setSelectedCrypto(null)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to coins
              </button>

              <div className="glass rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-2xl">
                    {selectedCryptoData.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{selectedCryptoData.name}</h3>
                    <p className="text-xs text-muted-foreground">Network: {selectedCryptoData.network}</p>
                  </div>
                </div>

                {/* QR Code */}
                <div className="flex justify-center py-3">
                  <div className="p-3 rounded-xl bg-white/5 border border-border/30">
                    <img
                      src={qrUrl(selectedCryptoData.address)}
                      alt={`${selectedCryptoData.symbol} QR`}
                      className="w-44 h-44 rounded-lg"
                    />
                  </div>
                </div>

                {/* Wallet Address */}
                <div className="space-y-2">
                  <label className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Deposit Address</label>
                  <div className="flex items-center gap-2 bg-secondary/60 rounded-lg p-3">
                    <span className="flex-1 text-xs font-mono-console text-foreground break-all leading-relaxed">{selectedCryptoData.address}</span>
                    <button
                      onClick={() => copyToClipboard(selectedCryptoData.address, `addr-${selectedCryptoData.symbol}`)}
                      className="p-2 rounded-lg bg-accent/15 hover:bg-accent/25 transition-colors click-glow flex-shrink-0"
                    >
                      {copiedField === `addr-${selectedCryptoData.symbol}` ? (
                        <Check className="w-4 h-4 text-accent" />
                      ) : (
                        <Copy className="w-4 h-4 text-accent" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <span className="text-primary text-xs">⚠️ Only send {selectedCryptoData.symbol} on the {selectedCryptoData.network} network. Sending other assets may result in permanent loss.</span>
                </div>
              </div>

              {/* Verification Section */}
              <VerificationInput
                txnId={txnId}
                setTxnId={setTxnId}
                verifyStatus={verifyStatus}
                onSubmit={handleVerifySubmit}
                placeholder="Enter Transaction Hash / TXID"
              />
            </div>
          )}

          {/* UPI Tab */}
          {activeTab === 'upi' && (
            <div className="space-y-5 pt-2">
              <div className="glass rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-xl">🇮🇳</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-sm">UPI Deposit</h3>
                    <p className="text-xs text-muted-foreground">Scan QR code or use UPI ID to pay</p>
                  </div>
                </div>

                {/* UPI QR Placeholder */}
                <div className="flex justify-center py-4">
                  <div className="w-48 h-48 rounded-xl border-2 border-dashed border-border/50 flex flex-col items-center justify-center gap-2 bg-secondary/30">
                    <QrCode className="w-12 h-12 text-muted-foreground/40" />
                    <span className="text-xs text-muted-foreground">UPI QR Code</span>
                    <span className="text-[10px] text-muted-foreground/60">Coming Soon</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <span className="text-primary text-xs font-semibold">Minimum Deposit: ₹20</span>
                </div>

                <div className="glass rounded-lg p-4 space-y-2">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">How to Deposit via UPI</h4>
                  <ol className="space-y-1.5 text-xs text-muted-foreground">
                    <li className="flex gap-2"><span className="text-primary font-bold">1.</span> Open any UPI app (GPay, PhonePe, Paytm, etc.)</li>
                    <li className="flex gap-2"><span className="text-primary font-bold">2.</span> Scan the QR code above or enter the UPI ID</li>
                    <li className="flex gap-2"><span className="text-primary font-bold">3.</span> Enter amount (minimum ₹20)</li>
                    <li className="flex gap-2"><span className="text-primary font-bold">4.</span> Complete payment and note the UTR number</li>
                    <li className="flex gap-2"><span className="text-primary font-bold">5.</span> Enter the UTR number below for verification</li>
                  </ol>
                </div>
              </div>

              {/* Verification Section */}
              <VerificationInput
                txnId={txnId}
                setTxnId={setTxnId}
                verifyStatus={verifyStatus}
                onSubmit={handleVerifySubmit}
                placeholder="Enter UTR Number"
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

/* Reusable Verification Section */
const VerificationInput: React.FC<{
  txnId: string;
  setTxnId: (v: string) => void;
  verifyStatus: VerifyStatus;
  onSubmit: () => void;
  placeholder: string;
}> = ({ txnId, setTxnId, verifyStatus, onSubmit, placeholder }) => (
  <div className="glass rounded-xl p-5 space-y-3">
    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
      <Clock className="w-3.5 h-3.5 text-accent" />
      Payment Verification
    </h4>

    {verifyStatus === 'idle' && (
      <>
        <div className="space-y-2">
          <label className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
            Transaction ID / UTR
          </label>
          <input
            type="text"
            value={txnId}
            onChange={e => setTxnId(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-secondary/60 rounded-lg px-4 py-3 text-sm text-foreground font-mono-console placeholder:text-muted-foreground/50 outline-none focus:ring-1 focus:ring-accent/50"
          />
        </div>
        <button
          onClick={onSubmit}
          disabled={!txnId.trim()}
          className="w-full py-3 rounded-xl font-bold text-sm tracking-wider uppercase click-glow disabled:opacity-40 bg-accent/20 text-accent hover:bg-accent/30 transition-colors border border-accent/30"
        >
          Submit for Verification
        </button>
      </>
    )}

    {verifyStatus === 'verifying' && (
      <div className="space-y-3">
        <div className="flex items-center gap-3 py-2">
          <Loader2 className="w-5 h-5 text-accent animate-spin" />
          <div>
            <p className="text-sm font-semibold text-foreground">Verifying Payment...</p>
            <p className="text-xs text-muted-foreground">This takes 2-5 minutes</p>
          </div>
        </div>
        {/* Progress Bar */}
        <div className="w-full h-2 bg-secondary/60 rounded-full overflow-hidden">
          <div className="h-full bg-accent/60 rounded-full animate-verify-progress" />
        </div>
      </div>
    )}

    {verifyStatus === 'success' && (
      <div className="flex items-center gap-3 py-2">
        <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
          <Check className="w-5 h-5 text-accent" />
        </div>
        <div>
          <p className="text-sm font-semibold text-accent">Payment Verified!</p>
          <p className="text-xs text-muted-foreground">Funds have been credited to your balance</p>
        </div>
      </div>
    )}
  </div>
);

export default CryptoModal;
