import { describe, expect, it } from "vitest";
import { validarCertificado } from "@/lib/certificado";

describe("Certificado laboral", () => {
  it("accepts PDF, JPG and PNG only", () => {
    for (const type of ["application/pdf", "image/jpeg", "image/png"]) {
      expect(validarCertificado({ type, size: 100 })).toBeNull();
    }
    expect(validarCertificado({ type: "text/html", size: 100 })).not.toBeNull();
  });
  it("allows up to 2 MB", () => {
    expect(validarCertificado({ type: "application/pdf", size: 2 * 1024 * 1024 })).toBeNull();
    expect(validarCertificado({ type: "application/pdf", size: 2 * 1024 * 1024 + 1 })).not.toBeNull();
  });
  it("rejects empty documents", () => {
    expect(validarCertificado({ type: "application/pdf", size: 0 })).not.toBeNull();
  });
});