import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Lock, ArrowRight, Loader2, Building2, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, type Company, type Employee } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

type Step = "credentials" | "select_company" | "select_employee";

export default function Login() {
  const navigate = useNavigate();
  const { session, isAnupAdmin, selectedCompany, selectedEmployee, selectCompany, selectEmployee } = useAuth();

  const [step, setStep] = useState<Step>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signingIn, setSigningIn] = useState(false);
  const [hasAdmin, setHasAdmin] = useState<boolean | null>(null);

  // Company selection
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  // Employee selection
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState<string | null>(null);
  const [empPassword, setEmpPassword] = useState("");
  const [verifying, setVerifying] = useState(false);

  // Check if admin exists
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("manage-users", {
          body: { action: "check_has_admin" },
        });

        if (error) throw error;

        if (data && !data.has_admin) {
          navigate("/setup", { replace: true });
        }

        setHasAdmin(data?.has_admin ?? false);
      } catch (err) {
        console.error("Erro ao verificar admin:", err);

        // fallback pra não quebrar tela
        setHasAdmin(true);
      }
    };

    checkAdmin();
  }, [navigate]);

  // If already fully set up, go to dashboard
  useEffect(() => {
    if (session && selectedCompany && selectedEmployee) {
      navigate("/dashboard", { replace: true });
    }
  }, [session, selectedCompany, selectedEmployee, navigate]);

  // After login, advance to company selection
  useEffect(() => {
    if (session && step === "credentials") {
      loadCompanies();
    }
  }, [session]);

  // 🔹 Função loadCompanies corrigida
  const loadCompanies = async () => {
    setLoadingCompanies(true);

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    // 👑 Corrigido: pegar role do app_metadata
    const role = user?.app_metadata?.role;
    const companyId = user?.user_metadata?.company_id;

    const { data } = await supabase.functions.invoke("manage-users", {
      body: { action: "list_companies" },
    });

    const list: Company[] = data?.companies || [];
    setCompanies(list);
    setLoadingCompanies(false);

    // 👑 ADMIN ANUP
    if (role === "anup_admin") {
      setStep("select_company");
      return;
    }

    // 🏢 EMPRESA
    if (companyId) {
      const company = list.find((c) => c.id === companyId);
      if (company) {
        handleSelectCompany(company);
        return;
      }
    }

    // fallback
    setStep("select_company");
  };

  const handleSelectCompany = async (company: Company) => {
    selectCompany(company);
    setLoadingEmployees(true);
    setStep("select_employee");

    const { data } = await supabase.functions.invoke("manage-users", {
      body: { action: "list_employees", company_id: company.id },
    });
    setEmployees(data?.employees || []);
    setLoadingEmployees(false);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("❌ Preencha email e senha.");
      return;
    }
    setSigningIn(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error("❌ Email ou senha incorretos.");
    } else {
      toast.success("✅ Login realizado!");
      // useEffect will advance to company selection
    }
    setSigningIn(false);
  };

  const handleVerifyEmployee = async () => {
    if (!selectedEmpId || !empPassword) {
      toast.error("❌ Selecione um funcionário e digite a senha.");
      return;
    }
    setVerifying(true);
    const { data, error } = await supabase.functions.invoke("manage-users", {
      body: { action: "verify_employee_password", employee_id: selectedEmpId, password: empPassword },
    });
    if (error || !data?.employee) {
      toast.error("❌ Senha do funcionário incorreta.");
    } else {
      selectEmployee(data.employee);
      toast.success(`✅ Bem-vindo, ${data.employee.name}!`);
      navigate("/dashboard");
    }
    setVerifying(false);
  };

  const getInitials = (name: string) =>
    name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  if (hasAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary">
        <Loader2 className="h-6 w-6 animate-spin text-primary-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary flex flex-col overflow-hidden relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />

      <header className="flex justify-between items-center w-full px-8 py-3 h-16 bg-primary-foreground/5 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="text-lg font-black tracking-tighter text-primary-foreground">Anup</span>
          <span className="text-xs font-medium px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full">PDV</span>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center px-4 relative z-10">
        {/* Step 1: Email/Password Login */}
        {step === "credentials" && !session && (
          <>
            <div className="text-center mb-10">
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-primary-foreground">
                Acesse o sistema
              </h1>
              <p className="text-primary-foreground/50 text-lg">Entre com seu email e senha</p>
            </div>
            <div className="w-full max-w-sm space-y-4">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/30 rounded-xl h-12"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
              <Input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/30 rounded-xl h-12"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
              <Button
                onClick={handleLogin}
                disabled={signingIn}
                className="w-full rounded-xl h-12 bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground font-bold tracking-widest uppercase"
              >
                {signingIn ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Entrar <ArrowRight className="h-4 w-4 ml-2" /></>}
              </Button>
            </div>
          </>
        )}

        {/* Step 2: Select Company */}
        {step === "select_company" && session && (
          <>
            <div className="text-center mb-10">
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-primary-foreground">
                {isAnupAdmin ? "Selecione a empresa" : "Sua empresa"}
              </h1>
              <p className="text-primary-foreground/50 text-lg">
                {isAnupAdmin ? "Escolha qual empresa deseja acessar" : "Selecione sua empresa para continuar"}
              </p>
            </div>

            {loadingCompanies ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl w-full">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 rounded-2xl bg-primary-foreground/10" />)}
              </div>
            ) : companies.length === 0 ? (
              <div className="text-center text-primary-foreground/50">
                <Building2 className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg">Nenhuma empresa cadastrada.</p>
                {isAnupAdmin && <p className="text-sm mt-2">Acesse o painel para cadastrar empresas.</p>}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl w-full">
                {companies.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleSelectCompany(c)}
                    className="bg-primary-foreground/10 hover:bg-primary-foreground/20 border border-primary-foreground/10 rounded-2xl p-6 text-left transition-all hover:scale-105"
                  >
                    <Building2 className="h-8 w-8 text-secondary mb-3" />
                    <p className="text-primary-foreground font-bold text-lg">{c.trade_name || c.name}</p>
                    <p className="text-primary-foreground/50 text-xs mt-1">{c.name}</p>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* Step 3: Select Employee */}
        {step === "select_employee" && session && (
          <>
            <div className="text-center mb-10">
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-primary-foreground">
                Quem está operando?
              </h1>
              <p className="text-primary-foreground/50 text-lg">Selecione o funcionário para acessar o sistema</p>
            </div>

            {isAnupAdmin && (
              <button
                onClick={() => { setStep("select_company"); setSelectedEmpId(null); setEmpPassword(""); }}
                className="mb-6 flex items-center gap-2 text-primary-foreground/50 hover:text-primary-foreground text-sm transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> Trocar empresa
              </button>
            )}

            {loadingEmployees ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex flex-col items-center gap-4">
                    <Skeleton className="w-28 h-28 rounded-full bg-primary-foreground/10" />
                    <Skeleton className="w-20 h-4 bg-primary-foreground/10" />
                  </div>
                ))}
              </div>
            ) : employees.length === 0 ? (
              <div className="text-center text-primary-foreground/50">
                <p className="text-lg">Nenhum funcionário cadastrado nesta empresa.</p>
                <p className="text-sm mt-2">Cadastre funcionários no painel de gestão.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 max-w-4xl">
                {employees.map((emp) => {
                  const isActive = selectedEmpId === emp.id;
                  return (
                    <div key={emp.id} className="flex flex-col items-center gap-6">
                      <button
                        onClick={() => { setSelectedEmpId(emp.id); setEmpPassword(""); }}
                        className={`group flex flex-col items-center gap-4 transition-all duration-300 ${
                          selectedEmpId !== null && !isActive ? "opacity-50 grayscale hover:grayscale-0 hover:opacity-100" : ""
                        } ${isActive ? "scale-110" : ""}`}
                      >
                        <div className="relative">
                          {emp.photo_url ? (
                            <img
                              src={emp.photo_url}
                              alt={emp.name}
                              className={`w-28 h-28 md:w-36 md:h-36 rounded-full object-cover transition-all duration-300 ${
                                isActive
                                  ? "ring-8 ring-secondary/20 border-4 border-secondary"
                                  : "border-4 border-transparent group-hover:border-secondary/50"
                              }`}
                            />
                          ) : (
                            <div
                              className={`w-28 h-28 md:w-36 md:h-36 rounded-full flex items-center justify-center text-3xl font-bold transition-all duration-300 ${
                                isActive
                                  ? "bg-secondary text-secondary-foreground ring-8 ring-secondary/20 border-4 border-secondary"
                                  : "bg-primary-foreground/10 text-primary-foreground/70 border-4 border-transparent group-hover:border-secondary/50"
                              }`}
                            >
                              {getInitials(emp.name)}
                            </div>
                          )}
                          {isActive && (
                            <div className="absolute -bottom-2 -right-2 bg-secondary text-secondary-foreground rounded-full p-1 border-4 border-primary">
                              <Lock className="h-3 w-3" />
                            </div>
                          )}
                        </div>
                        <span className={`text-lg font-medium transition-colors ${isActive ? "text-primary-foreground font-bold" : "text-primary-foreground/60"}`}>
                          {emp.name}
                        </span>
                      </button>

                      {isActive && (
                        <div className="flex flex-col items-center gap-4 w-full max-w-[200px] animate-in fade-in slide-in-from-bottom-2 duration-300">
                          <Input
                            type="password"
                            placeholder="••••••••"
                            value={empPassword}
                            onChange={(e) => setEmpPassword(e.target.value)}
                            className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/30 text-center rounded-full"
                            onKeyDown={(e) => e.key === "Enter" && handleVerifyEmployee()}
                            disabled={verifying}
                          />
                          <Button
                            onClick={handleVerifyEmployee}
                            disabled={verifying}
                            className="w-full rounded-full bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground font-bold tracking-widest uppercase flex items-center gap-2 hover:shadow-lg transition-all active:scale-95"
                          >
                            {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Entrar <ArrowRight className="h-4 w-4" /></>}
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>

      <footer className="w-full py-4 px-8 flex justify-between items-center bg-primary-foreground/5 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-secondary" />
            <span className="text-[10px] text-primary-foreground/40 font-bold tracking-widest uppercase">Sistema Online</span>
          </div>
        </div>
        <div className="text-[10px] text-primary-foreground/40 font-bold tracking-widest uppercase">
          © 2026 Anup
        </div>
      </footer>
    </div>
  );
}