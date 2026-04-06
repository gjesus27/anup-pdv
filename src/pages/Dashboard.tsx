import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, ShoppingCart, Package, ArrowRight, TrendingUp, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

const chartData = [
  { day: "SEG", receita: 3200, despesas: 800 },
  { day: "TER", receita: 2800, despesas: 1000 },
  { day: "QUA", receita: 4100, despesas: 600 },
  { day: "QUI", receita: 3500, despesas: 1200 },
  { day: "SEX", receita: 5200, despesas: 400 },
  { day: "SÁB", receita: 6100, despesas: 300 },
  { day: "DOM", receita: 4250, despesas: 950 },
];

const recentOrders = [
  { id: "#8492", table: "Mesa 08", item: "Combo Burguer Família", time: "Há 5 min", status: "Preparando" },
  { id: "#8491", table: "Mesa 12", item: "4x Chopp Artesanal", time: "Há 12 min", status: "Entregue" },
  { id: "#8490", table: "Delivery", item: "2x Pizza Calabresa", time: "Há 18 min", status: "Pronto" },
];

export default function Dashboard() {
  return (
    <div>
      <header className="mb-10">
        <h2 className="text-2xl font-semibold text-primary leading-tight">Dashboard</h2>
        <p className="text-muted-foreground text-sm mt-1">Resumo das operações de hoje.</p>
      </header>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Vendas do Dia */}
        <Card className="overflow-hidden hover:shadow-lg transition-shadow border-none shadow-md">
          <CardContent className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-primary font-semibold text-sm tracking-tight mb-4 uppercase">Vendas do Dia</p>
                <h3 className="text-4xl font-bold text-secondary tracking-tighter leading-none">R$ 4.250</h3>
              </div>
              <div className="bg-secondary-container/30 p-4 rounded-2xl">
                <DollarSign className="h-8 w-8 text-secondary" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center text-xs font-bold text-secondary bg-secondary-container/30 px-2 py-1 rounded-full">
                <TrendingUp className="h-3 w-3 mr-1" /> +12%
              </span>
              <p className="text-muted-foreground text-xs">Comparativo dia anterior</p>
            </div>
          </CardContent>
        </Card>

        {/* Pedidos Aguardando */}
        <Card className="overflow-hidden hover:shadow-lg transition-shadow border-l-4 border-l-primary border-t-0 border-r-0 border-b-0 shadow-md">
          <CardContent className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-primary font-semibold text-sm tracking-tight mb-4 uppercase">Pedidos Aguardando</p>
                <h3 className="text-4xl font-bold text-primary tracking-tighter leading-none">18</h3>
              </div>
              <div className="bg-primary/10 p-4 rounded-2xl">
                <ShoppingCart className="h-8 w-8 text-primary" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">
                <Clock className="h-3 w-3 mr-1" /> AGORA
              </span>
              <p className="text-muted-foreground text-xs">Novos nas últimas 2h</p>
            </div>
          </CardContent>
        </Card>

        {/* Estoque Crítico */}
        <Card className="overflow-hidden hover:shadow-lg transition-shadow border-none shadow-md">
          <CardContent className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-error font-semibold text-sm tracking-tight mb-4 uppercase">Estoque Crítico</p>
                <h3 className="text-xl font-bold text-error tracking-tight mt-4">5 itens abaixo do mínimo</h3>
              </div>
              <div className="bg-error-container/30 p-4 rounded-2xl">
                <Package className="h-8 w-8 text-error" />
              </div>
            </div>
            <button className="text-error text-xs font-extrabold uppercase hover:underline flex items-center gap-1">
              Verificar estoque <ArrowRight className="h-3 w-3" />
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className="shadow-md border-none mb-8">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h3 className="text-xl font-bold text-primary tracking-tight">Fluxo de Caixa</h3>
              <p className="text-muted-foreground text-sm">Receita vs. Despesas nos últimos 7 dias</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.75rem",
                    fontSize: "12px",
                  }}
                />
                <Legend />
                <Bar dataKey="receita" name="Receita" fill="hsl(160, 84%, 39%)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="despesas" name="Despesas" fill="hsl(222, 78%, 33%)" radius={[8, 8, 0, 0]} opacity={0.3} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card className="shadow-md border-none">
        <CardContent className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-lg font-bold text-primary">Últimos Pedidos</h4>
            <button className="text-primary text-xs font-bold hover:underline uppercase">Ver todos</button>
          </div>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="bg-surface-container-low p-4 rounded-xl flex items-center justify-between hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-secondary-container/20 rounded-xl flex items-center justify-center text-secondary">
                    <ShoppingCart className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-primary">{order.table} - {order.item}</p>
                    <p className="text-[10px] text-muted-foreground font-medium">Pedido {order.id} • {order.time}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 text-[10px] font-bold rounded-full uppercase ${
                  order.status === "Preparando" ? "bg-secondary-container/30 text-on-secondary-container" :
                  order.status === "Pronto" ? "bg-primary/10 text-primary" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {order.status}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
