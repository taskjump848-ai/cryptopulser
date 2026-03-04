import React, { useState, useRef, useEffect, useCallback } from 'react';
import BetControls from '@/components/BetControls';
import { useGameState } from '@/hooks/useGameState';

const ROWS = 12;
const MULTIPLIERS = [
  [8.9, 3, 1.4, 1.1, 1, 0.5, 1, 1.1, 1.4, 3, 8.9],
  [18, 4, 1.7, 1.3, 1, 0.7, 1, 1.3, 1.7, 4, 18],
  [33, 7, 3, 1.5, 1, 0.5, 1, 1.5, 3, 7, 33],
];

const PlinkoGame: React.FC = () => {
  const { balance, placeBet } = useGameState();
  const [betAmount, setBetAmount] = useState(100);
  const [risk, setRisk] = useState(0); // 0=low, 1=mid, 2=high
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dropping, setDropping] = useState(false);
  const [lastResult, setLastResult] = useState<{ bucket: number; mult: number } | null>(null);

  const mults = MULTIPLIERS[risk];

  const drawBoard = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, ballPos?: { x: number; y: number }) => {
    ctx.clearRect(0, 0, w, h);

    const padX = 40;
    const padTop = 30;
    const padBot = 60;
    const rowH = (h - padTop - padBot) / ROWS;

    // Draw pegs
    for (let row = 0; row < ROWS; row++) {
      const pegsInRow = row + 3;
      const rowWidth = (w - padX * 2) * ((row + 3) / (ROWS + 2));
      const startX = (w - rowWidth) / 2;
      for (let col = 0; col < pegsInRow; col++) {
        const x = startX + (rowWidth / (pegsInRow - 1)) * col;
        const y = padTop + row * rowH;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = 'hsla(210, 15%, 55%, 0.6)';
        ctx.fill();
      }
    }

    // Draw buckets
    const bucketCount = mults.length;
    const bucketW = (w - padX * 2) / bucketCount;
    for (let i = 0; i < bucketCount; i++) {
      const x = padX + i * bucketW;
      const y = h - padBot + 10;
      const mult = mults[i];
      const isEdge = i <= 1 || i >= bucketCount - 2;
      ctx.fillStyle = isEdge ? 'hsla(48, 100%, 50%, 0.15)' : 'hsla(136, 100%, 50%, 0.1)';
      ctx.fillRect(x + 2, y, bucketW - 4, 30);
      ctx.strokeStyle = isEdge ? 'hsla(48, 100%, 50%, 0.4)' : 'hsla(136, 100%, 50%, 0.3)';
      ctx.strokeRect(x + 2, y, bucketW - 4, 30);
      ctx.fillStyle = isEdge ? 'hsl(48, 100%, 50%)' : 'hsl(136, 100%, 50%)';
      ctx.font = 'bold 10px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(`${mult}×`, x + bucketW / 2, y + 20);
    }

    // Draw ball
    if (ballPos) {
      ctx.beginPath();
      ctx.arc(ballPos.x, ballPos.y, 8, 0, Math.PI * 2);
      const ballGrad = ctx.createRadialGradient(ballPos.x, ballPos.y, 0, ballPos.x, ballPos.y, 8);
      ballGrad.addColorStop(0, 'hsl(48, 100%, 70%)');
      ballGrad.addColorStop(1, 'hsl(48, 100%, 40%)');
      ctx.fillStyle = ballGrad;
      ctx.fill();
      ctx.shadowColor = 'hsl(48, 100%, 50%)';
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }, [mults]);

  // Initial draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);
    drawBoard(ctx, rect.width, rect.height);
  }, [drawBoard]);

  const dropBall = () => {
    if (dropping || betAmount > balance || betAmount <= 0) return;
    setDropping(true);
    setLastResult(null);

    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    const dpr = window.devicePixelRatio || 1;
    const ctx = canvas.getContext('2d')!;

    // Simulate path
    let position = 0; // center offset
    const path: number[] = [0];
    for (let i = 0; i < ROWS; i++) {
      position += Math.random() > 0.5 ? 1 : -1;
      path.push(position);
    }

    // Map final position to bucket
    const minPos = -ROWS;
    const maxPos = ROWS;
    const normalizedPos = (position - minPos) / (maxPos - minPos);
    const bucketIdx = Math.min(mults.length - 1, Math.max(0, Math.floor(normalizedPos * mults.length)));
    const mult = mults[bucketIdx];

    // Animate
    const padTop = 30;
    const padBot = 60;
    const rowH = (h - padTop - padBot) / ROWS;
    let step = 0;
    const totalSteps = path.length;
    let frame = 0;
    const framesPerStep = 8;

    const animate = () => {
      const progress = Math.min(frame / framesPerStep, 1);
      const currentStep = Math.min(step, totalSteps - 1);
      const nextStep = Math.min(step + 1, totalSteps - 1);

      const curOff = path[currentStep];
      const nextOff = path[nextStep];
      const interpOff = curOff + (nextOff - curOff) * progress;

      const ballX = w / 2 + interpOff * 15;
      const curY = padTop + currentStep * rowH;
      const nextY = padTop + nextStep * rowH;
      const ballY = curY + (nextY - curY) * progress;

      ctx.clearRect(0, 0, w * dpr, h * dpr);
      ctx.save();
      ctx.scale(dpr, dpr);
      drawBoard(ctx, w, h, { x: ballX, y: ballY });
      ctx.restore();

      frame++;
      if (frame >= framesPerStep) {
        frame = 0;
        step++;
      }

      if (step < totalSteps) {
        requestAnimationFrame(animate);
      } else {
        const won = mult >= 1;
        placeBet('Plinko', betAmount, mult, won);
        setLastResult({ bucket: bucketIdx, mult });
        setDropping(false);
      }
    };
    requestAnimationFrame(animate);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col lg:flex-row gap-6">
      <div className="w-full lg:w-72 space-y-4">
        <BetControls
          betAmount={betAmount}
          onBetChange={setBetAmount}
          onAction={dropBall}
          actionLabel="Drop Ball"
          disabled={dropping || betAmount > balance}
          maxBet={balance}
        />
        <div className="glass-elevated rounded-xl p-4 space-y-3">
          <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Risk Level</label>
          <div className="flex gap-2">
            {['Low', 'Medium', 'High'].map((label, i) => (
              <button
                key={label}
                disabled={dropping}
                onClick={() => setRisk(i)}
                className={`flex-1 py-2 rounded-lg text-xs font-bold click-glow ${risk === i ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-secondary text-muted-foreground'} disabled:opacity-40`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        {lastResult && (
          <div className="glass-elevated rounded-xl p-4 text-center">
            <p className="text-xs text-muted-foreground">Result</p>
            <p className={`text-2xl font-black ${lastResult.mult >= 1 ? 'neon-text-green' : 'text-destructive'}`}>
              {lastResult.mult}×
            </p>
            {lastResult.mult >= 1 && (
              <p className="text-sm text-accent">+₹{(betAmount * lastResult.mult - betAmount).toFixed(0)}</p>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 glass-elevated rounded-xl p-4">
        <canvas ref={canvasRef} className="w-full" style={{ width: '100%', height: '480px' }} />
      </div>
    </div>
  );
};

export default PlinkoGame;
