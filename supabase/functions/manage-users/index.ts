import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { encode as hexEncode } from "https://deno.land/std@0.208.0/encoding/hex.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Simple password hashing using SHA-256 with salt (no pgcrypto needed)
async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const saltHex = new TextDecoder().decode(hexEncode(salt));
  const data = new TextEncoder().encode(saltHex + password);
  const hashBuf = await crypto.subtle.digest("SHA-256", data);
  const hashHex = new TextDecoder().decode(hexEncode(new Uint8Array(hashBuf)));
  return `${saltHex}:${hashHex}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex, storedHash] = stored.split(":");
  if (!saltHex || !storedHash) return false;
  const data = new TextEncoder().encode(saltHex + password);
  const hashBuf = await crypto.subtle.digest("SHA-256", data);
  const hashHex = new TextDecoder().decode(hexEncode(new Uint8Array(hashBuf)));
  return hashHex === storedHash;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceRoleKey);

    const body = await req.json();
    const { action } = body;

    // ── Public actions (no auth required) ──────────────────────────

    // Setup first admin – only works when zero admins exist
    if (action === "setup_first_admin") {
      const { email, password, name } = body;
      if (!email || !password || !name) return json({ error: "Missing fields" }, 400);

      const { count } = await admin.from("user_roles").select("*", { count: "exact", head: true }).eq("role", "admin");
      if ((count ?? 0) > 0) return json({ error: "Admin already exists" }, 403);

      const { data: newUser, error: createErr } = await admin.auth.admin.createUser({
        email, password, email_confirm: true, user_metadata: { name },
      });
      if (createErr) return json({ error: createErr.message }, 400);

      await admin.from("user_roles").insert({ user_id: newUser.user.id, role: "admin" });
      return json({ success: true, user_id: newUser.user.id });
    }

    // Check if any admins exist (for setup page visibility)
    if (action === "check_has_admin") {
      const { count } = await admin.from("user_roles").select("*", { count: "exact", head: true }).eq("role", "admin");
      return json({ has_admin: (count ?? 0) > 0 });
    }

    // List employees for a company (public, needed before employee selection)
    // Returns employees WITHOUT password_hash
    if (action === "list_employees") {
      const { company_id } = body;
      if (!company_id) return json({ error: "company_id required" }, 400);
      const { data } = await admin.from("employees")
        .select("id, company_id, name, role, photo_url, status")
        .eq("company_id", company_id)
        .eq("status", "active")
        .order("name");
      return json({ employees: data || [] });
    }

    // Verify employee password
    if (action === "verify_employee_password") {
      const { employee_id, password: empPassword } = body;
      if (!employee_id || !empPassword) return json({ error: "Missing fields" }, 400);

      const { data: emp } = await admin.from("employees")
        .select("id, company_id, name, role, photo_url, status, password_hash")
        .eq("id", employee_id)
        .eq("status", "active")
        .single();

      if (!emp) return json({ error: "Employee not found" }, 404);

      const valid = await verifyPassword(empPassword, emp.password_hash);
      if (!valid) return json({ error: "Invalid password" }, 401);

      // Return employee without password_hash
      const { password_hash: _, ...safeEmp } = emp;
      return json({ employee: safeEmp });
    }

    // ── Authenticated actions ──────────────────────────────────────

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Not authenticated" }, 401);

    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? serviceRoleKey;
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller } } = await userClient.auth.getUser();
    if (!caller) return json({ error: "Invalid token" }, 401);

    // Check caller is ANUP admin
    const { data: roleData } = await admin.from("user_roles").select("role").eq("user_id", caller.id).single();
    const isAnupAdmin = roleData?.role === "admin";

    // Get auth context (works for any authenticated user)
    if (action === "get_context") {
      const { data: profile } = await admin.from("profiles").select("*").eq("user_id", caller.id).single();
      const { data: companyUser } = await admin.from("company_users")
        .select("company_id, status, companies(id, name, trade_name, status)")
        .eq("user_id", caller.id)
        .eq("status", "active")
        .single();

      return json({
        user_id: caller.id,
        email: caller.email,
        profile: profile || null,
        role: roleData?.role || null,
        is_anup_admin: isAnupAdmin,
        company: companyUser ? (companyUser as any).companies : null,
        company_user_status: companyUser?.status || null,
      });
    }

    // List accessible companies
    if (action === "list_companies") {
      if (isAnupAdmin) {
        const { data } = await admin.from("companies").select("id, name, trade_name, status").eq("status", "active").order("name");
        return json({ companies: data || [] });
      } else {
        const { data } = await admin.from("company_users")
          .select("companies(id, name, trade_name, status)")
          .eq("user_id", caller.id)
          .eq("status", "active");
        const companies = (data || []).map((d: any) => d.companies).filter(Boolean);
        return json({ companies });
      }
    }

    // ── Admin-only actions ─────────────────────────────────────────
    if (!isAnupAdmin) return json({ error: "Forbidden: admin only" }, 403);

    // Create company
    if (action === "create_company") {
      const { name, trade_name } = body;
      if (!name) return json({ error: "name required" }, 400);
      const { data, error } = await admin.from("companies").insert({ name, trade_name }).select().single();
      if (error) return json({ error: error.message }, 400);
      return json({ company: data });
    }

    // Create company login user (auth user + profile + company_users link)
    if (action === "create_company_user") {
      const { email, password, name, company_id } = body;
      if (!email || !password || !name || !company_id) return json({ error: "Missing fields" }, 400);

      const { data: newUser, error: createErr } = await admin.auth.admin.createUser({
        email, password, email_confirm: true, user_metadata: { name },
      });
      if (createErr) return json({ error: createErr.message }, 400);

      // Assign 'manager' role (company-level login)
      await admin.from("user_roles").insert({ user_id: newUser.user.id, role: "manager" });
      // Link to company
      await admin.from("company_users").insert({ user_id: newUser.user.id, company_id });

      return json({ user: { id: newUser.user.id, email } });
    }

    // Create employee (operator within a company)
    if (action === "create_employee") {
      const { company_id, name, role, password: empPassword } = body;
      if (!company_id || !name || !empPassword) return json({ error: "Missing fields" }, 400);

      const password_hash = await hashPassword(empPassword);
      const { data, error } = await admin.from("employees")
        .insert({ company_id, name, role: role || "cashier", password_hash })
        .select("id, company_id, name, role, photo_url, status")
        .single();
      if (error) return json({ error: error.message }, 400);
      return json({ employee: data });
    }

    // Update employee
    if (action === "update_employee") {
      const { employee_id, name, role, status } = body;
      if (!employee_id) return json({ error: "employee_id required" }, 400);

      const updates: Record<string, unknown> = {};
      if (name !== undefined) updates.name = name;
      if (role !== undefined) updates.role = role;
      if (status !== undefined) updates.status = status;

      const { error } = await admin.from("employees").update(updates).eq("id", employee_id);
      if (error) return json({ error: error.message }, 400);
      return json({ success: true });
    }

    // Update employee password
    if (action === "update_employee_password") {
      const { employee_id, password: newPw } = body;
      if (!employee_id || !newPw) return json({ error: "Missing fields" }, 400);

      const password_hash = await hashPassword(newPw);
      const { error } = await admin.from("employees").update({ password_hash }).eq("id", employee_id);
      if (error) return json({ error: error.message }, 400);
      return json({ success: true });
    }

    // Delete employee
    if (action === "delete_employee") {
      const { employee_id } = body;
      if (!employee_id) return json({ error: "employee_id required" }, 400);
      const { error } = await admin.from("employees").delete().eq("id", employee_id);
      if (error) return json({ error: error.message }, 400);
      return json({ success: true });
    }

    // Legacy: create auth user (for backward compat)
    if (action === "create") {
      const { email, password, name, role } = body;
      const { data: newUser, error: createErr } = await admin.auth.admin.createUser({
        email, password, email_confirm: true, user_metadata: { name },
      });
      if (createErr) return json({ error: createErr.message }, 400);
      await admin.from("user_roles").insert({ user_id: newUser.user.id, role });
      return json({ user: newUser.user });
    }

    // Legacy: update auth user profile
    if (action === "update") {
      const { user_id, name, role, status } = body;
      await admin.from("profiles").update({ name, status }).eq("user_id", user_id);
      await admin.from("user_roles").upsert({ user_id, role }, { onConflict: "user_id,role" });
      await admin.from("user_roles").delete().eq("user_id", user_id).neq("role", role);
      return json({ success: true });
    }

    if (action === "update_password") {
      const { user_id, password } = body;
      const { error } = await admin.auth.admin.updateUserById(user_id, { password });
      if (error) return json({ error: error.message }, 400);
      return json({ success: true });
    }

    if (action === "delete") {
      const { user_id } = body;
      const { error } = await admin.auth.admin.deleteUser(user_id);
      if (error) return json({ error: error.message }, 400);
      return json({ success: true });
    }

    if (action === "toggle_status") {
      const { user_id, status } = body;
      await admin.from("profiles").update({ status }).eq("user_id", user_id);
      return json({ success: true });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (err) {
    return json({ error: err.message }, 500);
  }
});
