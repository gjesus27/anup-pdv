import { Outlet, Navigate } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { Bell, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

export function AppLayout() {
  const { session, loading, selectedCompany, selectedEmployee } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="space-y-4 w-96">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Must have company + employee selected to access PDV
  if (!selectedCompany || !selectedEmployee) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex w-full">
      <AppSidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <header className="h-16 sticky top-0 z-40 bg-background/80 backdrop-blur-xl flex items-center justify-between px-8 border-b border-border">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                className="w-full bg-surface-container-high border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none placeholder:text-muted-foreground"
                placeholder="Pesquisar..."
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            {selectedCompany && (
              <span className="text-xs font-bold text-muted-foreground bg-muted px-3 py-1.5 rounded-full truncate max-w-[200px]">
                {selectedCompany.trade_name || selectedCompany.name}
              </span>
            )}
            <button className="relative text-muted-foreground hover:text-foreground transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-secondary rounded-full" />
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/10 rounded-full">
              <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span className="text-xs font-bold text-secondary">ONLINE</span>
            </div>
          </div>
        </header>
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
