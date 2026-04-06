import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Building2, Plus, MoreHorizontal, Loader2, UserPlus, KeyRound, Users, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface CompanyRow {
  id: string;
  name: string;
  trade_name: string | null;
  status: string;
}

interface EmployeeRow {
  id: string;
  company_id: string;
  name: string;
  role: string;
  photo_url: string | null;
  status: string;
}

const roleLabels: Record<string, string> = {
  admin: "Admin",
  manager: "Gerente",
  cashier: "Caixa",
  delivery_person: "Entregador",
};

async function invoke(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke("manage-users", { body });
  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.error);
  return data;
}

export default function Empresas() {
  const { isAnupAdmin } = useAuth();
  const [companies, setCompanies] = useState<CompanyRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Create company
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newTrade, setNewTrade] = useState("");
  const [creating, setCreating] = useState(false);

  // Selected company for employee management
  const [selectedCompany, setSelectedCompany] = useState<CompanyRow | null>(null);
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  // Create employee
  const [empCreateOpen, setEmpCreateOpen] = useState(false);
  const [empName, setEmpName] = useState("");
  const [empRole, setEmpRole] = useState("cashier");
  const [empPassword, setEmpPassword] = useState("");
  const [empCreating, setEmpCreating] = useState(false);

  // Edit employee
  const [empEditOpen, setEmpEditOpen] = useState(false);
  const [editEmp, setEditEmp] = useState<EmployeeRow | null>(null);
  const [editEmpName, setEditEmpName] = useState("");
  const [editEmpRole, setEditEmpRole] = useState("");
  const [empSaving, setEmpSaving] = useState(false);

  // Change employee password
  const [empPwOpen, setEmpPwOpen] = useState(false);
  const [empPwId, setEmpPwId] = useState("");
  const [empPwValue, setEmpPwValue] = useState("");
  const [empPwSaving, setEmpPwSaving] = useState(false);

  // Create company login user
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginName, setLoginName] = useState("");
  const [loginCreating, setLoginCreating] = useState(false);

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const data = await invoke({ action: "list_companies" });
      setCompanies(data.companies || []);
    } catch { /* empty */ }
    setLoading(false);
  }, []);

  const fetchEmployees = useCallback(async (companyId: string) => {
    setLoadingEmployees(true);
    try {
      const data = await invoke({ action: "list_employees", company_id: companyId });
      setEmployees(data.employees || []);
    } catch { /* empty */ }
    setLoadingEmployees(false);
  }, []);

  useEffect(() => { fetchCompanies(); }, [fetchCompanies]);

  useEffect(() => {
    if (selectedCompany) fetchEmployees(selectedCompany.id);
  }, [selectedCompany, fetchEmployees]);

  const handleCreateCompany = async () => {
    if (!newName.trim()) { toast.error("❌ Nome da empresa é obrigatório."); return; }
    setCreating(true);
    try {
      await invoke({ action: "create_company", name: newName.trim(), trade_name: newTrade.trim() || null });
      toast.success("✅ Empresa criada!");
      setCreateOpen(false);
      setNewName(""); setNewTrade("");
      fetchCompanies();
    } catch (err: any) { toast.error(`❌ ${err.message}`); }
    setCreating(false);
  };

  const handleCreateEmployee = async () => {
    if (!empName.trim() || !empPassword) { toast.error("❌ Preencha nome e senha."); return; }
    if (empPassword.length < 4) { toast.error("❌ Senha deve ter pelo menos 4 caracteres."); return; }
    if (!selectedCompany) return;
    setEmpCreating(true);
    try {
      await invoke({
        action: "create_employee",
        company_id: selectedCompany.id,
        name: empName.trim(),
        role: empRole,
        password: empPassword,
      });
      toast.success("✅ Funcionário criado!");
      setEmpCreateOpen(false);
      setEmpName(""); setEmpRole("cashier"); setEmpPassword("");
      fetchEmployees(selectedCompany.id);
    } catch (err: any) { toast.error(`❌ ${err.message}`); }
    setEmpCreating(false);
  };

  const handleEditEmployee = async () => {
    if (!editEmp || !editEmpName.trim()) return;
    setEmpSaving(true);
    try {
      await invoke({ action: "update_employee", employee_id: editEmp.id, name: editEmpName.trim(), role: editEmpRole });
      toast.success("✅ Funcionário atualizado!");
      setEmpEditOpen(false);
      if (selectedCompany) fetchEmployees(selectedCompany.id);
    } catch (err: any) { toast.error(`❌ ${err.message}`); }
    setEmpSaving(false);
  };

  const handleToggleEmployee = async (emp: EmployeeRow) => {
    const newStatus = emp.status === "active" ? "inactive" : "active";
    try {
      await invoke({ action: "update_employee", employee_id: emp.id, status: newStatus });
      toast.success("✅ Status atualizado!");
      if (selectedCompany) fetchEmployees(selectedCompany.id);
    } catch (err: any) { toast.error(`❌ ${err.message}`); }
  };

  const handleDeleteEmployee = async (emp: EmployeeRow) => {
    if (!confirm(`Tem certeza que deseja deletar ${emp.name}?`)) return;
    try {
      await invoke({ action: "delete_employee", employee_id: emp.id });
      toast.warning("⚠️ Funcionário removido.");
      if (selectedCompany) fetchEmployees(selectedCompany.id);
    } catch (err: any) { toast.error(`❌ ${err.message}`); }
  };

  const handleEmpPasswordChange = async () => {
    if (!empPwValue || empPwValue.length < 4) { toast.error("❌ Senha deve ter pelo menos 4 caracteres."); return; }
    setEmpPwSaving(true);
    try {
      await invoke({ action: "update_employee_password", employee_id: empPwId, password: empPwValue });
      toast.success("✅ Senha atualizada!");
      setEmpPwOpen(false); setEmpPwValue("");
    } catch (err: any) { toast.error(`❌ ${err.message}`); }
    setEmpPwSaving(false);
  };

  const handleCreateLogin = async () => {
    if (!loginEmail || !loginPassword || !loginName.trim()) { toast.error("❌ Preencha todos os campos."); return; }
    if (loginPassword.length < 6) { toast.error("❌ Senha deve ter pelo menos 6 caracteres."); return; }
    if (!selectedCompany) return;
    setLoginCreating(true);
    try {
      await invoke({
        action: "create_company_user",
        email: loginEmail.trim(),
        password: loginPassword,
        name: loginName.trim(),
        company_id: selectedCompany.id,
      });
      toast.success("✅ Login da empresa criado!");
      setLoginOpen(false);
      setLoginEmail(""); setLoginPassword(""); setLoginName("");
    } catch (err: any) { toast.error(`❌ ${err.message}`); }
    setLoginCreating(false);
  };

  if (!isAnupAdmin) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Acesso restrito ao administrador ANUP.</p>
      </div>
    );
  }

  return (
    <div>
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-primary">Gestão de Empresas</h2>
          <p className="text-muted-foreground text-sm mt-1">Cadastre empresas, logins e funcionários.</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground">
              <Plus className="h-4 w-4 mr-2" /> Nova Empresa
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nova Empresa</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <Input placeholder="Razão Social" value={newName} onChange={(e) => setNewName(e.target.value)} />
              <Input placeholder="Nome Fantasia (opcional)" value={newTrade} onChange={(e) => setNewTrade(e.target.value)} />
              <Button onClick={handleCreateCompany} disabled={creating} className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Criar Empresa
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Companies list */}
        <div className="lg:col-span-1">
          <Card className="shadow-md border-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-4 w-4" /> Empresas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
              ) : companies.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">Nenhuma empresa cadastrada.</p>
              ) : (
                <div className="space-y-2">
                  {companies.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCompany(c)}
                      className={`w-full text-left p-4 rounded-xl transition-all ${
                        selectedCompany?.id === c.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted/50 hover:bg-muted"
                      }`}
                    >
                      <p className="font-bold text-sm">{c.trade_name || c.name}</p>
                      <p className={`text-xs mt-0.5 ${selectedCompany?.id === c.id ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                        {c.name}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Company detail */}
        <div className="lg:col-span-2">
          {!selectedCompany ? (
            <Card className="shadow-md border-none">
              <CardContent className="py-20 text-center">
                <Building2 className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
                <p className="text-muted-foreground">Selecione uma empresa para gerenciar.</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-md border-none">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">{selectedCompany.trade_name || selectedCompany.name}</CardTitle>
                  <Badge variant={selectedCompany.status === "active" ? "default" : "outline"} className={selectedCompany.status === "active" ? "bg-secondary/20 text-secondary border-0" : ""}>
                    {selectedCompany.status === "active" ? "Ativa" : "Inativa"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="employees">
                  <TabsList className="mb-4">
                    <TabsTrigger value="employees" className="flex items-center gap-1"><Users className="h-3 w-3" /> Funcionários</TabsTrigger>
                    <TabsTrigger value="login" className="flex items-center gap-1"><KeyRound className="h-3 w-3" /> Login</TabsTrigger>
                  </TabsList>

                  <TabsContent value="employees">
                    <div className="flex justify-between items-center mb-4">
                      <p className="text-sm text-muted-foreground">Operadores do PDV desta empresa</p>
                      <Dialog open={empCreateOpen} onOpenChange={setEmpCreateOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm" className="bg-primary text-primary-foreground">
                            <UserPlus className="h-3 w-3 mr-1" /> Novo
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle>Novo Funcionário</DialogTitle></DialogHeader>
                          <div className="space-y-4 mt-4">
                            <Input placeholder="Nome completo" value={empName} onChange={(e) => setEmpName(e.target.value)} />
                            <Select value={empRole} onValueChange={setEmpRole}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="manager">Gerente</SelectItem>
                                <SelectItem value="cashier">Caixa</SelectItem>
                                <SelectItem value="delivery_person">Entregador</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input placeholder="Senha do funcionário (mín. 4)" type="password" value={empPassword} onChange={(e) => setEmpPassword(e.target.value)} />
                            <Button onClick={handleCreateEmployee} disabled={empCreating} className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                              {empCreating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                              Adicionar
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>

                    {loadingEmployees ? (
                      <div className="space-y-2">{[1, 2].map(i => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
                    ) : employees.length === 0 ? (
                      <div className="text-center py-12">
                        <Package className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
                        <p className="text-muted-foreground text-sm">Nenhum funcionário cadastrado.</p>
                      </div>
                    ) : (
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
                          {employees.map((emp) => (
                            <TableRow key={emp.id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-xs font-bold text-secondary">
                                    {emp.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                                  </div>
                                  <span className="font-medium">{emp.name}</span>
                                </div>
                              </TableCell>
                              <TableCell><Badge variant="secondary">{roleLabels[emp.role] || emp.role}</Badge></TableCell>
                              <TableCell>
                                <Badge variant={emp.status === "active" ? "default" : "outline"} className={emp.status === "active" ? "bg-secondary/20 text-secondary border-0" : ""}>
                                  {emp.status === "active" ? "Ativo" : "Inativo"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => { setEditEmp(emp); setEditEmpName(emp.name); setEditEmpRole(emp.role); setEmpEditOpen(true); }}>Editar</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => { setEmpPwId(emp.id); setEmpPwValue(""); setEmpPwOpen(true); }}>
                                      <KeyRound className="h-4 w-4 mr-2" /> Alterar Senha
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleToggleEmployee(emp)}>
                                      {emp.status === "active" ? "Desativar" : "Ativar"}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteEmployee(emp)}>Deletar</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </TabsContent>

                  <TabsContent value="login">
                    <div className="flex justify-between items-center mb-4">
                      <p className="text-sm text-muted-foreground">Conta de login para esta empresa acessar o sistema</p>
                      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm" className="bg-primary text-primary-foreground">
                            <Plus className="h-3 w-3 mr-1" /> Criar Login
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle>Login da Empresa</DialogTitle></DialogHeader>
                          <div className="space-y-4 mt-4">
                            <Input placeholder="Nome do responsável" value={loginName} onChange={(e) => setLoginName(e.target.value)} />
                            <Input placeholder="Email de acesso" type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
                            <Input placeholder="Senha (mín. 6 caracteres)" type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
                            <Button onClick={handleCreateLogin} disabled={loginCreating} className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                              {loginCreating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                              Criar Login
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      O login da empresa é uma conta de email/senha que dá acesso ao sistema PDV. Após o login, o operador seleciona o funcionário e digita a senha individual.
                    </p>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Employee Dialog */}
      <Dialog open={empEditOpen} onOpenChange={setEmpEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Funcionário</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <Input placeholder="Nome" value={editEmpName} onChange={(e) => setEditEmpName(e.target.value)} />
            <Select value={editEmpRole} onValueChange={setEditEmpRole}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="manager">Gerente</SelectItem>
                <SelectItem value="cashier">Caixa</SelectItem>
                <SelectItem value="delivery_person">Entregador</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleEditEmployee} disabled={empSaving} className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground">
              {empSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Employee Password Dialog */}
      <Dialog open={empPwOpen} onOpenChange={setEmpPwOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Alterar Senha do Funcionário</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <Input placeholder="Nova senha (mín. 4 caracteres)" type="password" value={empPwValue} onChange={(e) => setEmpPwValue(e.target.value)} />
            <Button onClick={handleEmpPasswordChange} disabled={empPwSaving} className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground">
              {empPwSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Atualizar Senha
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}