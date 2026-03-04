import { useState, useEffect, useCallback } from 'react';

export interface BetLog {
  id: string;
  game: string;
  amount: number;
  multiplier: number;
  result: 'win' | 'loss';
  payout: number;
  timestamp: number;
}

interface GameState {
  balance: number;
  history: BetLog[];
}

const STORAGE_KEY = 'casino_state';
const DEFAULT_BALANCE = 10000;

function loadState(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { balance: DEFAULT_BALANCE, history: [] };
}

function saveState(state: GameState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const listeners = new Set<() => void>();
let globalState = loadState();

function notify() {
  saveState(globalState);
  listeners.forEach(l => l());
}

export function useGameState() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const cb = () => setTick(t => t + 1);
    listeners.add(cb);
    return () => { listeners.delete(cb); };
  }, []);

  const placeBet = useCallback((game: string, amount: number, multiplier: number, won: boolean) => {
    const payout = won ? amount * multiplier : 0;
    const log: BetLog = {
      id: crypto.randomUUID(),
      game,
      amount,
      multiplier,
      result: won ? 'win' : 'loss',
      payout,
      timestamp: Date.now(),
    };
    globalState = {
      balance: globalState.balance - amount + payout,
      history: [log, ...globalState.history].slice(0, 200),
    };
    notify();
    return log;
  }, []);

  const resetBalance = useCallback(() => {
    globalState = { ...globalState, balance: DEFAULT_BALANCE };
    notify();
  }, []);

  const setBalance = useCallback((amount: number) => {
    globalState = { ...globalState, balance: amount };
    notify();
  }, []);

  return {
    balance: globalState.balance,
    history: globalState.history,
    placeBet,
    resetBalance,
    setBalance,
  };
}
