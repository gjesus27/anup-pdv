import {
  BadgeDollarSign,
  Banknote,
  Bike,
  Boxes,
  Building2,
  ChefHat,
  CreditCard,
  DollarSign,
  Headphones,
  PackageCheck,
  ReceiptText,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  Users,
  Utensils,
  WalletCards,
} from "lucide-react";

export const money = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const anupKpis = [
  { label: "Empresas cadastradas", value: "128", change: "+18%", icon: Building2 },
  { label: "Empresas ativas", value: "116", change: "90,6%", icon: ShieldCheck },
  { label: "Inadimplentes", value: "12", change: "bloqueio inteligente", icon: BadgeDollarSign },
  { label: "MRR SaaS", value: money(5788.4), change: "R$ 49,90 / empresa", icon: TrendingUp },
  { label: "Mensalidades recebidas", value: money(4989.9), change: "100 cobranças", icon: CreditCard },
  { label: "Chamados abertos", value: "9", change: "3 críticos", icon: Headphones },
];

export const companyKpis = [
  { label: "Vendas hoje", value: money(4250.8), change: "+12,4%", icon: DollarSign },
  { label: "Pedidos em preparo", value: "18", change: "tempo médio 14min", icon: ChefHat },
  { label: "Ticket médio", value: money(48.3), change: "214 vendas", icon: ReceiptText },
  { label: "Estoque crítico", value: "5 itens", change: "2 zerados", icon: Boxes },
];

export const revenueSeries = [
  { day: "Seg", receita: 3200, pedidos: 78 },
  { day: "Ter", receita: 2800, pedidos: 64 },
  { day: "Qua", receita: 4100, pedidos: 92 },
  { day: "Qui", receita: 3500, pedidos: 81 },
  { day: "Sex", receita: 5200, pedidos: 128 },
  { day: "Sáb", receita: 6100, pedidos: 141 },
  { day: "Dom", receita: 4250, pedidos: 96 },
];

export const products = [
  { id: 1, name: "Açaí 500ml", category: "Açaí", price: 22.9, stock: 48, color: "bg-violet-100 text-violet-800" },
  { id: 2, name: "Açaí 700ml", category: "Açaí", price: 29.9, stock: 32, color: "bg-violet-100 text-violet-800" },
  { id: 3, name: "Combo Família", category: "Promoções", price: 89.9, stock: 18, color: "bg-emerald-100 text-emerald-800" },
  { id: 4, name: "Burger Artesanal", category: "Lanches", price: 34.9, stock: 24, color: "bg-amber-100 text-amber-800" },
  { id: 5, name: "Pizza Calabresa", category: "Pizzas", price: 64.0, stock: 8, color: "bg-red-100 text-red-800" },
  { id: 6, name: "Refrigerante 2L", category: "Bebidas", price: 14.0, stock: 52, color: "bg-sky-100 text-sky-800" },
  { id: 7, name: "Taxa Delivery", category: "Delivery", price: 7.0, stock: 999, color: "bg-slate-100 text-slate-800" },
  { id: 8, name: "Adicional Leite Ninho", category: "Adicionais", price: 5.0, stock: 40, color: "bg-orange-100 text-orange-800" },
];

export const cartSeed = [
  { name: "Açaí 700ml", quantity: 2, price: 29.9 },
  { name: "Adicional Leite Ninho", quantity: 2, price: 5 },
  { name: "Taxa Delivery", quantity: 1, price: 7 },
];

export const tables = [
  { id: "Mesa 01", status: "Livre", time: "-", total: 0, guests: 0 },
  { id: "Mesa 02", status: "Ocupada", time: "32 min", total: 142.8, guests: 4 },
  { id: "Mesa 03", status: "Aguardando", time: "18 min", total: 68.4, guests: 2 },
  { id: "Mesa 04", status: "Fechando", time: "54 min", total: 211.9, guests: 6 },
  { id: "Mesa 05", status: "Livre", time: "-", total: 0, guests: 0 },
  { id: "Mesa 06", status: "Ocupada", time: "11 min", total: 39.9, guests: 1 },
];

export const deliveryOrders = [
  { id: "#8512", customer: "João Silva", channel: "WhatsApp", total: 85.3, status: "Novo", eta: "35 min", driver: "Aguardando" },
  { id: "#8511", customer: "Maria Santos", channel: "iFood", total: 64, status: "Preparo", eta: "22 min", driver: "Aguardando" },
  { id: "#8510", customer: "Pedro Oliveira", channel: "Balcão", total: 39.9, status: "Pronto", eta: "Retirada", driver: "Cliente" },
  { id: "#8509", customer: "Ana Costa", channel: "WhatsApp", total: 97.4, status: "Rota", eta: "12 min", driver: "Lucas" },
];

export const customers = [
  { name: "Camila Rocha", phone: "(11) 99921-4400", visits: 18, cashback: 34.5, credit: 120, lastOrder: "Hoje" },
  { name: "Rafael Lima", phone: "(11) 98812-1077", visits: 9, cashback: 12.7, credit: 0, lastOrder: "Ontem" },
  { name: "Bianca Alves", phone: "(11) 97733-5521", visits: 27, cashback: 58.1, credit: 240, lastOrder: "03/05" },
];

export const supportTickets = [
  { id: "SUP-1048", company: "Açaí do Rapha", subject: "Impressora cozinha offline", status: "Urgente", owner: "N2" },
  { id: "SUP-1047", company: "Burger House", subject: "Dúvida Mercado Pago recorrente", status: "Aberto", owner: "Financeiro" },
  { id: "SUP-1046", company: "Padaria Central", subject: "Permissão de gerente", status: "Respondido", owner: "Suporte" },
];

export const settingsGroups = [
  { title: "Empresa", text: "Nome, logo Cloudinary, cores, tema e dados fiscais.", icon: Building2 },
  { title: "PDV", text: "Pagamentos, cashback, fidelidade, descontos e atalhos.", icon: ShoppingCart },
  { title: "Delivery", text: "Taxas, regiões, horários, WhatsApp e entregadores.", icon: Bike },
  { title: "Impressão", text: "Cupom térmico, cozinha, balcão e impressão automática.", icon: ReceiptText },
  { title: "Usuários", text: "Cargos, permissões, telas acessíveis e auditoria.", icon: Users },
  { title: "Assinatura", text: "PIX, cartão, recorrência e histórico Mercado Pago.", icon: WalletCards },
];

export const featureMap = [
  { title: "Multiempresa com RLS", icon: Building2 },
  { title: "PDV touchscreen", icon: Utensils },
  { title: "Pagamentos divididos", icon: CreditCard },
  { title: "Estoque e fornecedores", icon: PackageCheck },
  { title: "Suporte remoto Anup", icon: Headphones },
  { title: "PWA, APK e Tauri", icon: Sparkles },
];
