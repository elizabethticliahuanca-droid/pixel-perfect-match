import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ServiceRequest } from "@/components/ServiceRequest";
import { listCooks, type PublicCook } from "@/lib/services.functions";
import fotoRosa from "@/assets/cocinera-rosa.jpg";
import fotoCarmen from "@/assets/cocinera-carmen.jpg";
import fotoElena from "@/assets/cocinera-elena.jpg";
import { useState } from "react";
import { MapPin, MessageCircle, Clock } from "lucide-react";
import { Page, Stars } from "@/components/Shell";
import { cocineras, soles } from "@/lib/data";
import { cotizar, duraciones, tarifaPorHora, type Duracion, type Personas } from "@/lib/tarifas";

export const cooksQuery = queryOptions({ queryKey: ["public-cooks"], queryFn: () => listCooks() });

export const Route = createFileRoute("/explorar")({
  head: () => ({
    meta: [
      { title: "Contrata una cocinera en casa — Sabor de Hogar" },
      { name: "description", content: "Cocineras de experiencia cocinan en tu casa por horas, por 2 días o una semana, para 1 a más de 4 personas." },
      { property: "og:title", content: "Cocinera en casa — Sabor de Hogar" },
      { property: "og:description", content: "Elige días y personas, mira la tarifa y envía una solicitud dentro de la app y consulta sus valoraciones." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(cooksQuery),
  component: Explorar,
});

const chip = (sel: boolean) => `h-auto min-h-14 max-w-full flex-wrap whitespace-normal rounded-2xl border-4 px-5 py-3 text-xl font-bold ${sel ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-card-foreground"}`;

function Explorar() {
  const [d, setD] = useState<Duracion>("2dias");
  const [p, setP] = useState<Personas>("1");
  const q = cotizar(d, p);
  const { data: reales } = useSuspenseQuery(cooksQuery);
  const [selected, setSelected] = useState<PublicCook | null>(null);
  return (
    <Page>
      <h1 className="text-4xl font-extrabold md:text-5xl">Una cocinera de confianza en tu casa</h1>
      <p className="mt-3 text-xl text-muted-foreground">Ella va a tu casa y cocina por horas. Tú eliges por cuánto tiempo y para cuántas personas.</p>

      <section className="mt-8 rounded-3xl border-2 border-border bg-card p-6 md:p-8" aria-labelledby="cot">
        <h2 id="cot" className="text-3xl font-bold">Calcula tu tarifa</h2>
        <fieldset className="mt-5"><legend className="mb-2 text-xl font-bold">¿Por cuánto tiempo?</legend>
          <div className="flex flex-wrap gap-3">{(Object.keys(duraciones) as Duracion[]).map((k) => (
            <Button key={k} aria-pressed={d === k} onClick={() => setD(k)} className={chip(d === k)}>{duraciones[k].label} <span className="font-normal">({duraciones[k].visitas} visitas de {duraciones[k].horasPorVisita} h)</span></Button>
          ))}</div>
        </fieldset>
        <fieldset className="mt-5"><legend className="mb-2 text-xl font-bold">¿Para cuántas personas?</legend>
          <div className="flex flex-wrap gap-3">{(Object.keys(tarifaPorHora) as Personas[]).map((k) => (
            <Button key={k} aria-pressed={p === k} onClick={() => setP(k)} className={chip(p === k)}>{tarifaPorHora[k].label}</Button>
          ))}</div>
        </fieldset>
        <div className="mt-6 flex flex-wrap items-end justify-between gap-4 rounded-2xl bg-secondary p-6 text-secondary-foreground" aria-live="polite">
          <p className="flex items-center gap-2 text-xl"><Clock className="size-6" /> {q.horas} horas × {soles(q.porHora)} por hora</p>
          <p className="whitespace-nowrap font-display text-4xl font-extrabold sm:text-5xl">{soles(q.total)}</p>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-lg">
            <caption className="sr-only">Tarifas</caption>
            <thead><tr className="border-b-2 border-border"><th className="py-2">Personas</th><th>Por hora</th>{(Object.keys(duraciones) as Duracion[]).map((k) => <th key={k}>{duraciones[k].label}</th>)}</tr></thead>
            <tbody>{(Object.keys(tarifaPorHora) as Personas[]).map((k) => (
              <tr key={k} className="border-b border-border"><td className="py-2 font-bold">{tarifaPorHora[k].label}</td><td>{soles(tarifaPorHora[k].soles)}</td>{(Object.keys(duraciones) as Duracion[]).map((x) => <td key={x}>{soles(cotizar(x, k).total)}</td>)}</tr>
            ))}</tbody>
          </table>
        </div>
      </section>

      <p className="mt-4 text-lg text-muted-foreground">Tarifas referenciales, pendientes de confirmar.</p>
      <h2 className="mt-10 text-3xl font-bold">Cocineras disponibles</h2>
      <div className="mt-5 grid gap-6 md:grid-cols-3">
        {reales.map((c) => <Tarjeta key={c.id} c={c} total={q.total} onSelect={() => setSelected(c)} />)}
      </div>
      {reales.length === 0 && <p className="mt-4 text-xl text-muted-foreground">Todavía no hay cocineras registradas para recibir solicitudes.</p>}
      <h2 className="mt-8 text-2xl font-bold">Perfiles de ejemplo</h2>
      <p className="mt-2 text-lg text-muted-foreground">Fotos simuladas. Estos perfiles no reciben solicitudes ni tienen valoraciones reales.</p>
      <div className="mt-5 grid gap-6 md:grid-cols-3">{cocineras.map((c, i) => <Tarjeta key={c.id} c={{ ...c, foto: [fotoRosa, fotoCarmen, fotoElena][i] ?? null, certificado: false, promedio: null, cantidad: 0, resenas: [] }} total={q.total} />)}</div>
      {selected && <ServiceRequest cook={selected} d={d} p={p} onClose={() => setSelected(null)} />}
    </Page>
  );
}

function Tarjeta({ c, total, onSelect }: { c: PublicCook; total: number; onSelect?: () => void }) {
  return <article className="flex min-w-0 flex-col rounded-3xl border-2 border-border bg-card p-6 shadow-warm">
    <div className="flex items-center gap-4">
      {c.foto ? <img src={c.foto} alt={c.nombre} className="size-16 shrink-0 rounded-full object-cover" /> : <span aria-hidden className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary text-3xl text-primary-foreground">{c.nombre[0]}</span>}
      <div className="min-w-0"><h3 className="break-words text-2xl font-bold">{c.nombre}</h3><p className="text-lg text-muted-foreground">{c.distrito}</p></div>
    </div>
    <p className="mt-4 text-xl"><Stars n={c.promedio ?? 0} /> {c.promedio === null ? <span className="text-lg text-muted-foreground">Sin calificaciones aún</span> : <span>{c.promedio.toFixed(1)} / 5 · {c.cantidad} valoraciones</span>}</p>
    <p className="mt-4 flex-1 break-words text-lg">“{c.descripcion}”</p>
    {c.certificado && <p className="mt-3 text-lg text-secondary">Certificado adjunto · Pendiente de verificación</p>}
    {c.resenas.length > 0 && <details className="mt-4"><summary className="cursor-pointer text-lg font-bold text-primary">Ver valoraciones</summary><ul className="mt-3 space-y-3">{c.resenas.map((r, i) => <li key={i} className="border-t pt-3"><Stars n={r.estrellas} /><p className="break-words text-lg">{r.mensaje}</p></li>)}</ul></details>}
    {onSelect && <Button onClick={onSelect} className="mt-5 h-auto min-h-16 w-full whitespace-normal text-xl"><MessageCircle /> Solicitar · {soles(total)}</Button>}
  </article>;
}
