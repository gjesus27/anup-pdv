import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { UserPlus, MoreHorizontal, Package, Loader2, KeyRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface UserRow {
  user_id: string;
  name: string;
  photo_url: string | null;
  status: string;
  role: string;
  email?: string;
}

const roleLabels: Record<string, string> = {
  admin: "Admin",
  manager: "Gerente",
  cashier: "Caixa",
  delivery_person: "Entregador",
};

export default function Usuarios() {
  const { role: currentRole } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("cashier");
  const [creating, setCreating] = useState(false);

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserRow | null>(null);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState("");
  const [saving, setSaving] = useState(false);

  // Password dialog
  const [pwOpen, setPwOpen] = useState(false);
  const [pwUserId, setPwUserId] = useState("");
  const [pwValue, setPwValue] = useState("");
  const [pwSaving, setPwSaving] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, name, photo_url, status");
    const { data: roles } = await supabase
      .from("user_roles")
      .select("user_id, role");

    if (profiles && roles) {
      const roleMap = new Map(roles.map((r) => [r.user_id, r.role]));
      setUsers(
        profiles.map((p) => ({
          ...p,
          role: roleMap.get(p.user_id) || "cashier",
        }))
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const invokeManageUsers = async (body: any) => {
    const { data, error } = await supabase.functions.invoke("manage-users", { body });
    if (error) throw new Error(error.message);
    if (data?.error) throw new Error(data.error);
    return data;
  };

  const handleCreate = async () => {
    if (!newName || !newEmail || !newPassword) {
      toast.error("❌ Preencha todos os campos.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("❌ A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    setCreating(true);
    try {
      await invokeManageUsers({
        action: "create",
        email: newEmail,
        password: newPassword,
        name: newName,
        role: newRole,
      });
      toast.success("✅ Usuário criado com sucesso!");
      setCreateOpen(false);
      setNewName(""); setNewEmail(""); setNewPassword(""); setNewRole("cashier");
      fetchUsers();
    } catch (err: any) {
      toast.error(`❌ ${err.message}`);
    }
    setCreating(false);
  };

  const handleEdit = async () => {
    if (!editUser || !editName) return;
    setSaving(true);
    try {
      await invokeManageUsers({
        action: "update",
        user_id: editUser.user_id,
        name: editName,
        role: editRole,
        status: editUser.status,
      });
      toast.success("✅ Usuário atualizado!");
      setEditOpen(false);
      fetchUsers();
    } catch (err: any) {
      toast.error(`❌ ${err.message}`);
    }
    setSaving(false);
  };

  const handleToggleStatus = async (u: UserRow) => {
    const newStatus = u.status === "active" ? "inactive" : "active";
    try {
      await invokeManageUsers({ action: "toggle_status", user_id: u.user_id, status: newStatus });
      toast.success("✅ Status atualizado!");
      fetchUsers();
    } catch (err: any) {
      toast.error(`❌ ${err.message}`);
    }
  };

  const handleDelete = async (u: UserRow) => {
    if (!confirm(`Tem certeza que deseja deletar ${u.name}?`)) return;
    try {
      await invokeManageUsers({ action: "delete", user_id: u.user_id });
      toast.warning("⚠️ Usuário removido.");
      fetchUsers();
    } catch (err: any) {
      toast.error(`❌ ${err.message}`);
    }
  };

  const handlePasswordChange = async () => {
    if (!pwValue || pwValue.length < 6) {
      toast.error("❌ A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    setPwSaving(true);
    try {
      await invokeManageUsers({ action: "update_password", user_id: pwUserId, password: pwValue });
      toast.success("✅ Senha atualizada!");
      setPwOpen(false);
      setPwValue("");
    } catch (err: any) {
      toast.error(`❌ ${err.message}`);
    }
    setPwSaving(false);
  };

  const openEdit = (u: UserRow) => {
    setEditUser(u);
    setEditName(u.name);
    setEditRole(u.role);
    setEditOpen(true);
  };

  const openPassword = (userId: string) => {
    setPwUserId(userId);
    setPwValue("");
    setPwOpen(true);
  };

  const isAdmin = currentRole === "admin";

  return (
    <div>
      <header className="mb-10 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-primary">Gerenciar Usuários</h2>
          <p className="text-muted-foreground text-sm mt-1">Adicione e gerencie operadores do sistema.</p>
        </div>
        {isAdmin && (
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground">
                <UserPlus className="h-4 w-4 mr-2" /> Novo Usuário
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo Usuário</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <Input placeholder="Nome completo" value={newName} onChange={(e) => setNewName(e.target.value)} />
                <Input placeholder="Email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} type="email" />
                <Input placeholder="Senha (mín. 6 caracteres)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type="password" />
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Gerente</SelectItem>
                    <SelectItem value="cashier">Caixa</SelectItem>
                    <SelectItem value="delivery_person">Entregador</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleCreate} disabled={creating} className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                  {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Adicionar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </header>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-20">
          <Package className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhum registro encontrado. Adicione um novo item para começar.</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl shadow-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Nível</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.user_id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {u.photo_url ? (
                        <img src={u.photo_url} alt={u.name} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-xs font-bold text-secondary">
                          {u.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <span className="font-medium">{u.name}</span>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="secondary">{roleLabels[u.role] || u.role}</Badge></TableCell>
                  <TableCell>
                    <Badge variant={u.status === "active" ? "default" : "outline"} className={u.status === "active" ? "bg-secondary/20 text-secondary border-0" : ""}>
                      {u.status === "active" ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {isAdmin && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(u)}>Editar</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openPassword(u.user_id)}>
                            <KeyRound className="h-4 w-4 mr-2" /> Alterar Senha
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(u)}>
                            {u.status === "active" ? "Desativar" : "Ativar"}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(u)}>
                            Deletar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Input placeholder="Nome" value={editName} onChange={(e) => setEditName(e.target.value)} />
            <Select value={editRole} onValueChange={setEditRole}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Gerente</SelectItem>
                <SelectItem value="cashier">Caixa</SelectItem>
                <SelectItem value="delivery_person">Entregador</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleEdit} disabled={saving} className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Password Dialog */}
      <Dialog open={pwOpen} onOpenChange={setPwOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Senha</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Input placeholder="Nova senha (mín. 6 caracteres)" type="password" value={pwValue} onChange={(e) => setPwValue(e.target.value)} />
            <Button onClick={handlePasswordChange} disabled={pwSaving} className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground">
              {pwSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Atualizar Senha
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
