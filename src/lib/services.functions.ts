import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type PublicCook = { id: string; nombre: string; distrito: string; descripcion: string; foto: string | null; certificado: boolean; promedio: number | null; cantidad: number; resenas: { estrellas: number; mensaje: string }[] };
export const listCooks = createServerFn({ method: "GET" }).handler(async (): Promise<PublicCook[]> => {
  const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
  const url = process.env['SUPABASE_URL'];
  if (!key || !url) throw new Error("No se pudo cargar las cocineras.");
  const client = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => {
      const headers = new Headers(init?.headers);
      if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
      headers.set("apikey", key);
      return fetch(input, { ...init, headers });
    } },
  });
  const { data, error } = await client.rpc("public_cooks");
  if (error) throw new Error("No se pudo cargar las cocineras. Intente nuevamente.");
  return (data ?? []) as unknown as PublicCook[];
});