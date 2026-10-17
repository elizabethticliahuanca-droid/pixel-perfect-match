import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MessageCircle, Send } from "lucide-react";
import { Page, Stars } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { SignIn, useAppAuth } from "@/components/AppAuth";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { puedeValorar } from "@/lib/service-rules";
import { soles } from "@/lib/data";

export const Route = createFileRoute("/servicios")({
  head: () => ({ meta: [
    { title: "Mis servicios y mensajes — Sabor de Hogar" },
    { name: "description", content: "Solicitudes de cocina en casa, conversaciones privadas y valoraciones de servicios finalizados." },
    { property: "og:title", content: "Mis servicios — Sabor de Hogar" },
    { property: "og:description", content: "Coordina tu servicio dentro de Sabor de Hogar." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }), component: Servicios,
});
const labels: Record<string, string> = { pending: "Pendiente de aceptación", accepted: "Aceptado", declined: "No aceptado", awaiting_confirmation: "Pendiente de confirmar finalización", completed: "Finalizado", cancelled: "Cancelado" };
type Service = Database['public']['Tables']['service_requests']['Row'];
const actionClass = "h-auto min-h-14 whitespace-normal px-5 text-xl";

function Servicios() {
  const { user, ready } = useAppAuth();
  const cache = useQueryClient();
  const [selected, setSelected] = useState<string | null>(null);
  const services = useQuery({ queryKey: ["services", user?.id], enabled: Boolean(user), queryFn: async () => {
    const { data, error } = await supabase.from("service_requests").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  } });
  const cooks = useQuery({ queryKey: ["service-cooks", user?.id], enabled: Boolean(user), queryFn: async () => {
    const { data, error } = await supabase.from("cook_profiles").select("id,nombre,user_id");
    if (error) throw error;
    return data;
  } });
  const reviews = useQuery({ queryKey: ["my-reviews", user?.id], enabled: Boolean(user), queryFn: async () => {
    if (!user) return [];
    const { data, error } = await supabase.from("cook_reviews").select("request_id,estrellas").eq("client_id", user.id);
    if (error) throw error;
    return data;
  } });
  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel(`services-${user.id}`).on("postgres_changes", { event: "*", schema: "public", table: "service_requests" }, () => { void cache.invalidateQueries({ queryKey: ["services"] }); }).subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [user?.id, cache]);
  const current = services.data?.find((r) => r.id === selected);
  return <Page><h1 className="text-4xl font-bold">Mis servicios</h1>
    {!ready ? <p className="mt-6 text-xl">Cargando…</p> : !user ? <SignIn /> : <>
      {(services.isPending || cooks.isPending || reviews.isPending) && <p className="mt-6 text-xl">Cargando servicios…</p>}
      {(services.isError || cooks.isError || reviews.isError) && <div role="alert" className="mt-6"><p className="text-xl">No se pudieron cargar sus servicios.</p><Button className={actionClass} onClick={() => void cache.invalidateQueries()}>Reintentar</Button></div>}
      {services.data?.length === 0 && <p className="mt-6 text-xl text-muted-foreground">Aún no tiene solicitudes.</p>}
      <div className="mt-6 grid items-start gap-8 lg:grid-cols-2">
        <ul className="space-y-4">{services.data?.map((r) => {
          const cook = cooks.data?.find((c) => c.id === r.cook_id);
          return <li key={r.id} className="space-y-3 rounded-2xl border-2 bg-card p-5">
            <h2 className="text-2xl font-bold">{cook?.nombre ?? "Cocinera"}{r.client_id !== user.id && " · Solicitud recibida"}</h2>
            <p className="text-lg">{r.duracion === "2dias" ? "2 días" : "1 semana"} · {r.personas === "5+" ? "Más de 4" : r.personas} personas · {soles(Number(r.total))}</p>
            <p className="text-lg">{r.fecha.split("-").reverse().join("/")} · {r.distrito}</p>
            <p className="font-bold text-secondary">{labels[r.status]}</p>
            <Button variant="outline" className={actionClass} onClick={() => setSelected(r.id)}><MessageCircle /> Abrir servicio</Button>
          </li>;
        })}</ul>
        {current && <ServiceDetail key={current.id} r={current} userId={user.id} isCook={cooks.data?.some((c) => c.id === current.cook_id && c.user_id === user.id) ?? false} reviewed={reviews.data?.find((v) => v.request_id === current.id)?.estrellas} />}
      </div>
    </>}
  </Page>;
}

function ServiceDetail({ r, userId, isCook, reviewed }: { r: Service; userId: string; isCook: boolean; reviewed: number | undefined }) {
  const cache = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [body, setBody] = useState("");
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState("");
  const isClient = r.client_id === userId;
  const messages = useQuery({ queryKey: ["messages", r.id, userId], queryFn: async () => {
    const { data, error } = await supabase.from("service_messages").select("*").eq("request_id", r.id).order("created_at");
    if (error) throw error;
    return data;
  } });
  useEffect(() => {
    const channel = supabase.channel(`messages-${r.id}`).on("postgres_changes", { event: "INSERT", schema: "public", table: "service_messages", filter: `request_id=eq.${r.id}` }, () => { void cache.invalidateQueries({ queryKey: ["messages", r.id] }); }).subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [r.id, cache]);
  async function change(status: string) {
    setBusy(true);
    try {
      const { error } = await supabase.rpc("change_service", { p_id: r.id, p_status: status });
      if (error) throw error;
      await cache.invalidateQueries({ queryKey: ["services"] });
    } catch { toast.error("No se pudo actualizar el servicio."); }
    finally { setBusy(false); }
  }
  const open = ["pending", "accepted", "awaiting_confirmation"].includes(r.status);
  return <section aria-label="Detalle del servicio" className="min-w-0 space-y-5 border-t-2 py-5 lg:border-t-0">
    <h2 className="text-3xl font-bold">Servicio y conversación</h2>
    <p className="text-xl font-bold">{labels[r.status]}</p>
    {r.detalles && <p className="break-words text-xl">{r.detalles}</p>}
    <div className="flex flex-wrap gap-3">
      {isCook && r.status === "pending" && <><Button disabled={busy} className={actionClass} onClick={() => void change("accepted")}>Aceptar servicio</Button><Button disabled={busy} variant="outline" className={actionClass} onClick={() => void change("declined")}>No aceptar</Button></>}
      {isCook && r.status === "accepted" && <Button disabled={busy} className={actionClass} onClick={() => void change("awaiting_confirmation")}>Marcar trabajo terminado</Button>}
      {isClient && r.status === "awaiting_confirmation" && <Button disabled={busy} className={actionClass} onClick={() => void change("completed")}>Confirmar servicio finalizado</Button>}
      {isClient && ["pending", "accepted"].includes(r.status) && <Button variant="outline" disabled={busy} className={actionClass} onClick={() => { if (window.confirm("¿Desea cancelar esta solicitud?")) void change("cancelled"); }}>Cancelar solicitud</Button>}
    </div>
    <h3 className="text-2xl font-bold">Mensajes privados</h3>
    {messages.isPending && <p>Cargando mensajes…</p>}
    {messages.isError && <p role="alert">No se pudieron cargar los mensajes.</p>}
    <ul aria-live="polite" className="max-h-96 space-y-3 overflow-y-auto">{messages.data?.map((m) => <li key={m.id} className={`break-words rounded-xl p-4 ${m.sender_id === userId ? "bg-accent" : "bg-muted"}`}><p className="text-sm font-bold">{m.sender_id === userId ? "Tú" : isClient ? "Cocinera" : "Cliente"}</p><p className="whitespace-pre-wrap text-xl">{m.body}</p><time className="text-sm text-muted-foreground">{new Date(m.created_at).toLocaleString("es-PE", { timeZone: "America/Lima" })}</time></li>)}</ul>
    {messages.data?.length === 0 && <p className="text-lg text-muted-foreground">Todavía no hay mensajes.</p>}
    {open && <form className="space-y-3" onSubmit={async (e) => {
      e.preventDefault(); if (!body.trim()) return; setBusy(true);
      try {
        const { error } = await supabase.from("service_messages").insert({ request_id: r.id, sender_id: userId, body: body.trim() });
        if (error) throw error;
        setBody(""); await cache.invalidateQueries({ queryKey: ["messages", r.id] });
      } catch { toast.error("No se pudo enviar el mensaje."); } finally { setBusy(false); }
    }}><label className="block text-xl font-bold">Su mensaje<textarea required maxLength={2000} value={body} onChange={(e) => setBody(e.target.value)} rows={3} className="mt-2 w-full rounded-xl border-2 bg-card p-3 font-normal" /></label><Button disabled={busy || !body.trim()} className={actionClass}><Send /> Enviar mensaje</Button></form>}
    {reviewed !== undefined && <p className="text-xl">Su valoración: <Stars n={reviewed} /></p>}
    {puedeValorar(r.status, isClient, reviewed !== undefined) && <form className="space-y-4 border-t-2 pt-6" onSubmit={async (e) => {
      e.preventDefault(); if (!stars) return; setBusy(true);
      try {
        const { error } = await supabase.from("cook_reviews").insert({ request_id: r.id, cook_id: r.cook_id, client_id: userId, estrellas: stars, mensaje: comment });
        if (error) throw error;
        await cache.invalidateQueries({ queryKey: ["my-reviews"] }); await cache.invalidateQueries({ queryKey: ["public-cooks"] });
        toast.success("Gracias por valorar su servicio.");
      } catch { toast.error("No se pudo guardar la valoración."); } finally { setBusy(false); }
    }}><h3 className="text-2xl font-bold">Calificar a la cocinera</h3><div className="flex gap-1" role="group" aria-label="Calificación en estrellas">{[1,2,3,4,5].map((n) => <Button type="button" variant="ghost" key={n} aria-pressed={stars === n} aria-label={`${n} estrellas`} onClick={() => setStars(n)} className={`size-14 shrink-0 px-0 text-4xl ${n <= stars ? "text-gold" : "text-muted-foreground"}`}>★</Button>)}</div><label className="block text-xl">Su experiencia<textarea value={comment} maxLength={1000} onChange={(e) => setComment(e.target.value)} className="mt-2 w-full rounded-xl border-2 bg-card p-3" /></label><Button disabled={!stars || busy} className={actionClass}>Enviar valoración</Button></form>}
  </section>;
}