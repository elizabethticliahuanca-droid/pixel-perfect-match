import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SignIn, useAppAuth } from "@/components/AppAuth";
import { supabase } from "@/integrations/supabase/client";
import type { PublicCook } from "@/lib/services.functions";
import { cotizar, duraciones, tarifaPorHora, type Duracion, type Personas } from "@/lib/tarifas";
import { soles } from "@/lib/data";

export function ServiceRequest({ cook, d, p, onClose }: { cook: PublicCook; d: Duracion; p: Personas; onClose: () => void }) {
  const { user } = useAppAuth();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  return <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}><DialogContent className="max-h-[90dvh] overflow-y-auto">
    <DialogTitle className="text-2xl">Solicitar a {cook.nombre}</DialogTitle>
    <DialogDescription className="text-lg">{duraciones[d].label} · {tarifaPorHora[p].label} · {soles(cotizar(d, p).total)}</DialogDescription>
    {!user ? <SignIn /> : done ? <div className="space-y-4"><p className="text-xl">Solicitud enviada. Pendiente de aceptación.</p><Button asChild className="h-auto min-h-16 text-xl"><Link to="/servicios">Ver mis servicios</Link></Button></div> : <form className="space-y-5" onSubmit={async (e) => {
      e.preventDefault(); setBusy(true);
      const form = new FormData(e.currentTarget);
      try {
        const { error } = await supabase.rpc("create_service", { p_cook: cook.id, p_duracion: d, p_personas: p, p_fecha: String(form.get("fecha")), p_distrito: String(form.get("distrito")), p_detalles: String(form.get("detalles")) });
        if (error) throw error;
        setDone(true);
      } catch { toast.error("No se pudo enviar. Revise la fecha y el distrito e intente nuevamente."); }
      finally { setBusy(false); }
    }}>
      <label className="block text-xl font-bold">Fecha de inicio<input name="fecha" type="date" required className="mt-2 min-h-14 w-full rounded-xl border-2 bg-card px-3 font-normal" /></label>
      <label className="block text-xl font-bold">Distrito<input name="distrito" required minLength={2} maxLength={100} className="mt-2 min-h-14 w-full rounded-xl border-2 bg-card px-3 font-normal" /></label>
      <label className="block text-xl font-bold">Preferencias y detalles<textarea name="detalles" maxLength={2000} rows={3} className="mt-2 w-full rounded-xl border-2 bg-card p-3 font-normal" /></label>
      <p className="text-lg text-muted-foreground">Tarifa referencial, pendiente de confirmar. No se realiza ningún cobro.</p>
      <Button disabled={busy} className="h-auto min-h-16 w-full whitespace-normal text-xl">{busy ? "Enviando…" : "Enviar solicitud"}</Button>
    </form>}
  </DialogContent></Dialog>;
}