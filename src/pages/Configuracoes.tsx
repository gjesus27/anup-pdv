import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { User, CreditCard } from "lucide-react";

export default function Configuracoes() {
  const [name, setName] = useState("Arthur Menezes");
  const [email, setEmail] = useState("arthur@anup.com.br");
  const [payments, setPayments] = useState({
    pix: true, dinheiro: true, debito: true, credito: true, cashback: false, ticket: false,
  });

  const handleSave = () => toast.success("✅ Perfil atualizado com sucesso!");

  const togglePayment = (key: string) => {
    setPayments(p => ({ ...p, [key]: !p[key as keyof typeof p] }));
    toast.success("✅ Forma de pagamento atualizada!");
  };

  return (
    <div>
      <header className="mb-10">
        <h2 className="text-2xl font-semibold text-primary">Configurações</h2>
        <p className="text-muted-foreground text-sm mt-1">Gerencie seu perfil e preferências do sistema.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile */}
        <Card className="shadow-md border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <User className="h-5 w-5" /> Perfil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-bold text-xl">
                AM
              </div>
              <Button variant="outline" size="sm">Trocar Foto</Button>
            </div>
            <Input placeholder="Nome" value={name} onChange={e => setName(e.target.value)} />
            <Input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} type="email" />
            <Input placeholder="Senha atual" type="password" />
            <Input placeholder="Nova senha" type="password" />
            <Button onClick={handleSave} className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">Atualizar Perfil</Button>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card className="shadow-md border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <CreditCard className="h-5 w-5" /> Formas de Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(payments).map(([key, val]) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer">
                <Checkbox checked={val} onCheckedChange={() => togglePayment(key)} />
                <span className="capitalize font-medium">{key === "credito" ? "Crédito" : key === "debito" ? "Débito" : key.charAt(0).toUpperCase() + key.slice(1)}</span>
              </label>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
