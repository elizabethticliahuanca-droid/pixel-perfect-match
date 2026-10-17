import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, HandCoins, Users } from "lucide-react";
import hero from "@/assets/hero.jpg";
import { Page, btnPrimary, btnOutline } from "@/components/Shell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sabor de Hogar — Comida casera de abuelas de tu barrio" },
      { name: "description", content: "Conectamos a cocineras de 60 a 70 años con jóvenes que buscan comida casera. Ingreso digno, compañía y sabor de casa." },
      { property: "og:title", content: "Sabor de Hogar" },
      { property: "og:description", content: "Comida casera hecha con cariño por abuelas de tu barrio." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const puntos = [
    { icon: HandCoins, t: "Ingreso digno", d: "Las cocineras ganan cocinando lo que mejor saben hacer." },
    { icon: Heart, t: "Sabor de casa", d: "Los jóvenes comen rico, sano y hecho a mano." },
    { icon: Users, t: "Compañía", d: "Comparte la mesa y una buena conversación." },
  ];
  return (
    <Page>
      <section className="grid items-center gap-10 md:grid-cols-2">
        <div>
          <p className="mb-3 text-lg font-bold uppercase tracking-wide text-secondary">Cocina con propósito</p>
          <h1 className="text-5xl font-extrabold leading-tight text-foreground md:text-6xl">La comida de la abuela, a la vuelta de tu casa.</h1>
          <p className="mt-5 text-xl text-muted-foreground">Sabor de Hogar une a mujeres de 60 a 70 años que aman cocinar con jóvenes ocupados que extrañan la comida casera.</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/rol" className={btnPrimary}>Empezar ahora</Link>
            <Link to="/explorar" className={btnOutline}>Ver platos de hoy</Link>
          </div>
        </div>
        <img src={hero} alt="Una señora sirve guiso casero a un joven en su cocina" width={1600} height={1008} className="aspect-[4/3] w-full rounded-3xl object-cover shadow-warm" />
      </section>
      <section className="mt-16 grid gap-6 md:grid-cols-3">
        {puntos.map(({ icon: Icon, t, d }) => (
          <div key={t} className="rounded-3xl border-2 border-border bg-card p-7">
            <Icon className="size-10 text-primary" aria-hidden />
            <h2 className="mt-4 text-2xl font-bold">{t}</h2>
            <p className="mt-2 text-lg text-muted-foreground">{d}</p>
          </div>
        ))}
      </section>
    </Page>
  );
}
