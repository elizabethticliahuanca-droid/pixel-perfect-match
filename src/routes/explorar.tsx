import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, MessageCircle, Clock } from "lucide-react";
import { Page, btnWhatsapp } from "@/components/Shell";
import { cocineras, soles, whatsappLink, type Cocinera } from "@/lib/data";
import { cotizar, duraciones, tarifaPorHora, type Duracion, type Personas } from "@/lib/tarifas";

export const Route = createFileRoute("/explorar")({
  head: () => ({
    meta: [
      { title: "Contrata una cocinera en casa — Sabor de Hogar" },
      { name: "description", content: "Cocineras de experiencia cocinan en tu casa por horas, por 2 días o una semana, para 1 a más de 4 personas." },
      { property: "og:title", content: "Cocinera en casa — Sabor de Hogar" },
      { property: "og:description", content: "Elige días y personas, mira la tarifa y coordina por WhatsApp." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Explorar,
});

const chip = (sel: boolean) => `min-h-14 rounded-2xl border-4 px-5 text-xl font-bold ${sel ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`;

function Explorar() {
  const [d, setD] = useState<Duracion>("2dias");
  const [p, setP] = useState<Personas>("1");
  const q = cotizar(d, p);
  return (
    <Page>
      <h1 className="text-4xl font-extrabold md:text-5xl">Una cocinera de confianza en tu casa</h1>
      <p className="mt-3 text-xl text-muted-foreground">Ella va a tu casa y cocina por horas. Tú eliges por cuánto tiempo y para cuántas personas.</p>

      <section className="mt-8 rounded-3xl border-2 border-border bg-card p-6 md:p-8" aria-labelledby="cot">
        <h2 id="cot" className="text-3xl font-bold">Calcula tu tarifa</h2>
        <fieldset className="mt-5"><legend className="mb-2 text-xl font-bold">¿Por cuánto tiempo?</legend>
          <div className="flex flex-wrap gap-3">{(Object.keys(duraciones) as Duracion[]).map((k) => (
            <button key={k} aria-pressed={d === k} onClick={() => setD(k)} className={chip(d === k)}>{duraciones[k].label} <span className="font-normal">({duraciones[k].visitas} visitas de {duraciones[k].horasPorVisita} h)</span></button>
          ))}</div>
        </fieldset>
        <fieldset className="mt-5"><legend className="mb-2 text-xl font-bold">¿Para cuántas personas?</legend>
          <div className="flex flex-wrap gap-3">{(Object.keys(tarifaPorHora) as Personas[]).map((k) => (
            <button key={k} aria-pressed={p === k} onClick={() => setP(k)} className={chip(p === k)}>{tarifaPorHora[k].label}</button>
          ))}</div>
        </fieldset>
        <div className="mt-6 flex flex-wrap items-end justify-between gap-4 rounded-2xl bg-secondary p-6 text-secondary-foreground" aria-live="polite">
          <p className="flex items-center gap-2 text-xl"><Clock className="size-6" /> {q.horas} horas × {soles(q.porHora)} por hora</p>
          <p className="font-display text-5xl font-extrabold">{soles(q.total)}</p>
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

      <h2 className="mt-10 text-3xl font-bold">Cocineras disponibles</h2>
      <div className="mt-5 grid gap-6 md:grid-cols-3">
        {cocineras.map((c) => <Tarjeta key={c.id} c={c} d={d} p={p} total={q.total} />)}
      </div>
    </Page>
  );
}

function Tarjeta({ c, d, p, total }: { c: Cocinera; d: Duracion; p: Personas; total: number }) {
  const msg = `Hola ${c.nombre.split(" ")[0]}, vi su perfil en Sabor de Hogar. Quisiera contratarla para cocinar en mi casa por ${duraciones[d].label} para ${tarifaPorHora[p].label.toLowerCase()} (${soles(total)}). ¿Tiene disponibilidad?`;
  return (
    <article className="flex flex-col rounded-3xl border-2 border-border bg-card p-6 shadow-warm">
      <div className="flex items-center gap-4">
        <div className="flex size-16 items-center justify-center rounded-full bg-primary font-display text-3xl text-primary-foreground" aria-hidden>{c.inicial}</div>
        <div><h3 className="text-2xl font-bold">{c.nombre}</h3><p className="flex items-center gap-1 text-lg text-muted-foreground"><MapPin className="size-4" /> {c.distrito} · {c.edad} años</p></div>
      </div>
      <p className="mt-4 flex-1 text-lg">“{c.descripcion}”</p>
      <div className="mt-3 flex flex-wrap gap-2">{c.badges.map((b) => <span key={b} className="rounded-full bg-accent px-3 py-1 text-base font-bold text-accent-foreground">{b}</span>)}</div>
      <a href={whatsappLink(c.telefono, msg)} target="_blank" rel="noreferrer" className={`${btnWhatsapp} mt-5 w-full`}><MessageCircle className="size-6" /> Contratar · {soles(total)}</a>
    </article>
  );
}
