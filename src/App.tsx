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
            <Route index element={<Navigate to="/mines" replace />} />
            <Route path="mines" element={<MinesGame />} />
            <Route path="aviator" element={<AviatorGame />} />
            <Route path="plinko" element={<PlinkoGame />} />
            <Route path="tower" element={<TowerGame />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
