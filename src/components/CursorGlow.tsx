import React, { useEffect, useRef } from 'react';

const CursorGlow: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trailRef = useRef<{ x: number; y: number; age: number }[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const handleMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      trailRef.current.push({ x: e.clientX, y: e.clientY, age: 0 });
      if (trailRef.current.length > 30) trailRef.current.shift();
    };
    window.addEventListener('mousemove', handleMove);

    const ctx = canvas.getContext('2d')!;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update ages and draw trail
      trailRef.current = trailRef.current
        .map(p => ({ ...p, age: p.age + 1 }))
        .filter(p => p.age < 25);

      for (let i = 0; i < trailRef.current.length; i++) {
        const p = trailRef.current[i];
        const alpha = Math.max(0, 1 - p.age / 25) * 0.3;
        const radius = Math.max(1, (1 - p.age / 25) * 12);

        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
        grad.addColorStop(0, `hsla(136, 100%, 50%, ${alpha})`);
        grad.addColorStop(0.5, `hsla(136, 100%, 50%, ${alpha * 0.3})`);
        grad.addColorStop(1, `hsla(136, 100%, 50%, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Main glow at cursor
      const { x, y } = mouseRef.current;
      const mainGrad = ctx.createRadialGradient(x, y, 0, x, y, 60);
      mainGrad.addColorStop(0, 'hsla(136, 100%, 50%, 0.08)');
      mainGrad.addColorStop(0.5, 'hsla(136, 100%, 50%, 0.03)');
      mainGrad.addColorStop(1, 'hsla(136, 100%, 50%, 0)');
      ctx.fillStyle = mainGrad;
      ctx.beginPath();
      ctx.arc(x, y, 60, 0, Math.PI * 2);
      ctx.fill();

      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[9999] pointer-events-none"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};

export default CursorGlow;
