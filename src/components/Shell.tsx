import { Link } from "@tanstack/react-router";
import { Mic, MicOff } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b-2 border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
        <Link to="/" className="flex items-center gap-2 font-display text-2xl font-extrabold text-primary">
          <span aria-hidden>🍲</span> Sabor de Hogar
        </Link>
        <nav className="flex gap-2 text-lg font-bold" aria-label="Principal">
          <Link to="/explorar" className="rounded-xl px-4 py-2 hover:bg-muted" activeProps={{ className: "bg-muted" }}>Contratar</Link>
          <Link to="/cocinera" className="rounded-xl px-4 py-2 hover:bg-muted" activeProps={{ className: "bg-muted" }}>Cocinar</Link>
        </nav>
      </div>
    </header>
  );
}

export function Page({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-5 py-8">{children}</main>
    </div>
  );
}

export const bigBtn =
  "inline-flex min-h-16 items-center justify-center gap-3 rounded-2xl px-8 py-4 text-xl font-bold shadow-warm transition active:scale-[0.98] disabled:opacity-50";
export const btnPrimary = `${bigBtn} bg-primary text-primary-foreground hover:bg-primary/90`;
export const btnSecondary = `${bigBtn} bg-secondary text-secondary-foreground hover:bg-secondary/90`;
export const btnWhatsapp = `${bigBtn} bg-whatsapp text-primary-foreground hover:opacity-90`;
export const btnOutline = `${bigBtn} border-2 border-primary bg-card text-primary shadow-none hover:bg-muted`;

type SR = { lang: string; interimResults: boolean; onresult: (e: { results: { 0: { transcript: string } }[] }) => void; onend: () => void; onerror: () => void; start: () => void; stop: () => void };

/** Botón de dictado por voz (Web Speech API). */
export function VoiceButton({ onText, label }: { onText: (t: string) => void; label: string }) {
  const [on, setOn] = useState(false);
  const rec = useRef<SR | null>(null);
  const toggle = () => {
    const w = window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) return toast.error("Su navegador no permite dictado por voz. Pruebe con Chrome.");
    if (on) return rec.current?.stop();
    const r = new Ctor();
    r.lang = "es-PE";
    r.interimResults = false;
    r.onresult = (e) => onText(e.results[0]?.[0]?.transcript ?? "");
    r.onend = () => setOn(false);
    r.onerror = () => setOn(false);
    rec.current = r;
    r.start();
    setOn(true);
  };
  return (
    <button type="button" onClick={toggle} aria-label={`Dictar por voz: ${label}`} aria-pressed={on}
      className={`flex min-h-14 min-w-14 shrink-0 items-center justify-center rounded-2xl border-2 ${on ? "animate-pulse border-destructive bg-destructive text-destructive-foreground" : "border-secondary bg-accent text-accent-foreground"}`}>
      {on ? <MicOff className="size-7" /> : <Mic className="size-7" />}
    </button>
  );
}

export function Stars({ n }: { n: number }) {
  return <span className="text-gold" aria-label={`${n} de 5 estrellas`}>{"★".repeat(n)}<span className="text-border">{"★".repeat(5 - n)}</span></span>;
}
