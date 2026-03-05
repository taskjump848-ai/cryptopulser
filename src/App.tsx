import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import CasinoLayout from "./components/CasinoLayout";
import MinesGame from "./pages/MinesGame";
import AviatorGame from "./pages/AviatorGame";
import PlinkoGame from "./pages/PlinkoGame";
import TowerGame from "./pages/TowerGame";
import GameLibrary from "./pages/GameLibrary";
import DiceGame from "./pages/DiceGame";
import LimboGame from "./pages/LimboGame";
import HiLoGame from "./pages/HiLoGame";
import KenoGame from "./pages/KenoGame";
import WheelGame from "./pages/WheelGame";
import DiamondsGame from "./pages/DiamondsGame";
import SlideGame from "./pages/SlideGame";
import CrashGame from "./pages/CrashGame";
import RouletteGame from "./pages/RouletteGame";
import BaccaratGame from "./pages/BaccaratGame";
import DragonTowerGame from "./pages/DragonTowerGame";
import BlueSamuraiGame from "./pages/BlueSamuraiGame";
import ScarabSpinGame from "./pages/ScarabSpinGame";
import VideoPokerGame from "./pages/VideoPokerGame";
import CupBallGame from "./pages/CupBallGame";
import { GatesOfOlympusGame, SweetBonanzaGame, StarlightPrincessGame, SugarRushGame, WantedDeadGame } from "./pages/SlotGames";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<CasinoLayout />}>
            <Route index element={<Navigate to="/library" replace />} />
            <Route path="library" element={<GameLibrary />} />
            <Route path="mines" element={<MinesGame />} />
            <Route path="aviator" element={<AviatorGame />} />
            <Route path="plinko" element={<PlinkoGame />} />
            <Route path="tower" element={<TowerGame />} />
            <Route path="dice" element={<DiceGame />} />
            <Route path="limbo" element={<LimboGame />} />
            <Route path="hilo" element={<HiLoGame />} />
            <Route path="keno" element={<KenoGame />} />
            <Route path="wheel" element={<WheelGame />} />
            <Route path="diamonds" element={<DiamondsGame />} />
            <Route path="slide" element={<SlideGame />} />
            <Route path="crash" element={<CrashGame />} />
            <Route path="roulette" element={<RouletteGame />} />
            <Route path="baccarat" element={<BaccaratGame />} />
            <Route path="dragon-tower" element={<DragonTowerGame />} />
            <Route path="blue-samurai" element={<BlueSamuraiGame />} />
            <Route path="scarab-spin" element={<ScarabSpinGame />} />
            <Route path="video-poker" element={<VideoPokerGame />} />
            <Route path="cup-ball" element={<CupBallGame />} />
            <Route path="olympus" element={<GatesOfOlympusGame />} />
            <Route path="sweet-bonanza" element={<SweetBonanzaGame />} />
            <Route path="starlight" element={<StarlightPrincessGame />} />
            <Route path="sugar-rush" element={<SugarRushGame />} />
            <Route path="wanted" element={<WantedDeadGame />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
