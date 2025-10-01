import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useProPorcoData } from "@/hooks/useProPorcoData";
import { AppLayout } from "@/components/Layout/AppLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Porcos from "./pages/Porcos";
import Piquetes from "./pages/Piquetes";
import Insumos from "./pages/Insumos";
import Alimentacao from "./pages/Alimentacao";
import Sanidade from "./pages/Sanidade";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { usuario, authInitialized } = useProPorcoData();
  
  if (!authInitialized) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
    </div>;
  }
  
  return usuario ? <>{children}</> : <Navigate to="/login" replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Login Route */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="porcos" element={<Porcos />} />
            <Route path="piquetes" element={<Piquetes />} />
            <Route path="insumos" element={<Insumos />} />
            <Route path="alimentacao" element={<Alimentacao />} />
            <Route path="sanidade" element={<Sanidade />} />
            <Route path="pesagem" element={<div>Em desenvolvimento...</div>} />
            <Route path="vendas" element={<div>Em desenvolvimento...</div>} />
            <Route path="financeiro" element={<div>Em desenvolvimento...</div>} />
            <Route path="relatorios" element={<div>Em desenvolvimento...</div>} />
            <Route path="configuracoes" element={<div>Em desenvolvimento...</div>} />
          </Route>
          
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
