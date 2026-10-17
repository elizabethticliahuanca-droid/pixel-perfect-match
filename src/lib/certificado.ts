export interface Certificado {
  nombre: string;
  contenido: string;
}

export function validarCertificado(file: Pick<File, "type" | "size">): string | null {
  if (!["application/pdf", "image/jpeg", "image/png"].includes(file.type)) {
    return "Elija un documento PDF o una imagen JPG o PNG.";
  }
  if (file.size === 0) return "El archivo está vacío. Elija otro documento.";
  if (file.size > 2 * 1024 * 1024) return "El documento debe pesar como máximo 2 MB.";
  return null;
}