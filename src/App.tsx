import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import Login from "./pages/Login";
import Setup from "./pages/Setup";
import Dashboard from "./pages/Dashboard";
import Caixa from "./pages/Caixa";
import PDV from "./pages/PDV";
import Comandas from "./pages/Comandas";
import Clientes from "./pages/Clientes";
import Assinatura from "./pages/Assinatura";
import Suporte from "./pages/Suporte";
import AnupAdmin from "./pages/AnupAdmin";
import Usuarios from "./pages/Usuarios";
import Estoque from "./pages/Estoque";
import Pedidos from "./pages/Pedidos";
import Entregadores from "./pages/Entregadores";
import Financeiro from "./pages/Financeiro";
import Configuracoes from "./pages/Configuracoes";
import Historico from "./pages/Historico";
import Empresas from "./pages/Empresas";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/setup" element={<Setup />} />
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/anup" element={<AnupAdmin />} />
              <Route path="/pdv" element={<PDV />} />
              <Route path="/caixa" element={<Caixa />} />
              <Route path="/comandas" element={<Comandas />} />
              <Route path="/usuarios" element={<Usuarios />} />
              <Route path="/estoque" element={<Estoque />} />
              <Route path="/pedidos" element={<Pedidos />} />
              <Route path="/entregadores" element={<Entregadores />} />
              <Route path="/clientes" element={<Clientes />} />
              <Route path="/financeiro" element={<Financeiro />} />
              <Route path="/assinatura" element={<Assinatura />} />
              <Route path="/suporte" element={<Suporte />} />
              <Route path="/configuracoes" element={<Configuracoes />} />
              <Route path="/historico" element={<Historico />} />
              <Route path="/empresas" element={<Empresas />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
