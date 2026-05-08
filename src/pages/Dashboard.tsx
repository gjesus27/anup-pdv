import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader, ModuleCard, StatCard } from "@/components/product/ProductPrimitives";
import { companyKpis, deliveryOrders, featureMap, money, revenueSeries, settingsGroups } from "@/data/saas";
import { ArrowRight, Printer, Sparkles } from "lucide-react";

export default function Dashboard() {
  return (
    <div>
      <PageHeader
        eyebrow="Dashboard empresa"
        title="Operação em tempo real"
        description="Resumo financeiro e operacional isolado por empresa, com acesso restrito a admins para números sensíveis e configurações."
        action={
          <>
            <Button variant="outline">
              <Printer className="mr-2 h-4 w-4" />
              Testar impressão
            </Button>
            <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
              <Sparkles className="mr-2 h-4 w-4" />
              Onboarding
            </Button>
          </>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {companyKpis.map((kpi, index) => (
          <StatCard key={kpi.label} {...kpi} tone={index === 0 ? "success" : index === 3 ? "danger" : "default"} />
        ))}
      </div>

      <div className="mb-6 grid gap-4 xl:grid-cols-[1.35fr_1fr]">
        <Card className="border-none shadow-sm">
          <CardContent className="p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-primary">Receita e pedidos</h2>
                <p className="text-sm text-muted-foreground">Últimos 7 dias por company_id.</p>
              </div>
              <Badge className="bg-secondary/15 text-secondary hover:bg-secondary/15">+12,4%</Badge>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueSeries}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip formatter={(value, name) => (name === "receita" ? money(Number(value)) : value)} />
                  <Bar dataKey="receita" fill="#10B981" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="pedidos" fill="#1E3A8A" radius={[8, 8, 0, 0]} opacity={0.35} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold text-primary">Pedidos ativos</h2>
              <Button variant="ghost" size="sm">
                Ver todos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-3">
              {deliveryOrders.map((order) => (
                <div key={order.id} className="rounded-lg bg-surface-container-low p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bold">{order.id} • {order.customer}</p>
                    <Badge variant="secondary">{order.status}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{order.channel} • {order.eta} • {order.driver}</p>
                  <p className="mt-2 font-bold text-secondary">{money(order.total)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="border-none shadow-sm">
          <CardContent className="p-5">
            <h2 className="mb-4 font-bold text-primary">Módulos do produto</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {featureMap.map((feature) => (
                <ModuleCard key={feature.title} title={feature.title} text="Pronto para evoluir com serviço, repositório e RLS dedicado." icon={feature.icon} />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-5">
            <h2 className="mb-4 font-bold text-primary">Configurações críticas</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {settingsGroups.slice(0, 4).map((group) => (
                <ModuleCard key={group.title} {...group} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
