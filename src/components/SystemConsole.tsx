import React, { useRef, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useGameState, BetLog } from '@/hooks/useGameState';

interface Props {
  open: boolean;
  onClose: () => void;
}

const COMMANDS: Record<string, string> = {
  '/help': 'Available: /set-balance <amt>, /predict-crash, /clear, /stats, /inject-ui <css>, /theme <gold|green|red>, /reset',
  '/predict-crash': '',
  '/clear': '',
  '/stats': '',
  '/reset': '',
};

const SystemConsole: React.FC<Props> = ({ open, onClose }) => {
  const { history, balance, resetBalance, setBalance } = useGameState();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [cmdHistory, setCmdHistory] = useState<{ text: string; type: 'input' | 'output' | 'error' | 'success' }[]>([
    { text: '> NEXUS TERMINAL v2.0 initialized', type: 'output' },
    { text: '> Type /help for available commands', type: 'output' },
  ]);
  const [input, setInput] = useState('');
  const [cmdIdx, setCmdIdx] = useState(-1);
  const [pastCmds, setPastCmds] = useState<string[]>([]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [cmdHistory.length, history.length]);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const addOutput = (text: string, type: 'output' | 'error' | 'success' = 'output') => {
    setCmdHistory(prev => [...prev, { text, type }]);
  };

  const executeCommand = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;

    setCmdHistory(prev => [...prev, { text: `$ ${trimmed}`, type: 'input' }]);
    setPastCmds(prev => [trimmed, ...prev].slice(0, 50));
    setCmdIdx(-1);

    const parts = trimmed.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (cmd) {
      case '/help':
        addOutput(COMMANDS['/help'], 'output');
        break;

      case '/set-balance': {
        const amt = parseFloat(args[0]);
        if (isNaN(amt) || amt < 0 || amt > 1000000) {
          addOutput('ERROR: Invalid amount. Usage: /set-balance <0-1000000>', 'error');
        } else {
          setBalance(amt);
          addOutput(`✓ Balance set to $${amt.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 'success');
        }
        break;
      }

      case '/predict-crash': {
        const fake = (1 + Math.random() * 9).toFixed(2);
        addOutput(`⚡ Predicted crash point: ${fake}× (simulated, not guaranteed)`, 'success');
        break;
      }

      case '/clear':
        setCmdHistory([{ text: '> Terminal cleared', type: 'output' }]);
        break;

      case '/stats': {
        const wins = history.filter(h => h.result === 'win').length;
        const losses = history.filter(h => h.result === 'loss').length;
        const totalWagered = history.reduce((s, h) => s + h.amount, 0);
        const totalWon = history.reduce((s, h) => s + h.payout, 0);
        addOutput(`📊 Stats | Bets: ${history.length} | W/L: ${wins}/${losses} | Wagered: $${totalWagered.toFixed(0)} | Won: $${totalWon.toFixed(0)} | P/L: $${(totalWon - totalWagered).toFixed(0)}`, 'output');
        break;
      }

      case '/inject-ui': {
        const css = args.join(' ');
        if (!css) {
          addOutput('ERROR: Usage: /inject-ui <css-property: value>', 'error');
          break;
        }
        try {
          const style = document.createElement('style');
          style.textContent = `body { ${css} }`;
          document.head.appendChild(style);
          addOutput(`✓ CSS injected: ${css}`, 'success');
        } catch {
          addOutput('ERROR: Invalid CSS', 'error');
        }
        break;
      }

      case '/theme': {
        const theme = args[0]?.toLowerCase();
        const themes: Record<string, string> = {
          gold: '--accent: 48 100% 50%;',
          green: '--accent: 136 100% 50%;',
          red: '--accent: 0 72% 51%;',
          purple: '--accent: 280 100% 60%;',
          cyan: '--accent: 180 100% 50%;',
        };
        if (!theme || !themes[theme]) {
          addOutput(`ERROR: Usage: /theme <${Object.keys(themes).join('|')}>`, 'error');
        } else {
          document.documentElement.style.setProperty('--accent', themes[theme].replace('--accent: ', '').replace(';', ''));
          addOutput(`✓ Theme accent changed to ${theme}`, 'success');
        }
        break;
      }

      case '/reset':
        resetBalance();
        addOutput('✓ Balance reset to $10,000.00', 'success');
        break;

      default:
        addOutput(`ERROR: Unknown command "${cmd}". Type /help for commands.`, 'error');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const newIdx = Math.min(cmdIdx + 1, pastCmds.length - 1);
      setCmdIdx(newIdx);
      if (pastCmds[newIdx]) setInput(pastCmds[newIdx]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const newIdx = Math.max(cmdIdx - 1, -1);
      setCmdIdx(newIdx);
      setInput(newIdx === -1 ? '' : pastCmds[newIdx] || '');
    }
  };

  if (!open) return null;

  const formatTime = (ts: number) => new Date(ts).toLocaleTimeString('en-US', { hour12: false });

  return (
    <div className="fixed bottom-24 right-6 z-40 w-[440px] max-h-[70vh] glass-elevated rounded-xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 fade-in duration-200 border border-accent/20">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse-neon" />
          <span className="font-mono text-xs text-accent font-semibold tracking-wider">NEXUS TERMINAL v2.0</span>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground click-glow rounded p-1">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="px-4 py-2 border-b border-border/20 font-mono text-xs text-muted-foreground">
        <span>SYS.BALANCE = </span>
        <span className="neon-text-gold">${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
        <span> | LOGS: {history.length}</span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-1 max-h-72">
        {/* Command history */}
        {cmdHistory.map((entry, i) => (
          <div key={`cmd-${i}`} className={`font-mono text-[11px] leading-relaxed ${
            entry.type === 'input' ? 'text-primary' :
            entry.type === 'error' ? 'text-destructive' :
            entry.type === 'success' ? 'text-accent' :
            'text-muted-foreground'
          }`}>
            {entry.text}
          </div>
        ))}

        {/* Bet logs */}
        {history.slice(0, 20).map((log: BetLog) => (
          <div key={log.id} className="font-mono text-[11px] leading-relaxed flex gap-2">
            <span className="text-muted-foreground shrink-0">[{formatTime(log.timestamp)}]</span>
            <span className={log.result === 'win' ? 'text-accent' : 'text-destructive'}>
              {log.result === 'win' ? '✓ WIN' : '✗ LOSS'}
            </span>
            <span className="text-secondary-foreground">
              {log.game} | ${log.amount} × {log.multiplier.toFixed(2)}x
              {log.result === 'win' && <span className="text-accent"> → ${log.payout.toFixed(0)}</span>}
            </span>
          </div>
        ))}
      </div>

      {/* Command input */}
      <div className="border-t border-border/30 px-3 py-2 flex items-center gap-2">
        <span className="font-mono text-xs text-accent">$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a command... (/help)"
          className="flex-1 bg-transparent font-mono text-xs text-foreground outline-none placeholder:text-muted-foreground/50"
        />
      </div>
    </div>
  );
};

export default SystemConsole;
