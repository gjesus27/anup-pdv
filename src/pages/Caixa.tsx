import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { DollarSign, ArrowUpCircle, ArrowDownCircle, Lock } from "lucide-react";

export default function Caixa() {
  const [isOpen, setIsOpen] = useState(false);
  const [saldo, setSaldo] = useState(0);
  const [valor, setValor] = useState("");
  const [motivo, setMotivo] = useState("");

  const handleAbrir = () => {
    const v = parseFloat(valor);
    if (isNaN(v) || v <= 0) { toast.error("❌ Valor inválido."); return; }
    setSaldo(v);
    setIsOpen(true);
    setValor("");
    toast.success("✅ Caixa aberto com sucesso!");
  };

  const handleSangria = () => {
    const v = parseFloat(valor);
    if (isNaN(v) || v <= 0) { toast.error("❌ Valor inválido."); return; }
    setSaldo((s) => s - v);
    setValor("");
    setMotivo("");
    toast.success("✅ Sangria realizada!");
  };

  const handleFechar = () => {
    setIsOpen(false);
    toast.success("✅ Caixa fechado com sucesso!");
  };

  return (
    <div>
      <header className="mb-10">
        <h2 className="text-2xl font-semibold text-primary">Caixa</h2>
        <p className="text-muted-foreground text-sm mt-1">Abertura, sangria e fechamento do caixa.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="shadow-md border-none">
          <CardContent className="p-8 text-center">
            <p className="text-sm font-semibold text-muted-foreground uppercase mb-2">Saldo Atual</p>
            <p className="text-4xl font-bold text-primary">R$ {saldo.toFixed(2)}</p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isOpen ? "bg-secondary" : "bg-error"}`} />
              <span className="text-xs font-bold uppercase">{isOpen ? "Caixa Aberto" : "Caixa Fechado"}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-none">
          <CardContent className="p-8 text-center">
            <p className="text-sm font-semibold text-muted-foreground uppercase mb-2">Entradas</p>
            <p className="text-3xl font-bold text-secondary">R$ {saldo.toFixed(2)}</p>
            <ArrowUpCircle className="h-8 w-8 text-secondary mx-auto mt-4 opacity-30" />
          </CardContent>
        </Card>

        <Card className="shadow-md border-none">
          <CardContent className="p-8 text-center">
            <p className="text-sm font-semibold text-muted-foreground uppercase mb-2">Saídas</p>
            <p className="text-3xl font-bold text-error">R$ 0.00</p>
            <ArrowDownCircle className="h-8 w-8 text-error mx-auto mt-4 opacity-30" />
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4 flex-wrap">
        {!isOpen ? (
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                <DollarSign className="h-4 w-4 mr-2" /> Abrir Caixa
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Abrir Caixa</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <Input placeholder="Valor Inicial (R$)" value={valor} onChange={(e) => setValor(e.target.value)} type="number" />
                <Button onClick={handleAbrir} className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground">Confirmar Abertura</Button>
              </div>
            </DialogContent>
          </Dialog>
        ) : (
          <>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-secondary text-secondary hover:bg-secondary/10">
                  <ArrowDownCircle className="h-4 w-4 mr-2" /> Sangria
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Registrar Sangria</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <Input placeholder="Valor (R$)" value={valor} onChange={(e) => setValor(e.target.value)} type="number" />
                  <Input placeholder="Motivo" value={motivo} onChange={(e) => setMotivo(e.target.value)} />
                  <Button onClick={handleSangria} className="w-full">Confirmar Sangria</Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <Lock className="h-4 w-4 mr-2" /> Fechar Caixa
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Fechar Caixa</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <p className="text-sm text-muted-foreground">Saldo final: <strong className="text-primary">R$ {saldo.toFixed(2)}</strong></p>
                  <Button onClick={handleFechar} variant="destructive" className="w-full">Confirmar Fechamento</Button>
                </div>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    </div>
  );
}
