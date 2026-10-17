import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { MessageCircle, Phone, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Page, Stars, btnPrimary, btnWhatsapp, btnOutline } from "@/components/Shell";
import { agregarResena, getCocinera, pedirPlato, soles, useStore, whatsappLink } from "@/lib/data";

export const Route = createFileRoute("/plato/$id")({
  head: () => ({
    meta: [
      { title: "Detalle del plato — Sabor de Hogar" },
      { name: "description", content: "Conoce el plato y a la cocinera que lo prepara con cariño." },
      { property: "og:title", content: "Plato casero — Sabor de Hogar" },
      { property: "og:description", content: "Reserva comida casera de una abuela de tu barrio." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Detalle,
  notFoundComponent: () => <Page><p className="text-xl">Este plato ya no está disponible.</p></Page>,
});

const frases = ["Sentí el sabor de mi casa", "Excelente atención", "Porción generosa", "Me hizo sentir en familia"];

function Detalle() {
  const { id } = Route.useParams();
  const { platos } = useStore();
  const p = platos.find((x) => x.id === id);
  const [cant, setCant] = useState(1);
  const [estrellas, setEstrellas] = useState(5);
  const [msg, setMsg] = useState<string>(frases[0]!);
  if (!p) throw notFound();
  const c = getCocinera(p.cocineraId);
  const prom = p.resenas.length ? Math.round(p.resenas.reduce((a, r) => a + r.estrellas, 0) / p.resenas.length) : 5;
  const wa = whatsappLink(c.telefono, `Hola ${c.nombre.split(" ")[0]}, quisiera ${cant} porción(es) de ${p.nombre} de Sabor de Hogar 😊`);

  return (
    <Page>
      <Link to="/explorar" className="mb-6 inline-flex items-center gap-2 text-lg font-bold text-primary"><ArrowLeft className="size-5" /> Volver a los platos</Link>
      <div className="grid gap-10 lg:grid-cols-2">
        <img src={p.foto} alt={p.nombre} width={944} height={704} className="aspect-[4/3] w-full rounded-3xl object-cover shadow-warm" />
        <div>
          <p className="text-lg font-bold text-secondary">{p.categoria} · {p.distanciaKm} km</p>
          <h1 className="mt-1 text-5xl font-extrabold">{p.nombre}</h1>
          <p className="mt-2 text-xl"><Stars n={prom} /> <span className="text-muted-foreground">({p.resenas.length} reseñas)</span></p>
          <p className="mt-4 text-xl text-muted-foreground">{p.descripcion}</p>
          <p className="mt-6 font-display text-5xl font-extrabold text-primary">{soles(p.precio)} <span className="text-xl font-normal text-muted-foreground">por porción</span></p>
          <p className="mt-2 text-lg">{p.modalidades.map((m) => (m === "llevar" ? "🥡 Para llevar" : "🍽️ Comer en su mesa")).join("  ·  ")}</p>

          <div className="mt-6 flex items-center gap-4">
            <span className="text-xl font-bold">Porciones:</span>
            <button onClick={() => setCant(Math.max(1, cant - 1))} className="size-14 rounded-2xl border-2 border-border bg-card text-3xl font-bold" aria-label="Menos">−</button>
            <span className="w-10 text-center text-3xl font-bold" aria-live="polite">{cant}</span>
            <button onClick={() => setCant(Math.min(p.porciones, cant + 1))} className="size-14 rounded-2xl border-2 border-border bg-card text-3xl font-bold" aria-label="Más">+</button>
          </div>
          <div className="mt-6 grid gap-3">
            <button disabled={p.porciones === 0} onClick={() => { if (pedirPlato(p.id, cant)) toast.success(`¡Reservado! Total ${soles(p.precio * cant)}. Coordina la entrega con ${c.nombre.split(" ")[0]}.`); }} className={btnPrimary}>
              {p.porciones === 0 ? "Agotado por hoy" : `Reservar / Comprar · ${soles(p.precio * cant)}`}
            </button>
            <div className="grid gap-3 sm:grid-cols-2">
              <a href={wa} target="_blank" rel="noreferrer" className={btnWhatsapp}><MessageCircle className="size-6" /> WhatsApp</a>
              <a href={`tel:+${c.telefono}`} className={btnOutline}><Phone className="size-6" /> Llamar</a>
            </div>
          </div>
        </div>
      </div>

      <section className="mt-12 rounded-3xl border-2 border-border bg-card p-8" aria-labelledby="coc">
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex size-20 items-center justify-center rounded-full bg-primary font-display text-4xl text-primary-foreground" aria-hidden>{c.inicial}</div>
          <div><h2 id="coc" className="text-3xl font-bold">{c.nombre}, {c.edad} años</h2><p className="text-lg text-muted-foreground">{c.distrito}</p></div>
        </div>
        <p className="mt-4 text-xl">“{c.descripcion}”</p>
        <div className="mt-4 flex flex-wrap gap-2">{c.badges.map((b) => <span key={b} className="rounded-full bg-accent px-4 py-2 text-lg font-bold text-accent-foreground">🏅 {b}</span>)}</div>
      </section>

      <section className="mt-10" aria-labelledby="res">
        <h2 id="res" className="text-3xl font-bold">Mensajes de agradecimiento</h2>
        <form className="mt-4 rounded-3xl bg-muted p-6" onSubmit={(e) => { e.preventDefault(); agregarResena(p.id, { autor: "Tú", estrellas, mensaje: msg }); toast.success("¡Gracias! Tu mensaje alegrará su día."); }}>
          <div className="flex gap-1" role="radiogroup" aria-label="Estrellas">
            {[1, 2, 3, 4, 5].map((n) => <button type="button" key={n} role="radio" aria-checked={estrellas === n} aria-label={`${n} estrellas`} onClick={() => setEstrellas(n)} className={`text-4xl ${n <= estrellas ? "text-gold" : "text-border"}`}>★</button>)}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">{frases.map((f) => <button type="button" key={f} aria-pressed={msg === f} onClick={() => setMsg(f)} className={`rounded-full border-2 px-4 py-2 text-lg ${msg === f ? "border-secondary bg-secondary text-secondary-foreground" : "border-border bg-card"}`}>{f}</button>)}</div>
          <button className={`${btnPrimary} mt-4`}>Enviar reseña</button>
        </form>
        <ul className="mt-6 space-y-3">
          {p.resenas.map((r, i) => <li key={i} className="rounded-2xl border-2 border-border bg-card p-5"><Stars n={r.estrellas} /> <p className="mt-1 text-xl">“{r.mensaje}”</p><p className="text-lg text-muted-foreground">— {r.autor}</p></li>)}
        </ul>
      </section>
    </Page>
  );
}
