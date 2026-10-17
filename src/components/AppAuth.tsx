import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const AuthContext = createContext<{ user: User | null; ready: boolean }>({ user: null, ready: false });
export const useAppAuth = () => useContext(AuthContext);
export function AppAuth({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ user: User | null; ready: boolean }>({ user: null, ready: false });
  const queryClient = useQueryClient();
  const router = useRouter();
  useEffect(() => {
    let active = true;
    void supabase.auth.getUser().then(({ data }) => { if (active) setState({ user: data.user, ready: true }); });
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (!["SIGNED_IN", "SIGNED_OUT", "USER_UPDATED"].includes(event)) return;
      setState({ user: session?.user ?? null, ready: true });
      if (event === "SIGNED_OUT") queryClient.clear();
      else void queryClient.invalidateQueries();
      void router.invalidate();
    });
    return () => { active = false; data.subscription.unsubscribe(); };
  }, [queryClient, router]);
  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}
export function SignIn() {
  const [busy, setBusy] = useState(false);
  async function login(provider: "google" | "lovable") {
    setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin });
      if (result.error) toast.error("No se pudo iniciar sesión. Intente nuevamente.");
    } catch { toast.error("No se pudo iniciar sesión. Intente nuevamente."); }
    finally { setBusy(false); }
  }
  return <div className="my-6 space-y-4">
    <p className="text-xl font-bold">Inicia sesión para solicitar un servicio o recibir solicitudes.</p>
    <div className="flex flex-wrap gap-3">
      <Button className="h-auto min-h-16 whitespace-normal px-6 text-xl" disabled={busy} onClick={() => void login("google")}>Continuar con Google</Button>
      <Button variant="outline" className="h-auto min-h-16 whitespace-normal px-6 text-xl" disabled={busy} onClick={() => void login("lovable")}>Continuar con Lovable</Button>
    </div>
  </div>;
}