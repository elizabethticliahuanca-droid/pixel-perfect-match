import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Page, VoiceButton } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { SignIn, useAppAuth } from "@/components/AppAuth";
import { CertificadoLaboral } from "@/components/CertificadoLaboral";
import type { Certificado } from "@/lib/certificado";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export const Route = createFileRoute("/cocinera")({
  head: () => ({ meta: [
    { title: "Mi perfil de cocinera — Sabor de Hogar" },
    { name: "description", content: "Registre su perfil de cocinera, adjunte su DNI y certificado laboral y reciba solicitudes de cocina en casa." },
    { property: "og:title", content: "Cocinar y recibir solicitudes — Sabor de Hogar" },
    { property: "og:description", content: "Su perfil, certificado y servicios dentro de Sabor de Hogar." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }), component: Cocinera,
});
type Cook = Database['public']['Tables']['cook_profiles']['Row'];
function Cocinera() {
  const { user, ready } = useAppAuth();
  const cache = useQueryClient();
  const profile = useQuery({ queryKey: ["my-cook", user?.id], enabled: Boolean(user), queryFn: async () => {
    if (!user) return null;
    const { data, error } = await supabase.from("cook_profiles").select("*").eq("user_id", user.id).maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const certificate = await supabase.from("cook_certificates").select("nombre,contenido").eq("cook_id", data.id).maybeSingle();
    if (certificate.error) throw certificate.error;
    const dni = await supabase.from("cook_dni").select("nombre,contenido").eq("cook_id", data.id).maybeSingle();
    if (dni.error) throw dni.error;
    return { cook: data, certificado: certificate.data ?? undefined, dni: dni.data ?? undefined };
  } });
  return <Page><h1 className="text-4xl font-bold">Mi perfil de cocinera</h1>
    {!ready ? <p className="mt-6 text-xl">Cargando…</p> : !user ? <SignIn /> : profile.isPending ? <p className="mt-6 text-xl">Cargando perfil…</p> : profile.isError ? <div role="alert"><p className="mt-6 text-xl">No se pudo cargar su perfil.</p><Button onClick={() => void profile.refetch()}>Reintentar</Button></div> : <>
      <Button asChild variant="secondary" className="mt-6 h-auto min-h-16 whitespace-normal text-xl"><Link to="/servicios">Ver solicitudes y mensajes</Link></Button>
      <ProfileForm key={profile.data?.cook.id ?? "new"} userId={user.id} cook={profile.data?.cook} initialCert={profile.data?.certificado} initialDni={profile.data?.dni} onSaved={() => { void cache.invalidateQueries({ queryKey: ["my-cook"] }); void cache.invalidateQueries({ queryKey: ["public-cooks"] }); }} />
    </>}
  </Page>;
}
function ProfileForm({ userId, cook, initialCert, initialDni, onSaved }: { userId: string; cook: Cook | undefined; initialCert: Certificado | undefined; initialDni: Certificado | undefined; onSaved: () => void }) {
  const [nombre, setNombre] = useState(cook?.nombre ?? "");
  const [distrito, setDistrito] = useState(cook?.distrito ?? "");
  const [descripcion, setDescripcion] = useState(cook?.descripcion ?? "");
  const [foto, setFoto] = useState(cook?.foto ?? "");
  const [certificado, setCertificado] = useState<Certificado | undefined>(initialCert);
  const [dni, setDni] = useState<Certificado | undefined>(initialDni);
  const [busy, setBusy] = useState(false);
  const field = "mt-2 min-h-14 w-full rounded-xl border-2 bg-card p-3 text-xl font-normal";
  return <form className="mt-8 max-w-2xl space-y-6" onSubmit={async (e) => {
    e.preventDefault();
    if (!dni) { toast.error("Adjunte una foto o PDF de su DNI para registrarse."); return; }
    setBusy(true);
    try {
      const { data, error } = await supabase.from("cook_profiles").upsert({ user_id: userId, nombre: nombre.trim(), distrito: distrito.trim(), descripcion, foto: foto || null }, { onConflict: "user_id" }).select("id").single();
      if (error) throw error;
      const result = certificado ? await supabase.from("cook_certificates").upsert({ cook_id: data.id, user_id: userId, ...certificado }) : await supabase.from("cook_certificates").delete().eq("cook_id", data.id);
      if (result.error) throw result.error;
      const dniResult = await supabase.from("cook_dni").upsert({ cook_id: data.id, user_id: userId, ...dni });
      if (dniResult.error) throw dniResult.error;
      onSaved(); toast.success("Su perfil está guardado. Ya puede recibir solicitudes.");
    } catch { toast.error("No se pudo guardar todo el perfil. Revise los datos e intente nuevamente."); }
    finally { setBusy(false); }
  }}>
    <label className="block text-xl font-bold">Su nombre<div className="flex items-center gap-2"><input required minLength={2} maxLength={100} value={nombre} onChange={(e) => setNombre(e.target.value)} className={field} /><VoiceButton label="Su nombre" onText={setNombre} /></div></label>
    <label className="block text-xl font-bold">Distrito o barrio<div className="flex items-center gap-2"><input required minLength={2} maxLength={100} value={distrito} onChange={(e) => setDistrito(e.target.value)} className={field} /><VoiceButton label="Distrito" onText={setDistrito} /></div></label>
    <label className="block text-xl font-bold">Su motivación por cocinar<div className="flex items-center gap-2"><textarea maxLength={1000} rows={3} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} className={field} /><VoiceButton label="Motivación" onText={setDescripcion} /></div></label>
    {foto && <img src={foto} alt="Su foto de perfil" className="size-28 rounded-full object-cover" />}
    <label className="block text-xl font-bold">Su foto<input type="file" accept="image/jpeg,image/png" className="mt-2 block w-full text-lg" onChange={(e) => {
      const file = e.target.files?.[0]; if (!file) return;
      if (!["image/jpeg", "image/png"].includes(file.type) || file.size > 2 * 1024 * 1024) { toast.error("Elija una foto JPG o PNG de hasta 2 MB."); return; }
      const reader = new FileReader(); reader.onload = () => { if (typeof reader.result === "string") setFoto(reader.result); }; reader.readAsDataURL(file);
    }} /></label>
    <CertificadoLaboral titulo="DNI (Documento de identidad)" etiqueta="DNI" opcional={false} value={dni} onChange={setDni} />
    <CertificadoLaboral value={certificado} onChange={setCertificado} />
    <Button disabled={busy} className="h-auto min-h-16 w-full whitespace-normal text-xl">{busy ? "Guardando…" : cook ? "Guardar cambios" : "Registrar mi perfil"}</Button>
  </form>;
}
