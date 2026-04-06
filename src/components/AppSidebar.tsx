import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  DollarSign,
  Users,
  Package,
  ShoppingCart,
  Truck,
  BarChart,
  Settings,
  FileText,
  LogOut,
  Building2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Caixa", url: "/caixa", icon: DollarSign },
  { title: "Usuários", url: "/usuarios", icon: Users },
  { title: "Estoque", url: "/estoque", icon: Package },
  { title: "Pedidos Delivery", url: "/pedidos", icon: ShoppingCart },
  { title: "Entregadores", url: "/entregadores", icon: Truck },
  { title: "Financeiro", url: "/financeiro", icon: BarChart },
  { title: "Configurações", url: "/configuracoes", icon: Settings },
  { title: "Histórico", url: "/historico", icon: FileText },
];

const adminOnlyItems = [
  { title: "Empresas", url: "/empresas", icon: Building2 },
];

export function AppSidebar() {
  const { selectedEmployee, selectedCompany, isAnupAdmin, clearCompanySelection, signOut } = useAuth();

  const getInitials = (name: string) =>
    name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  const roleLabels: Record<string, string> = {
    admin: "Administrador",
    manager: "Gerente",
    cashier: "Caixa",
    delivery_person: "Entregador",
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-primary flex flex-col p-4 gap-2 z-50">
      <div className="mb-4 px-2 flex flex-col gap-1">
        <h1 className="text-xl font-bold text-primary-foreground tracking-tight">Anup</h1>
        <p className="text-[10px] uppercase tracking-widest text-primary-foreground/50 font-semibold">Sistema PDV</p>
      </div>

      {selectedCompany && (
        <div className="mb-4 px-3 py-2 bg-primary-foreground/5 rounded-xl flex items-center gap-2">
          <Building2 className="h-4 w-4 text-secondary shrink-0" />
          <span className="text-primary-foreground text-xs font-bold truncate">
            {selectedCompany.trade_name || selectedCompany.name}
          </span>
          {isAnupAdmin && (
            <button
              onClick={clearCompanySelection}
              className="text-primary-foreground/40 hover:text-primary-foreground text-[10px] ml-auto shrink-0"
              title="Trocar empresa"
            >
              ✕
            </button>
          )}
        </div>
      )}

      <nav className="flex-1 flex flex-col gap-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm ${
                isActive
                  ? "bg-primary-foreground/15 text-primary-foreground font-semibold"
                  : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/5"
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            <span className="tracking-tight">{item.title}</span>
          </NavLink>
        ))}
        {isAnupAdmin && adminOnlyItems.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm ${
                isActive
                  ? "bg-primary-foreground/15 text-primary-foreground font-semibold"
                  : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/5"
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            <span className="tracking-tight">{item.title}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto p-4 bg-primary-foreground/5 rounded-2xl flex items-center gap-3">
        {selectedEmployee?.photo_url ? (
          <img src={selectedEmployee.photo_url} alt={selectedEmployee.name} className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-bold text-sm">
            {selectedEmployee ? getInitials(selectedEmployee.name) : "?"}
          </div>
        )}
        <div className="overflow-hidden flex-1">
          <p className="text-primary-foreground text-xs font-bold truncate">{selectedEmployee?.name || "..."}</p>
          <p className="text-primary-foreground/50 text-[10px] truncate">
            {selectedEmployee?.role ? roleLabels[selectedEmployee.role] : ""}
          </p>
        </div>
        <button onClick={handleSignOut} className="text-primary-foreground/50 hover:text-primary-foreground transition-colors">
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
