export type Duracion = "2dias" | "semana";
export type Personas = "1" | "2" | "3-4" | "5+";

export const duraciones: Record<Duracion, { label: string; visitas: number; horasPorVisita: number }> = {
  "2dias": { label: "2 días", visitas: 2, horasPorVisita: 4 },
  semana: { label: "1 semana", visitas: 5, horasPorVisita: 4 },
};

/** Pago por hora a la cocinera según cuántas personas come. */
export const tarifaPorHora: Record<Personas, { label: string; soles: number }> = {
  "1": { label: "1 persona", soles: 15 },
  "2": { label: "2 personas", soles: 18 },
  "3-4": { label: "3 a 4 personas", soles: 22 },
  "5+": { label: "Más de 4 personas", soles: 28 },
};

export function cotizar(d: Duracion, p: Personas) {
  const horas = duraciones[d].visitas * duraciones[d].horasPorVisita;
  const porHora = tarifaPorHora[p].soles;
  return { horas, porHora, total: horas * porHora };
}
