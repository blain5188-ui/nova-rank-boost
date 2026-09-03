import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Trophy, Swords, Wallet, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nova — Ranked Fortnite EU con cashback su ogni match" },
      {
        name: "description",
        content:
          "Gioca Boxfights e Realistics 1v1, 2v2, 3v3 su Nova: matchmaking ELO, tornei cash e cashback su ogni partita vinta.",
      },
      { property: "og:title", content: "Nova — Ranked Fortnite EU con cashback" },
      {
        property: "og:description",
        content: "Matchmaking ELO, tornei con montepremi e payout reali. Server EU.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { data: tournaments } = useQuery({
    queryKey: ["home-tournaments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tournaments")
        .select("*")
        .eq("published", true)
        .order("starts_at", { ascending: true })
        .limit(3);
      if (error) throw error;
      return data;
    },
  });

  const { data: posts } = useQuery({
    queryKey: ["home-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("slug, title, excerpt, category, published_at")
        .eq("published", true)
        .order("published_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden hero-gradient">
        <div className="absolute inset-0 grid-lines opacity-40" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 py-24 text-center md:py-32">
          <p className="eyebrow">Fortnite · Server EU</p>
          <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-bold md:text-6xl">
            Gioca ranked. <span className="text-gradient">Guadagna ad ogni match.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            Nova è la piattaforma competitiva per Boxfights e Realistics. Matchmaking basato su ELO,
            tornei con montepremi reali e cashback accreditato dopo ogni vittoria.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/auth" search={{ mode: "signup" }}>
              <Button size="lg" className="glow">
                Crea account gratis
              </Button>
            </Link>
            <Link to="/ranked">
              <Button size="lg" variant="secondary">
                Vedi la classifica
              </Button>
            </Link>
          </div>
          <div className="mx-auto mt-12 grid max-w-3xl grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { k: "12.400+", v: "Match giocati" },
              { k: "€ 24.800", v: "Payout totali" },
              { k: "< 40s", v: "Attesa media" },
              { k: "EU", v: "Server dedicati" },
            ].map((s) => (
              <div key={s.v} className="panel p-4">
                <div className="font-display text-xl font-bold">{s.k}</div>
                <div className="text-xs text-muted-foreground">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MODES */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <p className="eyebrow">Modalità</p>
        <h2 className="mt-2 text-3xl font-bold">Scegli come competere</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            { icon: Swords, t: "Boxfights", d: "1v1, 2v2 e 3v3 in box. Primo a 5 round vince il match." },
            { icon: ShieldCheck, t: "Realistics", d: "Scenari realistici con loadout fisso e zone competitive." },
            { icon: Trophy, t: "Tornei", d: "Bracket settimanali con montepremi cash e classifica squadre." },
          ].map((m) => (
            <div key={m.t} className="panel p-6">
              <m.icon className="size-6 text-accent" />
              <h3 className="mt-4 text-lg font-semibold">{m.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{m.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW */}
      <section className="border-y border-border bg-card/30">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <p className="eyebrow">Come funziona</p>
          <h2 className="mt-2 text-3xl font-bold">Dal login al payout in 4 step</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {[
              ["01", "Registrati", "Crea l'account Nova e collega il tuo nome Epic."],
              ["02", "Entra in coda", "Scegli modalità e formato, il sistema trova un avversario simile."],
              ["03", "Gioca il match", "Codice server EU, risultato riportato da entrambi i team."],
              ["04", "Incassa", "ELO aggiornato e cashback accreditato sul saldo."],
            ].map(([n, t, d]) => (
              <div key={n} className="panel p-6">
                <div className="font-display text-2xl font-bold text-primary-glow">{n}</div>
                <h3 className="mt-3 font-semibold">{t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TOURNAMENTS */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="flex items-end justify-between">
          <div>
            <p className="eyebrow">Tornei</p>
            <h2 className="mt-2 text-3xl font-bold">Prossimi eventi</h2>
          </div>
          <Link to="/tournaments">
            <Button variant="ghost">Tutti i tornei</Button>
          </Link>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {(tournaments ?? []).map((t) => (
            <Link key={t.id} to="/tournaments/$slug" params={{ slug: t.slug }} className="panel p-6 transition-colors hover:border-primary">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{t.size}</Badge>
                <Badge variant="outline">{t.mode}</Badge>
              </div>
              <h3 className="mt-4 font-semibold">{t.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Montepremi € {(t.prize_cents / 100).toFixed(2)} · {t.region}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* BLOG */}
      <section className="border-t border-border bg-card/30">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="flex items-end justify-between">
            <div>
              <p className="eyebrow">Blog</p>
              <h2 className="mt-2 text-3xl font-bold">Guide e novità</h2>
            </div>
            <Link to="/blog">
              <Button variant="ghost">Tutti gli articoli</Button>
            </Link>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {(posts ?? []).map((p) => (
              <Link key={p.slug} to="/blog/$slug" params={{ slug: p.slug }} className="panel p-6 transition-colors hover:border-primary">
                <Badge variant="secondary">{p.category}</Badge>
                <h3 className="mt-3 font-semibold">{p.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{p.excerpt}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-20">
        <p className="eyebrow">FAQ</p>
        <h2 className="mt-2 text-3xl font-bold">Domande frequenti</h2>
        <Accordion type="single" collapsible className="mt-8">
          {[
            ["Nova è gratis?", "Sì. Creare l'account e giocare in ranked è gratuito, alcuni tornei hanno una quota d'ingresso."],
            ["Come funziona il cashback?", "Ogni match vinto in ranked accredita un importo sul tuo saldo, visibile nella dashboard."],
            ["Serve un account Epic?", "Serve il tuo nome Epic per essere identificato nei match e nei tornei."],
            ["Quali regioni sono supportate?", "Al momento server EU, con matchmaking basato sull'ELO della modalità scelta."],
            ["Come vengono pagati i premi?", "I payout vengono elaborati dal saldo della dashboard dopo la verifica dei risultati."],
          ].map(([q, a], i) => (
            <AccordionItem key={q} value={`i${i}`}>
              <AccordionTrigger className="text-left">{q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-24">
        <div className="panel glow flex flex-col items-center gap-4 p-10 text-center">
          <Wallet className="size-8 text-accent" />
          <h2 className="text-3xl font-bold">Pronto a monetizzare le tue partite?</h2>
          <p className="max-w-xl text-muted-foreground">
            Unisciti a Nova, sali di ELO e trasforma ogni vittoria in cashback.
          </p>
          <Link to="/auth" search={{ mode: "signup" }}>
            <Button size="lg">Inizia ora</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
