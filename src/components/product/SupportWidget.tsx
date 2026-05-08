import { useState } from "react";
import { Headphones, MessageCircle, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export function SupportWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open ? (
        <div className="fixed bottom-20 right-4 z-50 w-[calc(100vw-2rem)] max-w-sm rounded-lg border bg-card shadow-2xl md:bottom-6">
          <div className="flex items-center justify-between border-b p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-secondary/15 p-2 text-secondary">
                <Headphones className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold">Suporte Anup</p>
                <p className="text-xs text-muted-foreground">Atendimento interno remoto</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Fechar suporte">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-3 p-4">
            <div className="rounded-lg bg-surface-container-low p-3 text-sm">
              Olá. Descreva o problema e a equipe Anup recebe o chamado com contexto da empresa, usuário e tela.
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Chat</Badge>
              <Badge variant="secondary">Chamado</Badge>
              <Badge variant="secondary">Modo suporte</Badge>
            </div>
            <Textarea placeholder="Ex: impressora da cozinha não recebeu o pedido #8512" />
            <Button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90">
              <Send className="mr-2 h-4 w-4" />
              Abrir chamado
            </Button>
          </div>
        </div>
      ) : null}
      <Button
        className="fixed bottom-20 right-4 z-40 h-12 w-12 rounded-full bg-secondary p-0 text-secondary-foreground shadow-xl hover:bg-secondary/90 md:bottom-6"
        onClick={() => setOpen(true)}
        aria-label="Abrir suporte Anup"
      >
        <MessageCircle className="h-5 w-5" />
      </Button>
    </>
  );
}
