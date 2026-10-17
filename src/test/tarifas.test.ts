import { describe, expect, it } from "vitest";
import { cotizar } from "@/lib/tarifas";

describe("tarifas", () => {
  it("2 días para 1 persona = 8 h × S/15", () => expect(cotizar("2dias", "1").total).toBe(120));
  it("1 semana para 2 personas = 20 h × S/18", () => expect(cotizar("semana", "2").total).toBe(360));
  it("1 semana para más de 4 = 20 h × S/28", () => expect(cotizar("semana", "5+").total).toBe(560));
});
