import { ArrowRightLeft, Merge, Scissors, Timer, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/product/ProductPrimitives";
import { money, tables } from "@/data/saas";

const statusClass: Record<string, string> = {
  Livre: "bg-slate-100 text-slate-700",
  Ocupada: "bg-primary/10 text-primary",
  Aguardando: "bg-amber-100 text-amber-800",
  Fechando: "bg-secondary/15 text-secondary",
};

export default function Comandas() {
  return (
    <div>
      <PageHeader
        eyebrow="Salão"
        title="Mesas e comandas"
        description="Abra mesas, transfira consumo, junte comandas, separe contas e acompanhe o tempo visual de cada atendimento."
        action={
          <>
            <Button variant="outline">
              <ArrowRightLeft className="mr-2 h-4 w-4" />
              Transferir
            </Button>
            <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
              Abrir mesa
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {tables.map((table) => (
          <div key={table.id} className="rounded-lg border bg-card p-5 shadow-sm transition hover:shadow-md">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-primary">{table.id}</h2>
                <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                  <Timer className="h-4 w-4" />
                  {table.time}
                </p>
              </div>
              <Badge className={`${statusClass[table.status]} border-0 hover:${statusClass[table.status]}`}>{table.status}</Badge>
            </div>
            <div className="mb-5 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-surface-container-low p-3">
                <p className="text-xs text-muted-foreground">Pessoas</p>
                <p className="mt-1 flex items-center gap-2 text-lg font-bold">
                  <Users className="h-4 w-4 text-secondary" />
                  {table.guests}
                </p>
              </div>
              <div className="rounded-lg bg-surface-container-low p-3">
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="mt-1 text-lg font-bold text-primary">{money(table.total)}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Button size="sm" variant="outline">
                <Merge className="mr-1 h-4 w-4" />
                Juntar
              </Button>
              <Button size="sm" variant="outline">
                <Scissors className="mr-1 h-4 w-4" />
                Separar
              </Button>
              <Button size="sm" className="bg-primary">
                Fechar
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
