import { createFileRoute, Link } from "@tanstack/react-router";
import { Page } from "@/components/Shell";
import { Button } from "@/components/ui/button";
export const Route = createFileRoute("/plato/$id")({
  head: () => ({ meta: [
    { title: "Cocina en casa por horas — Sabor de Hogar" },
    { name: "description", content: "Contrate una cocinera para cocinar en su hogar, en lugar de comprar platos individuales." },
    { property: "og:title", content: "Servicio de cocina en casa — Sabor de Hogar" },
    { property: "og:description", content: "Consulte cocineras y solicite un servicio dentro de la app." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }), component: () => <Page><h1 className="text-4xl font-bold">Cocina en casa por horas</h1><p className="mt-4 text-xl">Ya no ofrecemos platos individuales.</p><Button asChild className="mt-6 h-auto min-h-16 whitespace-normal text-xl"><Link to="/explorar">Ver cocineras y tarifas</Link></Button></Page>,
});
