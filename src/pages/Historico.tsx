import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { MoreHorizontal, Eye, XCircle, Package } from "lucide-react";

interface Sale {
  id: string;
  date: string;
  customer: string;
  total: number;
  payment: string;
  status: string;
  items: string[];
}

const initialSales: Sale[] = [
  { id: "V-001", date: "2026-04-01 14:30", customer: "João Silva", total: 85.3, payment: "Pix", status: "completed", items: ["2x Burger XL - R$ 77.80", "1x Refrigerante - R$ 7.50"] },
  { id: "V-002", date: "2026-04-01 13:15", customer: "Maria Santos", total: 64, payment: "Cartão Crédito", status: "completed", items: ["1x Pizza Calabresa G - R$ 64.00"] },
  { id: "V-003", date: "2026-04-01 12:00", customer: "Pedro Oliveira", total: 84, payment: "Dinheiro", status: "cancelled", items: ["3x Moscow Mule - R$ 84.00"] },
  { id: "V-004", date: "2026-03-31 20:45", customer: "Ana Costa", total: 67.4, payment: "Pix", status: "completed", items: ["1x Pasta Carbonara - R$ 52.90", "1x Latte - R$ 14.50"] },
];

export default function Historico() {
  const [sales] = useState(initialSales);
  const [viewSale, setViewSale] = useState<Sale | null>(null);
  const [cancelSale, setCancelSale] = useState<Sale | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  const handleCancel = () => {
    if (!cancelReason) { toast.error("❌ Informe o motivo."); return; }
    toast.warning("⚠️ Venda cancelada.");
    setCancelSale(null);
    setCancelReason("");
  };

  return (
    <div>
      <header className="mb-10">
        <h2 className="text-2xl font-semibold text-primary">Histórico de Vendas</h2>
        <p className="text-muted-foreground text-sm mt-1">Todas as vendas realizadas.</p>
      </header>

      {sales.length === 0 ? (
        <div className="text-center py-20">
          <Package className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhum registro encontrado.</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl shadow-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map(s => (
                <TableRow key={s.id}>
                  <TableCell className="font-bold text-primary">{s.id}</TableCell>
                  <TableCell>{s.date}</TableCell>
                  <TableCell>{s.customer}</TableCell>
                  <TableCell className="font-semibold text-secondary">R$ {s.total.toFixed(2)}</TableCell>
                  <TableCell>{s.payment}</TableCell>
                  <TableCell>
                    <Badge className={s.status === "completed" ? "bg-secondary/20 text-secondary border-0" : "bg-error/20 text-error border-0"}>
                      {s.status === "completed" ? "Concluída" : "Cancelada"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setViewSale(s)}>
                          <Eye className="h-4 w-4 mr-2" /> Ver Detalhes
                        </DropdownMenuItem>
                        {s.status === "completed" && (
                          <DropdownMenuItem className="text-error" onClick={() => setCancelSale(s)}>
                            <XCircle className="h-4 w-4 mr-2" /> Cancelar Venda
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* View Details Dialog */}
      <Dialog open={!!viewSale} onOpenChange={() => setViewSale(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Detalhes da Venda {viewSale?.id}</DialogTitle></DialogHeader>
          <div className="mt-4 space-y-3">
            <p className="text-sm"><strong>Cliente:</strong> {viewSale?.customer}</p>
            <p className="text-sm"><strong>Data:</strong> {viewSale?.date}</p>
            <p className="text-sm"><strong>Pagamento:</strong> {viewSale?.payment}</p>
            <div>
              <p className="text-sm font-bold mb-2">Itens:</p>
              {viewSale?.items.map((item, i) => (
                <p key={i} className="text-sm text-muted-foreground">{item}</p>
              ))}
            </div>
            <p className="text-lg font-bold text-secondary">Total: R$ {viewSale?.total.toFixed(2)}</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={!!cancelSale} onOpenChange={() => setCancelSale(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Cancelar Venda {cancelSale?.id}</DialogTitle></DialogHeader>
          <div className="mt-4 space-y-4">
            <Textarea placeholder="Motivo do cancelamento..." value={cancelReason} onChange={e => setCancelReason(e.target.value)} />
            <Button variant="destructive" onClick={handleCancel} className="w-full">Confirmar Cancelamento</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
