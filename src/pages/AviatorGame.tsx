import React, { useState, useRef, useEffect, useCallback } from 'react';
import BetControls from '@/components/BetControls';
import { useGameState } from '@/hooks/useGameState';

const AviatorGame: React.FC = () => {
  const { balance, placeBet } = useGameState();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [betAmount, setBetAmount] = useState(100);
  const [gameState, setGameState] = useState<'idle' | 'flying' | 'crashed' | 'cashedOut'>('idle');
  const [currentMult, setCurrentMult] = useState(1.0);
  const [crashPoint, setCrashPoint] = useState(1.0);
  const [hasBet, setHasBet] = useState(false);
  const animRef = useRef<number>(0);
  const startTimeRef = useRef(0);

  const generateCrashPoint = () => {
    const r = Math.random();
    if (r < 0.03) return 1.0;
    return Math.max(1.0, 1 / (1 - r) * 0.97);
  };

  const startRound = () => {
    if (betAmount > balance || betAmount <= 0) return;
    const cp = generateCrashPoint();
    setCrashPoint(cp);
    setCurrentMult(1.0);
    setGameState('flying');
    setHasBet(true);
    startTimeRef.current = performance.now();
  };

  const cashOut = () => {
    if (gameState !== 'flying') return;
    setGameState('cashedOut');
    placeBet('Aviator', betAmount, currentMult, true);
    setHasBet(false);
    cancelAnimationFrame(animRef.current);
  };

  // Animation loop
  useEffect(() => {
    if (gameState !== 'flying') return;

    const tick = (now: number) => {
      const elapsed = (now - startTimeRef.current) / 1000;
      const mult = Math.pow(Math.E, elapsed * 0.15) ; // exponential growth
      const rounded = Math.floor(mult * 100) / 100;
      setCurrentMult(rounded);

      if (rounded >= crashPoint) {
        setGameState('crashed');
        if (hasBet) {
          placeBet('Aviator', betAmount, 0, false);
          setHasBet(false);
        }
        return;
      }
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [gameState, crashPoint, betAmount, hasBet, placeBet]);

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const w = rect.width;
    const h = rect.height;

    ctx.clearRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = 'hsla(220, 15%, 25%, 0.4)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 10; i++) {
      const y = h - (i * h / 10);
      ctx.beginPath(); ctx.moveTo(40, y); ctx.lineTo(w, y); ctx.stroke();
      ctx.fillStyle = 'hsla(210, 15%, 55%, 0.6)';
      ctx.font = '10px Inter';
      ctx.fillText(`${(1 + i * 0.5).toFixed(1)}x`, 2, y + 4);
    }

    if (gameState === 'idle') return;

    // Draw curve
    const maxMult = Math.max(currentMult, 2);
    const points: [number, number][] = [];
    const steps = 100;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const m = 1 + (currentMult - 1) * t;
      const x = 40 + (w - 50) * t;
      const y = h - 20 - ((m - 1) / (maxMult - 1)) * (h - 40);
      points.push([x, y]);
    }

    // Gradient line
    const grad = ctx.createLinearGradient(40, h, w, 0);
    if (gameState === 'crashed') {
      grad.addColorStop(0, 'hsl(0, 72%, 51%)');
      grad.addColorStop(1, 'hsl(0, 72%, 70%)');
    } else {
      grad.addColorStop(0, 'hsl(136, 100%, 50%)');
      grad.addColorStop(1, 'hsl(48, 100%, 50%)');
    }

    ctx.strokeStyle = grad;
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    points.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y));
    ctx.stroke();

    // Fill under curve
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = gameState === 'crashed' ? 'hsl(0, 72%, 51%)' : 'hsl(136, 100%, 50%)';
    ctx.beginPath();
    points.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y));
    ctx.lineTo(points[points.length - 1][0], h);
    ctx.lineTo(40, h);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Plane emoji at end
    if (points.length > 0) {
      const [px, py] = points[points.length - 1];
      ctx.font = '28px serif';
      ctx.fillText('✈️', px - 14, py - 10);
    }
  }, [currentMult, gameState]);

  return (
    <div className="max-w-4xl mx-auto flex flex-col lg:flex-row gap-6">
      <div className="w-full lg:w-72 space-y-4">
        <BetControls
          betAmount={betAmount}
          onBetChange={setBetAmount}
          onAction={gameState === 'flying' ? cashOut : startRound}
          actionLabel={gameState === 'flying' ? `Cash Out @ ${currentMult.toFixed(2)}×` : 'Place Bet & Fly'}
          disabled={gameState === 'flying' ? false : (betAmount > balance || betAmount <= 0)}
          maxBet={balance}
        />
        {gameState === 'cashedOut' && (
          <div className="glass-elevated rounded-xl p-4 text-center">
            <p className="text-xs text-muted-foreground">You cashed out!</p>
            <p className="text-2xl font-black neon-text-green">{currentMult.toFixed(2)}×</p>
            <p className="text-sm text-accent">+₹{(betAmount * currentMult - betAmount).toFixed(0)}</p>
          </div>
        )}
        {gameState === 'crashed' && (
          <div className="glass-elevated rounded-xl p-4 text-center">
            <p className="text-xs text-muted-foreground">Crashed at</p>
            <p className="text-2xl font-black text-destructive">{crashPoint.toFixed(2)}×</p>
          </div>
        )}
      </div>

      <div className="flex-1 glass-elevated rounded-xl p-4 relative overflow-hidden">
        {/* Large multiplier overlay */}
        {gameState !== 'idle' && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 text-center">
            <p className={`text-5xl font-black ${gameState === 'crashed' ? 'text-destructive' : 'neon-text-green'}`}>
              {currentMult.toFixed(2)}×
            </p>
            {gameState === 'crashed' && <p className="text-sm text-destructive font-bold mt-1">CRASHED!</p>}
          </div>
        )}
        {gameState === 'idle' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-muted-foreground text-lg">Place a bet to start flying ✈️</p>
          </div>
        )}
        <canvas ref={canvasRef} className="w-full h-80" style={{ width: '100%', height: '320px' }} />
      </div>
    </div>
  );
};

export default AviatorGame;
