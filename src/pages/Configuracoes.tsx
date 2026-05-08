import { Save, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { PageHeader, ModuleCard } from "@/components/product/ProductPrimitives";
import { settingsGroups } from "@/data/saas";

const paymentOptions = ["Dinheiro", "PIX", "Crédito", "Débito", "Vale", "Múltiplos pagamentos"];

export default function Configuracoes() {
  return (
    <div>
      <PageHeader
        eyebrow="Admin empresa"
        title="Configurações"
        description="Central de parametrização da empresa: identidade visual, PDV, delivery, impressão, usuários, permissões e assinatura."
        action={
          <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
            <Save className="mr-2 h-4 w-4" />
            Salvar alterações
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        {settingsGroups.map((group) => (
          <ModuleCard key={group.title} {...group} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Card className="border-none shadow-sm">
          <CardContent className="space-y-4 p-5">
            <h2 className="font-bold text-primary">Empresa e marca</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input defaultValue="Açaí do Rapha" placeholder="Nome fantasia" />
              <Input defaultValue="Anup Cliente LTDA" placeholder="Razão social" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input defaultValue="#1E3A8A" placeholder="Cor primária" />
              <Input defaultValue="#10B981" placeholder="Cor secundária" />
            </div>
            <Button variant="outline">
              <UploadCloud className="mr-2 h-4 w-4" />
              Enviar logo para Cloudinary
            </Button>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="space-y-4 p-5">
            <h2 className="font-bold text-primary">PDV e pagamentos</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {paymentOptions.map((option) => (
                <label key={option} className="flex items-center gap-3 rounded-lg bg-surface-container-low p-3">
                  <Checkbox defaultChecked />
                  <span className="text-sm font-medium">{option}</span>
                </label>
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input defaultValue="10" placeholder="Desconto máximo (%)" />
              <Input defaultValue="3" placeholder="Cashback padrão (%)" />
            </div>
            <label className="flex items-center justify-between rounded-lg border p-4">
              <span className="font-medium">Troco automático</span>
              <Switch defaultChecked />
            </label>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
