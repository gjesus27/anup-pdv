import { CreditCard, Gift, Plus, Search, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader, StatCard } from "@/components/product/ProductPrimitives";
import { customers, money } from "@/data/saas";

export default function Clientes() {
  const cashbackTotal = customers.reduce((sum, customer) => sum + customer.cashback, 0);
  const creditTotal = customers.reduce((sum, customer) => sum + customer.credit, 0);

  return (
    <div>
      <PageHeader
        eyebrow="Relacionamento"
        title="Clientes, cashback e fiado"
        description="Cadastro completo de clientes com histórico de compras, fidelidade, cashback, limite de crédito e controle de fiado."
        action={
          <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
            <Plus className="mr-2 h-4 w-4" />
            Novo cliente
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Clientes ativos" value="1.284" change="+84 este mês" icon={UserRound} />
        <StatCard label="Cashback aberto" value={money(cashbackTotal)} change="expira em 30 dias" icon={Gift} tone="success" />
        <StatCard label="Fiado em aberto" value={money(creditTotal)} change="3 clientes com limite" icon={CreditCard} tone="danger" />
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-bold text-primary">Base de clientes</h2>
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" placeholder="Buscar por nome ou telefone" />
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Compras</TableHead>
                <TableHead>Cashback</TableHead>
                <TableHead>Fiado</TableHead>
                <TableHead>Última compra</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.phone}>
                  <TableCell>
                    <p className="font-semibold">{customer.name}</p>
                    <p className="text-xs text-muted-foreground">{customer.phone}</p>
                  </TableCell>
                  <TableCell>{customer.visits}</TableCell>
                  <TableCell className="font-semibold text-secondary">{money(customer.cashback)}</TableCell>
                  <TableCell>
                    <Badge className={customer.credit > 0 ? "bg-amber-100 text-amber-800" : "bg-secondary/15 text-secondary"}>
                      {customer.credit > 0 ? money(customer.credit) : "Sem débito"}
                    </Badge>
                  </TableCell>
                  <TableCell>{customer.lastOrder}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
