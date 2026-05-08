import { CalendarClock, CreditCard, QrCode, RefreshCw, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PageHeader, StatCard } from "@/components/product/ProductPrimitives";
import { money } from "@/data/saas";

const payments = [
  { date: "05/05/2026", method: "PIX Mercado Pago", amount: 49.9, status: "Recebido" },
  { date: "05/04/2026", method: "Cartão crédito", amount: 49.9, status: "Recebido" },
  { date: "05/03/2026", method: "PIX Mercado Pago", amount: 49.9, status: "Recebido" },
];

export default function Assinatura() {
  return (
    <div>
      <PageHeader
        eyebrow="SaaS"
        title="Assinatura Anup PDV Cloud"
        description="Plano mensal de R$49,90 com PIX, cartão, cobrança recorrente, renovação, histórico e bloqueio inteligente."
        action={
          <>
            <Button variant="outline">
              <QrCode className="mr-2 h-4 w-4" />
              Gerar PIX
            </Button>
            <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
              <CreditCard className="mr-2 h-4 w-4" />
              Atualizar cartão
            </Button>
          </>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Status assinatura" value="Ativa" change="renovação automática ligada" icon={RefreshCw} tone="success" />
        <StatCard label="Mensalidade" value={money(49.9)} change="plano padrão por empresa" icon={CreditCard} />
        <StatCard label="Próximo vencimento" value="05/06" change="27 dias restantes" icon={CalendarClock} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <Card className="border-none shadow-sm">
          <CardContent className="p-5">
            <h2 className="mb-1 font-bold text-primary">Histórico de pagamentos</h2>
            <p className="mb-5 text-sm text-muted-foreground">Eventos de cobrança Mercado Pago e recibos da assinatura.</p>
            <div className="space-y-3">
              {payments.map((payment) => (
                <div key={payment.date} className="flex items-center justify-between rounded-lg bg-surface-container-low p-4">
                  <div>
                    <p className="font-semibold">{payment.method}</p>
                    <p className="text-xs text-muted-foreground">{payment.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{money(payment.amount)}</p>
                    <Badge className="bg-secondary/15 text-secondary">{payment.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-lg bg-amber-100 p-2 text-amber-800">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-bold text-primary">Bloqueio inteligente</h2>
                <p className="text-sm text-muted-foreground">Régua automática de cobrança.</p>
              </div>
            </div>
            <Progress value={76} className="mb-4" />
            <div className="space-y-3 text-sm">
              <p><strong>D+0:</strong> aviso no painel e envio por WhatsApp.</p>
              <p><strong>D+3:</strong> restringe relatórios financeiros.</p>
              <p><strong>D+7:</strong> modo somente consulta para admins.</p>
              <p><strong>D+10:</strong> bloqueio operacional com suporte Anup.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
