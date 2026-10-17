import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Camera, Plus, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Page, VoiceButton, btnPrimary, btnOutline } from "@/components/Shell";
import { publicarPlato, soles, useStore, type Categoria, type Modalidad } from "@/lib/data";
import sopa from "@/assets/sopa.jpg";

export const Route = createFileRoute("/cocinera")({
  head: () => ({
    meta: [
      { title: "Mi cocina — Sabor de Hogar" },
      { name: "description", content: "Publique su comida de hoy y vea cuánto ha ganado." },
      { property: "og:title", content: "Panel de la Cocinera — Sabor de Hogar" },
      { property: "og:description", content: "Publique su menú en pocos pasos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Cocinera,
});

interface Perfil { nombre: string; distrito: string; telefono: string; descripcion: string; foto?: string }
const PKEY = "sabor-perfil";
const field = "min-h-14 w-full rounded-2xl border-2 border-input bg-card px-4 text-xl";
const label = "mb-2 block text-xl font-bold";

function Campo({ id, l, value, set, type = "text", area }: { id: string; l: string; value: string; set: (v: string) => void; type?: string; area?: boolean }) {
  return (
    <div>
      <label htmlFor={id} className={label}>{l}</label>
      <div className="flex gap-2">
        {area ? <textarea id={id} value={value} onChange={(e) => set(e.target.value)} rows={3} className={`${field} py-3`} />
          : <input id={id} type={type} value={value} onChange={(e) => set(e.target.value)} className={field} />}
        {type === "text" && <VoiceButton label={l} onText={(t) => set(area ? `${value} ${t}`.trim() : t)} />}
      </div>
    </div>
  );
}

function leerFoto(f: File | undefined, cb: (s: string) => void) {
  if (!f) return;
  const r = new FileReader();
  r.onload = () => cb(r.result as string);
  r.readAsDataURL(f);
}

function Cocinera() {
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [cargado, setCargado] = useState(false);
  useEffect(() => { const r = localStorage.getItem(PKEY); if (r) setPerfil(JSON.parse(r)); setCargado(true); }, []);
  if (!cargado) return <Page><p className="text-xl">Cargando…</p></Page>;
  if (!perfil) return <Registro onDone={(p) => { localStorage.setItem(PKEY, JSON.stringify(p)); setPerfil(p); }} />;
  return <Panel perfil={perfil} />;
}

function Registro({ onDone }: { onDone: (p: Perfil) => void }) {
  const [p, setP] = useState<Perfil>({ nombre: "", distrito: "", telefono: "", descripcion: "" });
  const up = (k: keyof Perfil) => (v: string) => setP({ ...p, [k]: v });
  return (
    <Page>
      <div className="mx-auto max-w-2xl rounded-3xl border-2 border-border bg-card p-8">
        <h1 className="text-4xl font-extrabold">Bienvenida a su cocina</h1>
        <p className="mt-2 text-xl text-muted-foreground">Solo necesitamos unos datos. Puede tocar el micrófono 🎤 para hablar en vez de escribir.</p>
        <form className="mt-8 space-y-6" onSubmit={(e) => { e.preventDefault(); if (!p.nombre || !p.telefono) return toast.error("Escriba su nombre y teléfono"); onDone(p); }}>
          <Campo id="n" l="Su nombre" value={p.nombre} set={up("nombre")} />
          <Campo id="d" l="Distrito o barrio" value={p.distrito} set={up("distrito")} />
          <Campo id="t" l="Teléfono (WhatsApp)" type="tel" value={p.telefono} set={up("telefono")} />
          <div>
            <span className={label}>Su foto</span>
            <label className={`${btnOutline} cursor-pointer`}>
              {p.foto ? <img src={p.foto} alt="" className="size-10 rounded-full object-cover" /> : <Camera className="size-7" />} Elegir foto
              <input type="file" accept="image/*" className="sr-only" onChange={(e) => leerFoto(e.target.files?.[0], up("foto"))} />
            </label>
          </div>
          <Campo id="b" l="Cuéntenos de usted" area value={p.descripcion} set={up("descripcion")} />
          <button className={`${btnPrimary} w-full`}>Listo, entrar</button>
        </form>
      </div>
    </Page>
  );
}

function Panel({ perfil }: { perfil: Perfil }) {
  const { platos } = useStore();
  const [abierto, setAbierto] = useState(false);
  const mios = platos.filter((x) => x.cocineraId === "rosa" || x.id.startsWith("p-"));
  const semana = 186, mes = 742; // demostración
  return (
    <Page>
      <div className="flex flex-wrap items-center gap-5">
        {perfil.foto ? <img src={perfil.foto} alt="" className="size-20 rounded-full object-cover" /> : <div className="flex size-20 items-center justify-center rounded-full bg-primary font-display text-4xl text-primary-foreground">{perfil.nombre[0]}</div>}
        <div><h1 className="text-4xl font-extrabold">Hola, {perfil.nombre.split(" ")[0]} 👋</h1><p className="text-xl text-muted-foreground">{perfil.distrito}</p></div>
      </div>

      <button onClick={() => setAbierto(true)} className={`${btnPrimary} mt-8 min-h-24 w-full text-3xl`}><Plus className="size-10" /> Publicar Comida de Hoy</button>

      <section className="mt-8 rounded-3xl bg-secondary p-8 text-secondary-foreground" aria-labelledby="mon">
        <h2 id="mon" className="flex items-center gap-3 text-3xl font-bold"><Wallet className="size-9" /> Mi monedero</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div className="rounded-2xl bg-card p-6 text-card-foreground"><p className="text-xl">Esta semana ganó</p><p className="font-display text-5xl font-extrabold text-secondary">{soles(semana)}</p></div>
          <div className="rounded-2xl bg-card p-6 text-card-foreground"><p className="text-xl">Este mes ganó</p><p className="font-display text-5xl font-extrabold text-secondary">{soles(mes)}</p></div>
        </div>
      </section>

      {abierto && <FormPlato onClose={() => setAbierto(false)} />}

      <h2 className="mt-10 text-3xl font-bold">Mis platos publicados</h2>
      <ul className="mt-4 space-y-4">
        {mios.map((x) => (
          <li key={x.id} className="flex items-center gap-4 rounded-2xl border-2 border-border bg-card p-4">
            <img src={x.foto} alt="" className="size-20 rounded-xl object-cover" loading="lazy" />
            <div className="flex-1"><p className="text-2xl font-bold">{x.nombre}</p><p className="text-lg text-muted-foreground">{soles(x.precio)} · quedan {x.porciones} porciones</p></div>
          </li>
        ))}
      </ul>
    </Page>
  );
}

function FormPlato({ onClose }: { onClose: () => void }) {
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [porciones, setPorciones] = useState("5");
  const [foto, setFoto] = useState<string>("");
  const [categoria, setCategoria] = useState<Categoria>("Platos de Fondo");
  const [mod, setMod] = useState<Modalidad[]>(["llevar"]);
  const toggle = (m: Modalidad) => setMod(mod.includes(m) ? mod.filter((x) => x !== m) : [...mod, m]);
  const opt = (sel: boolean) => `min-h-16 flex-1 rounded-2xl border-4 px-4 text-xl font-bold ${sel ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`;
  return (
    <section className="mt-8 rounded-3xl border-4 border-primary bg-card p-8" aria-labelledby="fp">
      <h2 id="fp" className="text-3xl font-bold">¿Qué cocinó hoy?</h2>
      <form className="mt-6 space-y-6" onSubmit={(e) => {
        e.preventDefault();
        if (!nombre || !precio || mod.length === 0) return toast.error("Complete el nombre, precio y modalidad");
        publicarPlato({ nombre, precio: Number(precio), porciones: Number(porciones), foto: foto || sopa, categoria, modalidades: mod, cocineraId: "rosa", descripcion: "Hecho hoy con mucho cariño." });
        toast.success("¡Su plato ya está publicado!");
        onClose();
      }}>
        <Campo id="pn" l="Nombre del plato" value={nombre} set={setNombre} />
        <div className="grid gap-6 sm:grid-cols-2">
          <Campo id="pp" l="Precio por porción (S/)" type="number" value={precio} set={setPrecio} />
          <Campo id="pc" l="¿Cuántas porciones?" type="number" value={porciones} set={setPorciones} />
        </div>
        <fieldset><legend className={label}>Tipo de plato</legend>
          <div className="flex flex-wrap gap-3">{(["Sopas", "Platos de Fondo", "Postres caseros"] as Categoria[]).map((c) => <button type="button" key={c} aria-pressed={categoria === c} onClick={() => setCategoria(c)} className={opt(categoria === c)}>{c}</button>)}</div>
        </fieldset>
        <fieldset><legend className={label}>¿Cómo lo entrega?</legend>
          <div className="flex flex-wrap gap-3">
            <button type="button" aria-pressed={mod.includes("llevar")} onClick={() => toggle("llevar")} className={opt(mod.includes("llevar"))}>🥡 Para llevar</button>
            <button type="button" aria-pressed={mod.includes("mesa")} onClick={() => toggle("mesa")} className={opt(mod.includes("mesa"))}>🍽️ Para comer en mi mesa</button>
          </div>
        </fieldset>
        <label className={`${btnOutline} w-full cursor-pointer`}>
          {foto ? <img src={foto} alt="" className="size-12 rounded-lg object-cover" /> : <Camera className="size-7" />} {foto ? "Cambiar foto" : "Tomar o elegir foto"}
          <input type="file" accept="image/*" capture="environment" className="sr-only" onChange={(e) => leerFoto(e.target.files?.[0], setFoto)} />
        </label>
        <div className="flex flex-wrap gap-4">
          <button className={`${btnPrimary} flex-1`}>Publicar Menú</button>
          <button type="button" onClick={onClose} className={btnOutline}>Cancelar</button>
        </div>
      </form>
    </section>
  );
}
