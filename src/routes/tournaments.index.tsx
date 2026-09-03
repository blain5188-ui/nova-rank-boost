import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/tournaments/")({
  head: () => ({
    meta: [
      { title: "Tornei Nova — Montepremi cash su Fortnite EU" },
      {
        name: "description",
        content: "Tutti i tornei Nova: Boxfights e Realistics 1v1, 2v2 e 3v3 con montepremi in denaro su server EU.",
      },
      { property: "og:title", content: "Tornei Nova" },
      { property: "og:description", content: "Iscriviti ai tornei Nova e gioca per il montepremi." },
    ],
  }),
  component: TournamentsPage,
});

function TournamentsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["tournaments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tournaments")
        .select("*")
        .eq("published", true)
        .order("starts_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div>
      <section className="hero-gradient border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <p className="eyebrow">Tornei</p>
          <h1 className="mt-2 text-4xl font-bold">Compete per il montepremi</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Bracket ufficiali Nova con squadre, calendario partite e classifica live.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        {isLoading && <p className="text-muted-foreground">Caricamento tornei...</p>}
        <div className="grid gap-4 md:grid-cols-3">
          {(data ?? []).map((t) => (
            <Link
              key={t.id}
              to="/tournaments/$slug"
              params={{ slug: t.slug }}
              className="panel p-6 transition-colors hover:border-primary"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{t.status}</Badge>
                <Badge variant="secondary">{t.size}</Badge>
                <Badge variant="outline">{t.mode}</Badge>
              </div>
              <h2 className="mt-4 text-lg font-semibold">{t.title}</h2>
              <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{t.description}</p>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="font-semibold text-accent">€ {(t.prize_cents / 100).toFixed(2)}</span>
                <span className="text-muted-foreground">
                  {new Date(t.starts_at).toLocaleDateString("it-IT", { day: "2-digit", month: "short" })}
                </span>
              </div>
            </Link>
          ))}
        </div>
        {!isLoading && (data?.length ?? 0) === 0 && (
          <p className="text-muted-foreground">Nessun torneo pubblicato al momento.</p>
        )}
      </section>
    </div>
  );
}
