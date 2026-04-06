import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ShoppingCart, Clock, Package } from "lucide-react";

interface Order {
  id: string;
  customer: string;
  items: string;
  total: number;
  status: string;
  time: string;
  paymentMethod: string;
}

const initialOrders: Order[] = [
  { id: "#8501", customer: "João Silva", items: "2x Burger XL, 1x Refrigerante", total: 85.3, status: "pending", time: "14:22", paymentMethod: "Pix" },
  { id: "#8500", customer: "Maria Santos", items: "1x Pizza Calabresa G", total: 64, status: "preparing", time: "14:10", paymentMethod: "Cartão" },
  { id: "#8499", customer: "Pedro Oliveira", items: "3x Moscow Mule", total: 84, status: "ready", time: "13:55", paymentMethod: "Dinheiro" },
  { id: "#8498", customer: "Ana Costa", items: "1x Pasta Carbonara, 1x Latte", total: 67.4, status: "delivered", time: "13:30", paymentMethod: "Pix" },
];

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  preparing: "Em Preparo",
  ready: "Pronto",
  sent: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  preparing: "bg-primary/10 text-primary",
  ready: "bg-secondary/20 text-secondary",
  sent: "bg-blue-100 text-blue-800",
  delivered: "bg-muted text-muted-foreground",
  cancelled: "bg-error/20 text-error",
};

export default function Pedidos() {
  const [orders, setOrders] = useState(initialOrders);
  const [filter, setFilter] = useState("all");

  const updateStatus = (id: string, newStatus: string) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
    toast.success(`✅ Pedido ${id} atualizado para "${statusLabels[newStatus]}"!`);
  };

  const filtered = filter === "all" ? orders : orders.filter(o => o.status === filter);

  return (
    <div>
      <header className="mb-10">
        <h2 className="text-2xl font-semibold text-primary">Pedidos Delivery</h2>
        <p className="text-muted-foreground text-sm mt-1">Gerencie os pedidos de delivery em tempo real.</p>
      </header>

      <div className="flex gap-2 mb-6 flex-wrap">
        {["all", "pending", "preparing", "ready", "sent", "delivered", "cancelled"].map(s => (
          <Button key={s} size="sm" variant={filter === s ? "default" : "outline"} onClick={() => setFilter(s)}
            className={filter === s ? "bg-primary text-primary-foreground" : ""}>
            {s === "all" ? "Todos" : statusLabels[s]}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <Package className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhum pedido encontrado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(order => (
            <Card key={order.id} className="shadow-md border-none hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-bold text-primary text-lg">{order.id}</p>
                    <p className="text-sm text-muted-foreground">{order.customer}</p>
                  </div>
                  <Badge className={`${statusColors[order.status]} border-0`}>
                    {statusLabels[order.status]}
                  </Badge>
                </div>
                <p className="text-sm mb-2">{order.items}</p>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-bold text-secondary">R$ {order.total.toFixed(2)}</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {order.time}
                  </span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {order.status === "pending" && (
                    <Button size="sm" onClick={() => updateStatus(order.id, "preparing")} className="bg-primary text-primary-foreground text-xs">Em Preparo</Button>
                  )}
                  {order.status === "preparing" && (
                    <Button size="sm" onClick={() => updateStatus(order.id, "ready")} className="bg-secondary text-secondary-foreground text-xs">Pronto</Button>
                  )}
                  {order.status === "ready" && (
                    <Button size="sm" onClick={() => updateStatus(order.id, "sent")} className="bg-primary text-primary-foreground text-xs">Enviado</Button>
                  )}
                  {order.status !== "delivered" && order.status !== "cancelled" && (
                    <Button size="sm" variant="outline" onClick={() => updateStatus(order.id, "cancelled")} className="text-error border-error/30 text-xs">Cancelar</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
