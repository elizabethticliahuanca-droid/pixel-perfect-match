import { createFileRoute, Link } from "@tanstack/react-router";
import { ChefHat, Utensils } from "lucide-react";
import { Page } from "@/components/Shell";

export const Route = createFileRoute("/rol")({
  head: () => ({
    meta: [
      { title: "¿Cómo quieres participar? — Sabor de Hogar" },
      { name: "description", content: "Elige si quieres cocinar y ganar un ingreso, o pedir comida casera." },
      { property: "og:title", content: "Elige tu rol — Sabor de Hogar" },
      { property: "og:description", content: "Cocinar y ganar, o comer como en casa." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Rol,
});

function Rol() {
  const card = "flex flex-col items-center gap-5 rounded-3xl border-4 p-10 text-center shadow-warm transition hover:-translate-y-1";
  return (
    <Page>
      <h1 className="text-center text-4xl font-extrabold md:text-5xl">¿Qué desea hacer hoy?</h1>
      <div className="mx-auto mt-10 grid max-w-4xl gap-8 md:grid-cols-2">
        <Link to="/cocinera" className={`${card} border-primary bg-primary text-primary-foreground`}>
          <ChefHat className="size-20" aria-hidden />
          <span className="font-display text-3xl font-extrabold">Quiero Cocinar y Ganar un Ingreso</span>
          <span className="text-xl">Para señoras que aman cocinar</span>
        </Link>
        <Link to="/explorar" className={`${card} border-secondary bg-card text-foreground`}>
          <Utensils className="size-20 text-secondary" aria-hidden />
          <span className="font-display text-3xl font-extrabold">Quiero Comida Casera</span>
          <span className="text-xl text-muted-foreground">Para estudiantes y profesionales</span>
        </Link>
      </div>
    </Page>
  );
}
