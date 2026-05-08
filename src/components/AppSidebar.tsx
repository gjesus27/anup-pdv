import { NavLink } from "react-router-dom";
import {
  Armchair,
  BadgeDollarSign,
  BarChart,
  Building2,
  DollarSign,
  FileText,
  Headphones,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShoppingCart,
  Truck,
  Users,
  Utensils,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export const companyMenuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "PDV", url: "/pdv", icon: Utensils },
  { title: "Caixa", url: "/caixa", icon: DollarSign },
  { title: "Comandas", url: "/comandas", icon: Armchair },
  { title: "Usuários", url: "/usuarios", icon: Users },
  { title: "Estoque", url: "/estoque", icon: Package },
  { title: "Delivery", url: "/pedidos", icon: ShoppingCart },
  { title: "Entregadores", url: "/entregadores", icon: Truck },
  { title: "Clientes", url: "/clientes", icon: Users },
  { title: "Financeiro", url: "/financeiro", icon: BarChart },
  { title: "Assinatura", url: "/assinatura", icon: BadgeDollarSign },
  { title: "Suporte", url: "/suporte", icon: Headphones },
  { title: "Configurações", url: "/configuracoes", icon: Settings },
  { title: "Histórico", url: "/historico", icon: FileText },
];

const adminOnlyItems = [
  { title: "Anup Admin", url: "/anup", icon: Building2 },
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

  return (
    <aside className="fixed left-0 top-0 z-50 hidden h-screen w-64 flex-col gap-2 bg-primary p-4 md:flex">
      <div className="mb-4 px-2">
        <h1 className="text-xl font-bold tracking-tight text-primary-foreground">Anup PDV Cloud</h1>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-primary-foreground/50">
          SaaS multiempresa
        </p>
      </div>

      {selectedCompany && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-primary-foreground/5 px-3 py-2">
          <Building2 className="h-4 w-4 shrink-0 text-secondary" />
          <span className="truncate text-xs font-bold text-primary-foreground">
            {selectedCompany.trade_name || selectedCompany.name}
          </span>
          {isAnupAdmin && (
            <button
              onClick={clearCompanySelection}
              className="ml-auto shrink-0 text-[10px] text-primary-foreground/50 hover:text-primary-foreground"
              title="Trocar empresa"
            >
              x
            </button>
          )}
        </div>
      )}

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto pr-1">
        {isAnupAdmin &&
          adminOnlyItems.map((item) => (
            <NavLink
              key={item.url}
              to={item.url}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition ${
                  isActive
                    ? "bg-primary-foreground/15 font-semibold text-primary-foreground"
                    : "text-primary-foreground/70 hover:bg-primary-foreground/5 hover:text-primary-foreground"
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              <span>{item.title}</span>
            </NavLink>
          ))}

        {companyMenuItems.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition ${
                isActive
                  ? "bg-primary-foreground/15 font-semibold text-primary-foreground"
                  : "text-primary-foreground/70 hover:bg-primary-foreground/5 hover:text-primary-foreground"
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{item.title}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto flex items-center gap-3 rounded-lg bg-primary-foreground/5 p-4">
        {selectedEmployee?.photo_url ? (
          <img src={selectedEmployee.photo_url} alt={selectedEmployee.name} className="h-10 w-10 rounded-full object-cover" />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-sm font-bold text-secondary-foreground">
            {selectedEmployee ? getInitials(selectedEmployee.name) : "AN"}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-bold text-primary-foreground">{selectedEmployee?.name || "Operador"}</p>
          <p className="truncate text-[10px] text-primary-foreground/50">
            {selectedEmployee?.role ? roleLabels[selectedEmployee.role] : "Sessão ativa"}
          </p>
        </div>
        <button onClick={signOut} className="text-primary-foreground/50 transition hover:text-primary-foreground">
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
