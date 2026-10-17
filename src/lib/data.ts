import { useEffect, useState } from "react";
import sopa from "@/assets/sopa.jpg";
import fondo from "@/assets/fondo.jpg";
import postre from "@/assets/postre.jpg";

export type Categoria = "Sopas" | "Platos de Fondo" | "Postres caseros";
export type Modalidad = "llevar" | "mesa";

export interface Cocinera {
  id: string;
  nombre: string;
  distrito: string;
  telefono: string;
  edad: number;
  descripcion: string;
  badges: string[];
  inicial: string;
}

export interface Resena {
  autor: string;
  estrellas: number;
  mensaje: string;
}

export interface Plato {
  id: string;
  nombre: string;
  categoria: Categoria;
  foto: string;
  precio: number;
  porciones: number;
  modalidades: Modalidad[];
  distanciaKm: number;
  cocineraId: string;
  descripcion: string;
  resenas: Resena[];
}

export const cocineras: Cocinera[] = [
  { id: "rosa", nombre: "Rosa Quispe", distrito: "Surquillo", telefono: "51987654321", edad: 66, descripcion: "Cocino desde los 12 años. Mis hijos ya crecieron y extraño ver la mesa llena.", badges: ["Sabor de Abuela", "Especialista en sopas"], inicial: "R" },
  { id: "carmen", nombre: "Carmen Huamán", distrito: "Miraflores", telefono: "51912345678", edad: 63, descripcion: "Fui cocinera en un restaurante 30 años. Ahora cocino en casa, con calma y cariño.", badges: ["Especialista en guisos", "Mesa acogedora"], inicial: "C" },
  { id: "elena", nombre: "Elena Torres", distrito: "Barranco", telefono: "51955511122", edad: 69, descripcion: "Mis postres son receta de mi mamá. Me encanta conversar con los jóvenes.", badges: ["Reina de los postres", "Sabor de Abuela"], inicial: "E" },
];

const seedPlatos: Plato[] = [
  { id: "aguadito", nombre: "Aguadito de pollo", categoria: "Sopas", foto: sopa, precio: 12, porciones: 6, modalidades: ["llevar", "mesa"], distanciaKm: 0.8, cocineraId: "rosa", descripcion: "Caldo verde con culantro, arroz, papa amarilla y presa de pollo.", resenas: [{ autor: "Diego", estrellas: 5, mensaje: "Sentí el sabor de mi casa." }, { autor: "Lucía", estrellas: 5, mensaje: "Excelente atención, muy cariñosa." }] },
  { id: "lomo", nombre: "Lomo saltado casero", categoria: "Platos de Fondo", foto: fondo, precio: 18, porciones: 4, modalidades: ["llevar", "mesa"], distanciaKm: 1.5, cocineraId: "carmen", descripcion: "Lomo al wok con cebolla, tomate, papas fritas y arroz graneadito.", resenas: [{ autor: "Andrés", estrellas: 5, mensaje: "Mejor que en cualquier restaurante." }] },
  { id: "arroz-leche", nombre: "Arroz con leche", categoria: "Postres caseros", foto: postre, precio: 6, porciones: 10, modalidades: ["llevar"], distanciaKm: 2.3, cocineraId: "elena", descripcion: "Cremoso, con canela y clavo de olor. Receta de familia.", resenas: [{ autor: "Valeria", estrellas: 5, mensaje: "Me recordó a mi abuela." }] },
];

const KEY = "sabor-de-hogar-v1";
interface State { platos: Plato[]; pedidos: { platoId: string; cocineraId: string; fecha: string; total: number }[] }
let state: State = { platos: seedPlatos, pedidos: [] };
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const saved = JSON.parse(raw) as State;
      state = { platos: [...saved.platos.filter((p) => !seedPlatos.some((s) => s.id === p.id)), ...seedPlatos.map((s) => saved.platos.find((p) => p.id === s.id) ?? s)], pedidos: saved.pedidos ?? [] };
    }
  } catch { /* ignore */ }
}
function set(next: State) {
  state = next;
  localStorage.setItem(KEY, JSON.stringify(state));
  listeners.forEach((l) => l());
}

export function useStore() {
  const [, force] = useState(0);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    load();
    setReady(true);
    const l = () => force((n) => n + 1);
    listeners.add(l);
    return () => { listeners.delete(l); };
  }, []);
  return ready ? state : { platos: seedPlatos, pedidos: [] };
}

export function publicarPlato(p: Omit<Plato, "id" | "resenas" | "distanciaKm">) {
  load();
  set({ ...state, platos: [{ ...p, id: `p-${Date.now()}`, resenas: [], distanciaKm: 0.3 }, ...state.platos] });
}

export function pedirPlato(platoId: string, cantidad: number) {
  load();
  const plato = state.platos.find((p) => p.id === platoId);
  if (!plato || plato.porciones < cantidad) return false;
  set({
    platos: state.platos.map((p) => (p.id === platoId ? { ...p, porciones: p.porciones - cantidad } : p)),
    pedidos: [...state.pedidos, { platoId, cocineraId: plato.cocineraId, fecha: new Date().toISOString(), total: plato.precio * cantidad }],
  });
  return true;
}

export function agregarResena(platoId: string, r: Resena) {
  load();
  set({ ...state, platos: state.platos.map((p) => (p.id === platoId ? { ...p, resenas: [r, ...p.resenas] } : p)) });
}

export const getCocinera = (id: string) => cocineras.find((c) => c.id === id)!;
export const soles = (n: number) => `S/ ${n.toFixed(2)}`;
export const whatsappLink = (tel: string, msg: string) => `https://wa.me/${tel}?text=${encodeURIComponent(msg)}`;
