import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Package } from "lucide-react";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  costPrice: number;
  quantity: number;
  minQuantity: number;
  isActive: boolean;
}

const initialProducts: Product[] = [
  { id: 1, name: "Classic Burger XL", description: "Blend 180g, queijo cheddar", price: 38.9, costPrice: 15, quantity: 50, minQuantity: 10, isActive: true },
  { id: 2, name: "Pizza Calabresa G", description: "8 fatias, massa artesanal", price: 64, costPrice: 22, quantity: 3, minQuantity: 5, isActive: true },
  { id: 3, name: "Moscow Mule", description: "Caneca de cobre, espuma", price: 28, costPrice: 8, quantity: 0, minQuantity: 5, isActive: false },
  { id: 4, name: "Latte Macchiato", description: "Grão arábica, leite vapor", price: 14.5, costPrice: 4, quantity: 100, minQuantity: 20, isActive: true },
];

export default function Estoque() {
  const [products, setProducts] = useState(initialProducts);
  const [filter, setFilter] = useState<"all" | "inStock" | "outOfStock">("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", price: "", costPrice: "", quantity: "", minQuantity: "" });

  const filtered = products.filter(p => {
    if (filter === "inStock") return p.quantity > 0;
    if (filter === "outOfStock") return p.quantity === 0;
    return true;
  });

  const handleAdd = () => {
    if (!form.name || !form.price) { toast.error("❌ Preencha nome e preço."); return; }
    setProducts([...products, {
      id: Date.now(),
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      costPrice: parseFloat(form.costPrice) || 0,
      quantity: parseInt(form.quantity) || 0,
      minQuantity: parseInt(form.minQuantity) || 0,
      isActive: true,
    }]);
    setOpen(false);
    setForm({ name: "", description: "", price: "", costPrice: "", quantity: "", minQuantity: "" });
    toast.success("✅ Produto adicionado!");
  };

  return (
    <div>
      <header className="mb-10 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-semibold text-primary">Estoque</h2>
          <p className="text-muted-foreground text-sm mt-1">Gerencie seus produtos e quantidades.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
              <Plus className="h-4 w-4 mr-2" /> Adicionar Produto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Novo Produto</DialogTitle></DialogHeader>
            <div className="space-y-3 mt-4">
              <Input placeholder="Nome" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <Textarea placeholder="Descrição" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Preço (R$)" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                <Input placeholder="Custo (R$)" type="number" value={form.costPrice} onChange={e => setForm({ ...form, costPrice: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Quantidade" type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} />
                <Input placeholder="Qtd Mínima" type="number" value={form.minQuantity} onChange={e => setForm({ ...form, minQuantity: e.target.value })} />
              </div>
              <Button onClick={handleAdd} className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground">Adicionar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </header>

      {/* Filter */}
      <div className="flex gap-2 mb-6">
        {(["all", "inStock", "outOfStock"] as const).map(f => (
          <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)}
            className={filter === f ? "bg-primary text-primary-foreground" : ""}>
            {f === "all" ? "Todos" : f === "inStock" ? "Em Estoque" : "Esgotado"}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <Package className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhum registro encontrado.</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl shadow-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Custo</TableHead>
                <TableHead>Qtd</TableHead>
                <TableHead>Mín</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(p => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.description}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold text-secondary">R$ {p.price.toFixed(2)}</TableCell>
                  <TableCell>R$ {p.costPrice.toFixed(2)}</TableCell>
                  <TableCell className={p.quantity <= p.minQuantity ? "text-error font-bold" : ""}>{p.quantity}</TableCell>
                  <TableCell>{p.minQuantity}</TableCell>
                  <TableCell>
                    <Badge className={p.quantity > 0 ? "bg-secondary/20 text-secondary border-0" : "bg-error/20 text-error border-0"}>
                      {p.quantity > 0 ? "Em Estoque" : "Esgotado"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
