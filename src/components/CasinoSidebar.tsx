import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Grid3X3, Plane, Circle, Building2, LayoutGrid } from 'lucide-react';

const games = [
  { name: 'Library', path: '/library', icon: LayoutGrid },
  { name: 'Mines', path: '/mines', icon: Grid3X3 },
  { name: 'Aviator', path: '/aviator', icon: Plane },
  { name: 'Plinko', path: '/plinko', icon: Circle },
  { name: 'Tower', path: '/tower', icon: Building2 },
];

const CasinoSidebar: React.FC = () => {
  const location = useLocation();

  return (
    <aside className="w-20 hover:w-56 transition-all duration-300 ease-in-out group flex flex-col items-center py-6 gap-2 border-r border-border/30"
      style={{ background: 'hsl(220 20% 7% / 0.75)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
      {/* Logo */}
      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-8 neon-glow-gold">
        <span className="text-2xl font-black neon-text-gold">N</span>
      </div>

      <nav className="flex flex-col gap-2 w-full px-3">
        {games.map(game => {
          const active = location.pathname === game.path;
          return (
            <NavLink
              key={game.path}
              to={game.path}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 click-glow overflow-hidden whitespace-nowrap ${
                active
                  ? 'glass-elevated neon-glow-green'
                  : 'hover:bg-secondary/40'
              }`}
            >
              <game.icon
                className={`w-6 h-6 flex-shrink-0 transition-all duration-200 ${
                  active ? 'text-accent drop-shadow-[0_0_8px_hsl(136,100%,50%,0.6)]' : 'text-muted-foreground group-hover:text-foreground'
                }`}
              />
              <span className={`text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
                active ? 'text-accent' : 'text-secondary-foreground'
              }`}>
                {game.name}
              </span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default CasinoSidebar;
