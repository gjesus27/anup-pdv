import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader, StatCard } from "@/components/product/ProductPrimitives";
import { anupKpis, money, revenueSeries, supportTickets } from "@/data/saas";
import { Eye, LogIn, ShieldCheck } from "lucide-react";

const companies = [
  { name: "Açaí do Rapha", plan: "Ativo", mrr: 49.9, orders: 2184, health: "Excelente" },
  { name: "Burger House", plan: "Ativo", mrr: 49.9, orders: 1430, health: "Bom" },
  { name: "Padaria Central", plan: "Pendente", mrr: 0, orders: 934, health: "Atenção" },
  { name: "Pizzaria Napoli", plan: "Ativo", mrr: 49.9, orders: 801, health: "Bom" },
];

export default function AnupAdmin() {
  return (
    <div>
      <PageHeader
        eyebrow="Anup Solutions"
        title="Painel super admin"
        description="Controle SaaS central com faturamento, empresas, inadimplência, suporte, impersonação e visão operacional do produto."
        action={
          <>
            <Button variant="outline">
              <Eye className="mr-2 h-4 w-4" />
              Auditoria
            </Button>
            <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
              <ShieldCheck className="mr-2 h-4 w-4" />
              Modo suporte
            </Button>
          </>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {anupKpis.map((kpi, index) => (
          <StatCard key={kpi.label} {...kpi} tone={index === 2 ? "danger" : index === 3 ? "success" : "default"} />
        ))}
      </div>

      <div className="mb-6 grid gap-4 xl:grid-cols-[1.35fr_1fr]">
        <Card className="border-none shadow-sm">
          <CardContent className="p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-primary">Crescimento mensal</h2>
                <p className="text-sm text-muted-foreground">Receita SaaS e base de clientes nos últimos dias.</p>
              </div>
              <Badge className="bg-secondary/15 text-secondary hover:bg-secondary/15">+18% MoM</Badge>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueSeries}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="receita" stroke="#10B981" fill="#10B981" fillOpacity={0.18} />
                  <Area type="monotone" dataKey="pedidos" stroke="#1E3A8A" fill="#1E3A8A" fillOpacity={0.1} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-5">
            <h2 className="mb-1 font-bold text-primary">Ranking faturamento empresas</h2>
            <p className="mb-5 text-sm text-muted-foreground">Clientes com maior volume operacional.</p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={companies}>
                  <XAxis dataKey="name" hide />
                  <YAxis hide />
                  <Tooltip />
                  <Bar dataKey="orders" fill="#1E3A8A" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Card className="border-none shadow-sm">
          <CardContent className="p-5">
            <h2 className="mb-4 font-bold text-primary">Empresas recentes</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>MRR</TableHead>
                  <TableHead>Pedidos</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.map((company) => (
                  <TableRow key={company.name}>
                    <TableCell className="font-semibold">{company.name}</TableCell>
                    <TableCell>
                      <Badge className={company.plan === "Ativo" ? "bg-secondary/15 text-secondary" : "bg-amber-100 text-amber-800"}>
                        {company.plan}
                      </Badge>
                    </TableCell>
                    <TableCell>{money(company.mrr)}</TableCell>
                    <TableCell>{company.orders}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline">
                        <LogIn className="mr-2 h-4 w-4" />
                        Impersonar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-5">
            <h2 className="mb-4 font-bold text-primary">Chamados suporte</h2>
            <div className="space-y-3">
              {supportTickets.map((ticket) => (
                <div key={ticket.id} className="rounded-lg bg-surface-container-low p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bold">{ticket.id}</p>
                    <Badge variant="secondary">{ticket.status}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{ticket.company}</p>
                  <p className="mt-2 text-sm">{ticket.subject}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
