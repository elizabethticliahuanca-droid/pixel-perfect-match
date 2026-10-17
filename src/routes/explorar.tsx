import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { MapPin, Search, Heart } from "lucide-react";
import { Page, VoiceButton } from "@/components/Shell";
import { cocineras, getCocinera, soles, useStore } from "@/lib/data";

export const Route = createFileRoute("/explorar")({
  head: () => ({
    meta: [
      { title: "Platos caseros cerca de ti — Sabor de Hogar" },
      { name: "description", content: "Encuentra sopas, platos de fondo y postres caseros hechos por abuelas de tu barrio." },
      { property: "og:title", content: "Explora comida casera — Sabor de Hogar" },
      { property: "og:description", content: "Platos caseros disponibles hoy cerca de ti." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Explorar,
});

const filtros = ["Todos", "Sopas", "Platos de Fondo", "Postres caseros", "Opción en mesa"] as const;

function Explorar() {
  const { platos, pedidos } = useStore();
  const [q, setQ] = useState("");
  const [f, setF] = useState<(typeof filtros)[number]>("Todos");
  const [radio, setRadio] = useState(3);
  const lista = useMemo(() => platos
    .filter((p) => p.distanciaKm <= radio)
    .filter((p) => f === "Todos" || (f === "Opción en mesa" ? p.modalidades.includes("mesa") : p.categoria === f))
    .filter((p) => `${p.nombre} ${getCocinera(p.cocineraId).nombre}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => a.distanciaKm - b.distanciaKm), [platos, q, f, radio]);

  const mes = new Date().getMonth();
  const impacto = cocineras.map((c) => ({ c, n: pedidos.filter((x) => x.cocineraId === c.id && new Date(x.fecha).getMonth() === mes).length })).filter((x) => x.n > 0);

  return (
    <Page>
      <h1 className="text-4xl font-extrabold">¿Qué se te antoja hoy?</h1>
      {impacto.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-3" aria-label="Tu impacto social">
          {impacto.map(({ c, n }) => <p key={c.id} className="flex items-center gap-2 rounded-2xl bg-accent px-5 py-3 text-lg font-bold text-accent-foreground"><Heart className="size-5 fill-current" /> Has apoyado a {c.nombre.split(" ")[0]} con {n} {n === 1 ? "pedido" : "pedidos"} este mes</p>)}
        </div>
      )}
      <div className="mt-6 flex gap-2">
        <label className="relative flex-1"><span className="sr-only">Buscar plato o cocinera</span>
          <Search className="absolute left-4 top-1/2 size-6 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar plato o cocinera…" className="min-h-14 w-full rounded-2xl border-2 border-input bg-card pl-12 pr-4 text-xl placeholder:text-muted-foreground" />
        </label>
        <VoiceButton label="buscar" onText={setQ} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filtros">
        {filtros.map((x) => <button key={x} aria-pressed={f === x} onClick={() => setF(x)} className={`min-h-12 rounded-full border-2 px-5 text-lg font-bold ${f === x ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`}>{x}</button>)}
      </div>
      <label className="mt-4 flex flex-wrap items-center gap-3 text-lg"><MapPin className="size-5 text-primary" aria-hidden /> Cerca de mí: hasta <strong>{radio} km</strong>
        <input type="range" min={1} max={5} value={radio} onChange={(e) => setRadio(Number(e.target.value))} className="w-48 accent-primary" />
      </label>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {lista.map((p) => { const c = getCocinera(p.cocineraId); return (
          <Link key={p.id} to="/plato/$id" params={{ id: p.id }} className="overflow-hidden rounded-3xl border-2 border-border bg-card shadow-warm transition hover:-translate-y-1">
            <img src={p.foto} alt={p.nombre} loading="lazy" width={944} height={704} className="aspect-[4/3] w-full object-cover" />
            <div className="p-5">
              <div className="flex items-start justify-between gap-2"><h2 className="text-2xl font-bold">{p.nombre}</h2><span className="font-display text-2xl font-extrabold text-primary">{soles(p.precio)}</span></div>
              <p className="mt-1 text-lg text-muted-foreground">por {c.nombre} · {p.distanciaKm} km</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {c.badges.slice(0, 1).map((b) => <span key={b} className="rounded-full bg-accent px-3 py-1 text-base font-bold text-accent-foreground">{b}</span>)}
                {p.modalidades.includes("mesa") && <span className="rounded-full bg-muted px-3 py-1 text-base font-bold">🍽️ En su mesa</span>}
              </div>
              <p className="mt-3 text-base font-bold">{p.porciones > 0 ? `Quedan ${p.porciones} porciones` : "Agotado por hoy"}</p>
            </div>
          </Link>
        ); })}
      </div>
      {lista.length === 0 && <p className="mt-10 text-center text-xl text-muted-foreground">No hay platos con esos filtros. Prueba ampliar la distancia.</p>}
    </Page>
  );
}
