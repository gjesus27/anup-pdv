import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { MapPin, Navigation, Package } from "lucide-react";

const deliveries = [
  { id: "#8499", customer: "Pedro Oliveira", address: "Rua das Flores, 123 - Centro", phone: "(11) 99999-0001", items: "3x Moscow Mule", total: 84 },
  { id: "#8497", customer: "Carlos Mendes", address: "Av. Brasil, 456 - Jardim América", phone: "(11) 99999-0002", items: "1x Pizza + 2x Refrigerante", total: 79 },
  { id: "#8495", customer: "Lucia Ferreira", address: "Rua Paraná, 789 - Vila Nova", phone: "(11) 99999-0003", items: "2x Burger XL", total: 77.8 },
];

export default function Entregadores() {
  const openWaze = (address: string) => {
    window.open(`https://waze.com/ul?q=${encodeURIComponent(address)}`, "_blank");
    toast.success("✨ Rota aberta no Waze!");
  };

  return (
    <div>
      <header className="mb-10">
        <h2 className="text-2xl font-semibold text-primary">Entregadores</h2>
        <p className="text-muted-foreground text-sm mt-1">Pedidos prontos para entrega.</p>
      </header>

      {deliveries.length === 0 ? (
        <div className="text-center py-20">
          <Package className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhuma entrega pendente.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deliveries.map(d => (
            <Card key={d.id} className="shadow-md border-none hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <p className="font-bold text-primary text-lg">{d.id}</p>
                  <Badge className="bg-secondary/20 text-secondary border-0">Pronto</Badge>
                </div>
                <h3 className="font-semibold mb-1">{d.customer}</h3>
                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {d.address}
                </p>
                <p className="text-sm text-muted-foreground mb-3">{d.phone}</p>
                <p className="text-sm mb-3">{d.items}</p>
                <p className="text-lg font-bold text-secondary mb-4">R$ {d.total.toFixed(2)}</p>
                <Button
                  onClick={() => openWaze(d.address)}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-primary-foreground"
                >
                  <Navigation className="h-4 w-4 mr-2" /> Ver Rota no Waze
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
