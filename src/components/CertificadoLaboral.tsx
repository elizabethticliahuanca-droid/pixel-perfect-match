import { useRef, useState } from "react";
import { FileCheck2, Upload, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { validarCertificado, type Certificado } from "@/lib/certificado";

export function CertificadoLaboral({ value, onChange }: {
  value?: Certificado;
  onChange: (value: Certificado | undefined) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function seleccionar(file: File | undefined) {
    if (!file) return;
    const invalid = validarCertificado(file);
    setError(invalid);
    if (invalid) return;
    setLoading(true);
    try {
      const contenido = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error());
        reader.onerror = () => reject(new Error());
        reader.readAsDataURL(file);
      });
      onChange({ nombre: file.name, contenido });
      toast.success("Certificado adjuntado. Pendiente de verificación.");
    } catch {
      setError("No se pudo guardar el documento. Intente con un archivo más pequeño.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="min-w-0 space-y-4 border-y-2 border-border py-6" aria-labelledby="certificado-titulo">
      <h2 id="certificado-titulo" className="flex items-start gap-3 text-2xl font-bold">
        <FileCheck2 className="mt-1 size-7 shrink-0 text-secondary" /> Certificado Único Laboral
      </h2>
      <p className="text-xl text-muted-foreground">Opcional · PDF, JPG o PNG, hasta 2 MB.</p>
      {value && <div className="min-w-0 space-y-2">
        <p className="break-all text-xl font-bold">{value.nombre}</p>
        <p className="text-lg text-muted-foreground">Adjuntado · Pendiente de verificación</p>
      </div>}
      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="outline" disabled={loading} onClick={() => input.current?.click()}
          className="h-auto min-h-16 max-w-full whitespace-normal rounded-2xl border-2 border-primary px-5 py-3 text-xl font-bold text-primary">
          <Upload /> {loading ? "Adjuntando…" : value ? "Cambiar certificado" : "Adjuntar certificado"}
        </Button>
        {value && <Button type="button" variant="ghost" disabled={loading} onClick={() => { onChange(undefined); setError(null); }}
          className="h-auto min-h-16 px-5 text-xl text-destructive"><Trash2 /> Quitar</Button>}
      </div>
      <input ref={input} aria-label="Subir Certificado Único Laboral" type="file" accept="application/pdf,image/jpeg,image/png" className="sr-only"
        onChange={(event) => { void seleccionar(event.target.files?.[0]); event.target.value = ""; }} />
      {error && <p role="alert" className="text-lg font-bold text-destructive">{error}</p>}
      <p className="text-lg text-muted-foreground">Guardado solo en este navegador. Aún no es visible para quienes contratan.</p>
    </section>
  );
}