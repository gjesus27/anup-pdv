import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function Setup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [creating, setCreating] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.functions.invoke("manage-users", {
      body: { action: "check_has_admin" },
    }).then(({ data }) => {
      if (data?.has_admin) {
        navigate("/login", { replace: true });
      }
      setChecking(false);
    });
  }, [navigate]);

  const handleCreate = async () => {
    if (!name || !email || !password) {
      toast.error("❌ Preencha todos os campos.");
      return;
    }
    if (password.length < 6) {
      toast.error("❌ A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke("manage-users", {
        body: { action: "setup_first_admin", email, password, name },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      toast.success("✅ Admin criado! Faça login agora.");
      navigate("/login");
    } catch (err: any) {
      toast.error(`❌ ${err.message}`);
    }
    setCreating(false);
  };

  if (checking) return null;

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center">
            <ShieldCheck className="h-8 w-8 text-secondary" />
          </div>
          <CardTitle className="text-2xl">Configuração Inicial</CardTitle>
          <p className="text-muted-foreground text-sm mt-2">Crie o primeiro administrador ANUP</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Nome completo" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input placeholder="Senha (mín. 6 caracteres)" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button onClick={handleCreate} disabled={creating} className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground">
            {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Criar Admin
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
