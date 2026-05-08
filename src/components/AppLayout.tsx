import { NavLink, Navigate, Outlet } from "react-router-dom";
import { Bell, Building2, Menu, Search } from "lucide-react";
import { AppSidebar, companyMenuItems } from "./AppSidebar";
import { SupportWidget } from "./product/SupportWidget";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";

const mobileItems = companyMenuItems.slice(0, 5);

export function AppLayout() {
  const { session, loading, isAnupAdmin, selectedCompany, selectedEmployee } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (!session) return <Navigate to="/login" replace />;
  if (!isAnupAdmin && (!selectedCompany || !selectedEmployee)) return <Navigate to="/login" replace />;

  const workspaceLabel = isAnupAdmin
    ? "Anup Solutions"
    : selectedCompany?.trade_name || selectedCompany?.name || "Empresa";

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <div className="flex min-h-screen flex-col md:ml-64">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-3 border-b bg-background/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <button className="rounded-lg p-2 text-muted-foreground md:hidden" aria-label="Menu">
              <Menu className="h-5 w-5" />
            </button>
            <div className="relative hidden w-full max-w-md sm:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                className="h-10 w-full rounded-lg border bg-card pl-10 pr-4 text-sm outline-none transition focus:ring-2 focus:ring-primary/20"
                placeholder="Buscar produto, pedido, cliente ou tela..."
                type="text"
              />
            </div>
            <div className="flex min-w-0 items-center gap-2 sm:hidden">
              <Building2 className="h-4 w-4 text-secondary" />
              <span className="truncate text-sm font-bold text-primary">{workspaceLabel}</span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className="hidden max-w-[220px] truncate rounded-lg bg-muted px-3 py-1.5 text-xs font-bold text-muted-foreground sm:block">
              {workspaceLabel}
            </span>
            <button className="relative text-muted-foreground transition hover:text-foreground" aria-label="Notificações">
              <Bell className="h-5 w-5" />
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-secondary" />
            </button>
            <div className="hidden items-center gap-2 rounded-lg bg-secondary/10 px-3 py-1.5 sm:flex">
              <div className="h-2 w-2 rounded-full bg-secondary" />
              <span className="text-xs font-bold text-secondary">ONLINE</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 pb-28 sm:p-6 md:pb-8 lg:p-8">
          <Outlet />
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t bg-card/95 px-2 py-2 shadow-2xl backdrop-blur md:hidden">
        {mobileItems.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            className={({ isActive }) =>
              `flex min-w-0 flex-col items-center gap-1 rounded-lg px-1 py-2 text-[10px] font-semibold ${
                isActive ? "bg-primary/10 text-primary" : "text-muted-foreground"
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            <span className="max-w-full truncate">{item.title}</span>
          </NavLink>
        ))}
      </nav>
      <SupportWidget />
    </div>
  );
}
