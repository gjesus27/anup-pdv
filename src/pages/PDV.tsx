import { useMemo, useState } from "react";
import { Barcode, Maximize2, Minus, Percent, Plus, Search, Ticket, WalletCards } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/product/ProductPrimitives";
import { cartSeed, money, products } from "@/data/saas";

const paymentMethods = ["Dinheiro", "PIX", "Crédito", "Débito", "Vale", "Dividir"];

export default function PDV() {
  const [cart, setCart] = useState(cartSeed);
  const [discount, setDiscount] = useState(5);
  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  const total = subtotal - discount;

  const addProduct = (name: string, price: number) => {
    setCart((current) => {
      const existing = current.find((item) => item.name === name);
      if (existing) {
        return current.map((item) => (item.name === name ? { ...item, quantity: item.quantity + 1 } : item));
      }
      return [...current, { name, price, quantity: 1 }];
    });
  };

  return (
    <div>
      <PageHeader
        eyebrow="Operação"
        title="PDV principal"
        description="Tela touchscreen para venda rápida com produtos clicáveis, busca, carrinho lateral, descontos, cashback, fidelidade e pagamentos múltiplos."
        action={
          <>
            <Button variant="outline">
              <Barcode className="mr-2 h-4 w-4" />
              Código de barras
            </Button>
            <Button variant="outline">
              <Maximize2 className="mr-2 h-4 w-4" />
              Fullscreen
            </Button>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
        <section className="space-y-4">
          <div className="flex flex-col gap-3 rounded-lg bg-card p-4 shadow-sm sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" placeholder="Buscar produto, categoria, cupom ou SKU" />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {["Todos", "Açaí", "Promoções", "Lanches", "Bebidas"].map((category, index) => (
                <Button key={category} variant={index === 0 ? "default" : "outline"} className="shrink-0">
                  {category}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <button
                key={product.id}
                onClick={() => addProduct(product.name, product.price)}
                className="group rounded-lg border bg-card p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="mb-5 flex items-center justify-between gap-2">
                  <Badge className={`${product.color} border-0 hover:${product.color}`}>{product.category}</Badge>
                  <span className="text-xs text-muted-foreground">{product.stock} un.</span>
                </div>
                <h3 className="min-h-10 font-bold leading-5">{product.name}</h3>
                <p className="mt-4 text-xl font-black tracking-tight text-primary">{money(product.price)}</p>
                <div className="mt-4 flex items-center justify-between text-xs font-semibold text-secondary">
                  Toque para adicionar
                  <Plus className="h-4 w-4 transition group-hover:scale-110" />
                </div>
              </button>
            ))}
          </div>
        </section>

        <aside className="rounded-lg bg-card shadow-sm">
          <div className="border-b p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-primary">Carrinho</h2>
                <p className="text-sm text-muted-foreground">Pedido #8513 • Balcão</p>
              </div>
              <Badge className="bg-secondary/15 text-secondary hover:bg-secondary/15">Aberto</Badge>
            </div>
          </div>

          <div className="space-y-3 p-5">
            {cart.map((item) => (
              <div key={item.name} className="flex items-center gap-3 rounded-lg bg-surface-container-low p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 font-bold text-primary">{item.quantity}</div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{money(item.price)} cada</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCart((items) => items.filter((cartItem) => cartItem.name !== item.name))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <Textarea placeholder="Observações do pedido, ponto da carne, retirada, talheres..." />

            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" onClick={() => setDiscount((value) => value + 1)}>
                <Percent className="mr-2 h-4 w-4" />
                Desconto
              </Button>
              <Button variant="outline">
                <Ticket className="mr-2 h-4 w-4" />
                Cupom
              </Button>
              <Button variant="outline">
                <WalletCards className="mr-2 h-4 w-4" />
                Fidelidade
              </Button>
            </div>

            <div className="space-y-2 rounded-lg border p-4 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{money(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Desconto</span>
                <span>- {money(discount)}</span>
              </div>
              <div className="flex justify-between border-t pt-3 text-xl font-black text-primary">
                <span>Total</span>
                <span>{money(total)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {paymentMethods.map((method) => (
                <Button key={method} variant={method === "PIX" ? "default" : "outline"} className="h-11">
                  {method}
                </Button>
              ))}
            </div>
            <Button className="h-12 w-full bg-secondary text-base font-bold text-secondary-foreground hover:bg-secondary/90">
              Finalizar venda
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
