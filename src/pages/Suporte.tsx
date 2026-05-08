import { Headphones, MessageSquareText, MonitorCog, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader, ModuleCard } from "@/components/product/ProductPrimitives";
import { supportTickets } from "@/data/saas";

export default function Suporte() {
  return (
    <div>
      <PageHeader
        eyebrow="Anup Solutions"
        title="Central de suporte"
        description="Chat, chamados, base de ajuda e modo suporte para atendimento remoto com visibilidade da empresa cliente."
        action={
          <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
            <Plus className="mr-2 h-4 w-4" />
            Novo chamado
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <ModuleCard title="Chat suporte" text="Converse com a Anup e envie contexto da tela atual automaticamente." icon={MessageSquareText} />
        <ModuleCard title="Modo suporte" text="Autorize acesso remoto interno sem expor senha de administrador." icon={MonitorCog} />
        <ModuleCard title="SLA operacional" text="Classificação por urgência, área responsável e histórico completo." icon={Headphones} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_420px]">
        <Card className="border-none shadow-sm">
          <CardContent className="p-5">
            <h2 className="mb-4 font-bold text-primary">Chamados da empresa</h2>
            <div className="space-y-3">
              {supportTickets.map((ticket) => (
                <div key={ticket.id} className="rounded-lg border bg-card p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bold">{ticket.id} • {ticket.subject}</p>
                    <Badge variant="secondary">{ticket.status}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">Responsável: {ticket.owner} • Empresa: {ticket.company}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-5">
            <h2 className="mb-2 font-bold text-primary">Abrir chamado rápido</h2>
            <p className="mb-4 text-sm text-muted-foreground">Use para problemas de impressão, cobrança, permissões, pedidos ou instabilidade.</p>
            <Textarea className="mb-3 min-h-40" placeholder="Descreva o problema com detalhes operacionais." />
            <Button className="w-full bg-primary">Enviar para Anup Solutions</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
