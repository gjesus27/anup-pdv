import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

export type AppRole = "admin" | "manager" | "cashier" | "delivery_person";

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  photo_url: string | null;
  status: string;
}

export interface Company {
  id: string;
  name: string;
  trade_name: string | null;
  status: string;
}

export interface Employee {
  id: string;
  company_id: string;
  name: string;
  role: AppRole;
  photo_url: string | null;
  status: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  role: AppRole | null;
  isAnupAdmin: boolean;
  loading: boolean;
  // Company & employee selection
  selectedCompany: Company | null;
  selectedEmployee: Employee | null;
  selectCompany: (company: Company) => void;
  selectEmployee: (employee: Employee) => void;
  clearCompanySelection: () => void;
  // Auth actions
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [isAnupAdmin, setIsAnupAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Selection state (persisted in sessionStorage)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(() => {
    try {
      const s = sessionStorage.getItem("anup_company");
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  });
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(() => {
    try {
      const s = sessionStorage.getItem("anup_employee");
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  });

  const fetchContext = useCallback(async () => {
    const { data, error } = await supabase.functions.invoke("manage-users", {
      body: { action: "get_context" },
    });
    if (error || !data) return;

    if (data.profile) setProfile(data.profile);
    if (data.role) setRole(data.role as AppRole);
    setIsAnupAdmin(data.is_anup_admin === true);

    // If not admin and has a company, auto-select it
    if (!data.is_anup_admin && data.company) {
      setSelectedCompany(data.company);
      sessionStorage.setItem("anup_company", JSON.stringify(data.company));
    }
  }, []);

  useEffect(() => {
    // Set up listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (!session?.user) {
          setProfile(null);
          setRole(null);
          setIsAnupAdmin(false);
          setSelectedCompany(null);
          setSelectedEmployee(null);
          sessionStorage.removeItem("anup_company");
          sessionStorage.removeItem("anup_employee");
        }
      }
    );

    // Then restore session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchContext();
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchContext]);

  // Fetch context when session changes (sign in)
  useEffect(() => {
    if (session?.user && !profile) {
      fetchContext();
    }
  }, [session, profile, fetchContext]);

  const selectCompany = (company: Company) => {
    setSelectedCompany(company);
    setSelectedEmployee(null);
    sessionStorage.setItem("anup_company", JSON.stringify(company));
    sessionStorage.removeItem("anup_employee");
  };

  const selectEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    sessionStorage.setItem("anup_employee", JSON.stringify(employee));
  };

  const clearCompanySelection = () => {
    setSelectedCompany(null);
    setSelectedEmployee(null);
    sessionStorage.removeItem("anup_company");
    sessionStorage.removeItem("anup_employee");
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    setRole(null);
    setIsAnupAdmin(false);
    setSelectedCompany(null);
    setSelectedEmployee(null);
    sessionStorage.removeItem("anup_company");
    sessionStorage.removeItem("anup_employee");
  };

  return (
    <AuthContext.Provider value={{
      session, user, profile, role, isAnupAdmin, loading,
      selectedCompany, selectedEmployee,
      selectCompany, selectEmployee, clearCompanySelection,
      signIn, signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
