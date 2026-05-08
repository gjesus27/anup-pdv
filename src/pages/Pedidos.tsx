import { useState } from "react";
import { Bike, Clock, MessageCircle, PackageCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader, StatCard } from "@/components/product/ProductPrimitives";
import { deliveryOrders, money } from "@/data/saas";

const filters = ["Todos", "Novo", "Preparo", "Pronto", "Rota", "Entregue"];
const statusClass: Record<string, string> = {
  Novo: "bg-amber-100 text-amber-800",
  Preparo: "bg-primary/10 text-primary",
  Pronto: "bg-secondary/15 text-secondary",
  Rota: "bg-sky-100 text-sky-800",
};

export default function Pedidos() {
  const [filter, setFilter] = useState("Todos");
  const orders = filter === "Todos" ? deliveryOrders : deliveryOrders.filter((order) => order.status === filter);

  return (
    <div>
      <PageHeader
        eyebrow="Delivery"
        title="Pedidos delivery e preparo"
        description="Kanban operacional para pedidos de WhatsApp, balcão, iFood e canais próprios, com entregadores, taxa e tempo estimado."
        action={
          <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
            <MessageCircle className="mr-2 h-4 w-4" />
            Novo WhatsApp
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Pedidos ativos" value="24" change="7 aguardando preparo" icon={PackageCheck} />
        <StatCard label="Tempo médio" value="28 min" change="-4 min vs ontem" icon={Clock} tone="success" />
        <StatCard label="Entregadores online" value="5" change="2 em rota" icon={Bike} />
      </div>

      <div className="mb-5 flex gap-2 overflow-x-auto">
        {filters.map((item) => (
          <Button key={item} variant={filter === item ? "default" : "outline"} onClick={() => setFilter(item)} className="shrink-0">
            {item}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {orders.map((order) => (
          <Card key={order.id} className="border-none shadow-sm">
            <CardContent className="p-5">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-black text-primary">{order.id}</p>
                  <p className="text-sm text-muted-foreground">{order.customer}</p>
                </div>
                <Badge className={`${statusClass[order.status] || "bg-muted text-muted-foreground"} border-0`}>
                  {order.status}
                </Badge>
              </div>
              <div className="space-y-2 text-sm">
                <p><strong>Canal:</strong> {order.channel}</p>
                <p><strong>Entrega:</strong> {order.eta}</p>
                <p><strong>Entregador:</strong> {order.driver}</p>
              </div>
              <p className="mt-5 text-xl font-black text-secondary">{money(order.total)}</p>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <Button size="sm" variant="outline">WhatsApp</Button>
                <Button size="sm" className="bg-primary">Avançar</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
