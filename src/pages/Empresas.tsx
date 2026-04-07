import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Building2, Plus, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface CompanyRow {
  id: string;
  nome: string;
  created_at: string;
}

export default function Empresas() {
  const { isAnupAdmin } = useAuth();
  const [companies, setCompanies] = useState<CompanyRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchCompanies = useCallback(async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("empresas")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      toast.error("Erro ao buscar empresas");
    } else {
      setCompanies(data || []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleCreateCompany = async () => {
    if (!newName.trim()) {
      toast.error("Nome obrigatório");
      return;
    }

    setCreating(true);

    const { error } = await supabase
      .from("empresas")
      .insert([{ nome: newName.trim() }]);

    if (error) {
      console.error(error);
      toast.error("Erro ao criar empresa");
    } else {
      toast.success("Empresa criada!");
      setNewName("");
      setCreateOpen(false);
      fetchCompanies();
    }

    setCreating(false);
  };

  if (!isAnupAdmin) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">
          Acesso restrito ao administrador ANUP.
        </p>
      </div>
    );
  }

  return (
    <div>
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-primary">
            Gestão de Empresas
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Cadastre empresas
          </p>
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Empresa
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Empresa</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <Input
                placeholder="Nome da empresa"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />

              <Button
                onClick={handleCreateCompany}
                disabled={creating}
                className="w-full"
              >
                {creating && (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                )}
                Criar Empresa
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Empresas</CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : companies.length === 0 ? (
            <p className="text-center text-muted-foreground">
              Nenhuma empresa cadastrada.
            </p>
          ) : (
            <div className="space-y-2">
              {companies.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-lg bg-muted/50"
                >
                  <p className="font-semibold">{c.nome}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}