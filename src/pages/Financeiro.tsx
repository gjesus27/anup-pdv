import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, TrendingUp, TrendingDown } from "lucide-react";

interface AccountPayable {
  id: number;
  description: string;
  amount: number;
  dueDate: string;
  status: string;
}

const initialAccounts: AccountPayable[] = [
  { id: 1, description: "Aluguel - Junho", amount: 4500, dueDate: "2026-04-10", status: "pending" },
  { id: 2, description: "Fornecedor - Bebidas", amount: 1200, dueDate: "2026-04-05", status: "paid" },
  { id: 3, description: "Fornecedor - Carnes", amount: 3800, dueDate: "2026-04-15", status: "pending" },
];

export default function Financeiro() {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [open, setOpen] = useState(false);
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");

  const handleAdd = () => {
    if (!desc || !amount) { toast.error("❌ Preencha os campos."); return; }
    setAccounts([...accounts, { id: Date.now(), description: desc, amount: parseFloat(amount), dueDate, status: "pending" }]);
    setOpen(false); setDesc(""); setAmount(""); setDueDate("");
    toast.success("✅ Conta adicionada!");
  };

  const markPaid = (id: number) => {
    setAccounts(accounts.map(a => a.id === id ? { ...a, status: "paid" } : a));
    toast.success("✅ Marcado como pago!");
  };

  return (
    <div>
      <header className="mb-10">
        <h2 className="text-2xl font-semibold text-primary">Financeiro</h2>
        <p className="text-muted-foreground text-sm mt-1">Gerencie recebíveis, contas a pagar e salários.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="shadow-md border-none">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-6 w-6 text-secondary" />
              <p className="font-semibold text-muted-foreground uppercase text-sm">Total Recebíveis</p>
            </div>
            <p className="text-3xl font-bold text-secondary">R$ 12.450,00</p>
          </CardContent>
        </Card>
        <Card className="shadow-md border-none">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-2">
              <TrendingDown className="h-6 w-6 text-error" />
              <p className="font-semibold text-muted-foreground uppercase text-sm">Total a Pagar</p>
            </div>
            <p className="text-3xl font-bold text-error">
              R$ {accounts.filter(a => a.status === "pending").reduce((s, a) => s + a.amount, 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-primary">Contas a Pagar</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground"><Plus className="h-4 w-4 mr-2" /> Nova Conta</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nova Conta a Pagar</DialogTitle></DialogHeader>
            <div className="space-y-3 mt-4">
              <Input placeholder="Descrição" value={desc} onChange={e => setDesc(e.target.value)} />
              <Input placeholder="Valor (R$)" type="number" value={amount} onChange={e => setAmount(e.target.value)} />
              <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
              <Button onClick={handleAdd} className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground">Adicionar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-xl shadow-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map(a => (
              <TableRow key={a.id}>
                <TableCell className="font-medium">{a.description}</TableCell>
                <TableCell className="font-semibold">R$ {a.amount.toFixed(2)}</TableCell>
                <TableCell>{a.dueDate}</TableCell>
                <TableCell>
                  <Badge className={a.status === "paid" ? "bg-secondary/20 text-secondary border-0" : "bg-amber-100 text-amber-800 border-0"}>
                    {a.status === "paid" ? "Pago" : "Pendente"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {a.status === "pending" && (
                    <Button size="sm" variant="outline" onClick={() => markPaid(a.id)} className="text-xs">Marcar Pago</Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
