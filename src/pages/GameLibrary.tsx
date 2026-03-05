import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid3X3, Plane, Circle, Building2, Dice1, TrendingDown, ArrowUpDown, Hash, RotateCcw, Diamond, Layers, Zap, Target, Sparkles, Cherry, Crown, Gem, Star, Flame, Trophy } from 'lucide-react';

interface GameCard {
  name: string;
  path: string;
  icon: React.ElementType;
  category: 'original' | 'slot';
  available: boolean;
  color: string;
}

const games: GameCard[] = [
  { name: 'Mines', path: '/mines', icon: Grid3X3, category: 'original', available: true, color: 'accent' },
  { name: 'Aviator', path: '/aviator', icon: Plane, category: 'original', available: true, color: 'accent' },
  { name: 'Plinko', path: '/plinko', icon: Circle, category: 'original', available: true, color: 'accent' },
  { name: 'Tower', path: '/tower', icon: Building2, category: 'original', available: true, color: 'accent' },
  { name: 'Dice', path: '/dice', icon: Dice1, category: 'original', available: true, color: 'accent' },
  { name: 'Limbo', path: '/limbo', icon: TrendingDown, category: 'original', available: true, color: 'accent' },
  { name: 'HiLo', path: '/hilo', icon: ArrowUpDown, category: 'original', available: true, color: 'accent' },
  { name: 'Keno', path: '/keno', icon: Hash, category: 'original', available: true, color: 'accent' },
  { name: 'Wheel', path: '/wheel', icon: RotateCcw, category: 'original', available: true, color: 'accent' },
  { name: 'Diamonds', path: '/diamonds', icon: Diamond, category: 'original', available: true, color: 'accent' },
  { name: 'Slide', path: '/slide', icon: Layers, category: 'original', available: true, color: 'accent' },
  { name: 'Crash', path: '/crash', icon: Zap, category: 'original', available: true, color: 'accent' },
  { name: 'Roulette', path: '/roulette', icon: Target, category: 'original', available: true, color: 'accent' },
  { name: 'Baccarat', path: '/baccarat', icon: Sparkles, category: 'original', available: true, color: 'accent' },
  { name: 'Dragon Tower', path: '/dragon-tower', icon: Flame, category: 'original', available: true, color: 'accent' },
  { name: 'Blue Samurai', path: '/blue-samurai', icon: Star, category: 'original', available: true, color: 'accent' },
  { name: 'Scarab Spin', path: '/scarab-spin', icon: RotateCcw, category: 'original', available: true, color: 'accent' },
  { name: 'Video Poker', path: '/video-poker', icon: Layers, category: 'original', available: true, color: 'accent' },
  { name: 'Cup & Ball', path: '/cup-ball', icon: Target, category: 'original', available: true, color: 'accent' },
  { name: 'Gates of Olympus', path: '/olympus', icon: Crown, category: 'slot', available: true, color: 'accent' },
  { name: 'Sweet Bonanza', path: '/sweet-bonanza', icon: Cherry, category: 'slot', available: true, color: 'accent' },
  { name: 'Starlight Princess', path: '/starlight', icon: Sparkles, category: 'slot', available: true, color: 'accent' },
  { name: 'Sugar Rush', path: '/sugar-rush', icon: Gem, category: 'slot', available: true, color: 'accent' },
  { name: 'Wanted Dead', path: '/wanted', icon: Trophy, category: 'slot', available: true, color: 'accent' },
];

const GameLibrary: React.FC = () => {
  const navigate = useNavigate();

  const originals = games.filter(g => g.category === 'original');
  const slots = games.filter(g => g.category === 'slot');

  return (
    <div className="space-y-8 w-full max-w-6xl mx-auto px-2">
      <div>
        <h2 className="text-xl font-black neon-text-gold tracking-wider mb-4 text-center">🎮 NEXUS ORIGINALS</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 justify-items-center">
          {originals.map((game, i) => (
            <button
              key={game.name}
              onClick={() => game.available && navigate(game.path)}
              className={`group relative flex flex-col items-center justify-center gap-2 p-5 rounded-xl mine-cell click-glow transition-all duration-300 breathing-glow w-full
                ${game.available ? 'hover:border-accent/60 hover:neon-glow-green cursor-pointer' : 'opacity-50 cursor-not-allowed'}
              `}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <game.icon className={`w-8 h-8 transition-all duration-300 ${game.available ? 'text-accent group-hover:drop-shadow-[0_0_12px_hsl(136,100%,50%,0.6)]' : 'text-muted-foreground'}`} />
              <span className={`text-xs font-bold ${game.available ? 'text-foreground' : 'text-muted-foreground'}`}>{game.name}</span>
              {!game.available && (
                <span className="absolute top-2 right-2 text-[9px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-bold">SOON</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-black neon-text-gold tracking-wider mb-4 text-center">🎰 PREMIUM SLOTS</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 justify-items-center">
          {slots.map((game, i) => (
            <button
              key={game.name}
              onClick={() => navigate(game.path)}
              className="group relative flex flex-col items-center justify-center gap-2 p-5 rounded-xl mine-cell hover:border-accent/60 hover:neon-glow-green cursor-pointer breathing-glow click-glow w-full"
              style={{ animationDelay: `${i * 150}ms` }}
            >
              <game.icon className="w-8 h-8 text-accent group-hover:drop-shadow-[0_0_12px_hsl(136,100%,50%,0.6)]" />
              <span className="text-xs font-bold text-foreground">{game.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameLibrary;
