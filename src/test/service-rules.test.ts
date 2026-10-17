import { describe, expect, it } from "vitest";
import { puedeValorar, promedioEstrellas } from "@/lib/service-rules";
describe("Valoraciones de cocineras", () => {
  it("solo permite valorar un servicio finalizado por el cliente", () => {
    expect(puedeValorar("completed", true, false)).toBe(true);
    expect(puedeValorar("accepted", true, false)).toBe(false);
    expect(puedeValorar("completed", false, false)).toBe(false);
  });
  it("no permite dos valoraciones para el mismo servicio", () => { expect(puedeValorar("completed", true, true)).toBe(false); });
  it("calcula estrellas reales y no inventa puntuación sin valoraciones", () => { expect(promedioEstrellas([5,4])).toBe(4.5); expect(promedioEstrellas([])).toBeNull(); });
});