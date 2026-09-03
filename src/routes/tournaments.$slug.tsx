import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/tournaments/$slug")({
  head: () => ({
    meta: [
      { title: "Torneo Nova — Squadre, calendario e risultati" },
      {
        name: "description",
        content: "Dettaglio torneo Nova: squadre iscritte, roster dei giocatori, calendario partite e classifica.",
      },
      { property: "og:title", content: "Torneo Nova" },
      { property: "og:description", content: "Squadre, partite e classifica del torneo Nova." },
    ],
  }),
  component: TournamentDetail,
});

function TournamentDetail() {
  const { slug } = Route.useParams();

  const { data, isLoading } = useQuery({
    queryKey: ["tournament", slug],
    queryFn: async () => {
      const { data: tournament, error } = await supabase
        .from("tournaments")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      if (!tournament) return null;

      const [{ data: teams }, { data: matches }, { data: players }] = await Promise.all([
        supabase
          .from("teams")
          .select("*")
          .eq("tournament_id", tournament.id)
          .order("points", { ascending: false }),
        supabase
          .from("tournament_matches")
          .select("*")
          .eq("tournament_id", tournament.id)
          .order("round", { ascending: true })
          .order("scheduled_at", { ascending: true }),
        supabase.from("team_players").select("*"),
      ]);

      return { tournament, teams: teams ?? [], matches: matches ?? [], players: players ?? [] };
    },
  });

  if (isLoading) {
    return <div className="mx-auto max-w-6xl px-4 py-20 text-muted-foreground">Caricamento torneo...</div>;
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Torneo non trovato</h1>
        <Link to="/tournaments" className="mt-4 inline-block">
          <Button variant="secondary">Torna ai tornei</Button>
        </Link>
      </div>
    );
  }

  const { tournament, teams, matches, players } = data;
  const teamName = (id: string | null) => teams.find((t) => t.id === id)?.name ?? "TBD";

  return (
    <div>
      <section className="hero-gradient border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{tournament.status}</Badge>
            <Badge variant="secondary">{tournament.size}</Badge>
            <Badge variant="outline">{tournament.mode}</Badge>
            <Badge variant="outline">{tournament.region}</Badge>
          </div>
          <h1 className="mt-4 text-4xl font-bold">{tournament.title}</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">{tournament.description}</p>
          <div className="mt-6 flex flex-wrap gap-6 text-sm">
            <div>
              <div className="text-muted-foreground">Montepremi</div>
              <div className="font-display text-xl font-bold text-accent">
                € {(tournament.prize_cents / 100).toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Iscrizione</div>
              <div className="font-display text-xl font-bold">
                {tournament.entry_fee_cents === 0 ? "Gratis" : `€ ${(tournament.entry_fee_cents / 100).toFixed(2)}`}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Inizio</div>
              <div className="font-display text-xl font-bold">
                {new Date(tournament.starts_at).toLocaleString("it-IT", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-12 lg:grid-cols-2">
        <div>
          <h2 className="text-2xl font-bold">Classifica squadre</h2>
          <div className="panel mt-4 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">#</TableHead>
                  <TableHead>Squadra</TableHead>
                  <TableHead className="text-right">V/S</TableHead>
                  <TableHead className="text-right">Punti</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teams.map((t, i) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-display font-bold text-primary-glow">{i + 1}</TableCell>
                    <TableCell>
                      <span className="font-medium">{t.name}</span>{" "}
                      <span className="text-xs text-muted-foreground">[{t.tag}]</span>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {t.wins}/{t.losses}
                    </TableCell>
                    <TableCell className="text-right font-semibold">{t.points}</TableCell>
                  </TableRow>
                ))}
                {teams.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                      Nessuna squadra iscritta.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold">Calendario partite</h2>
          <div className="mt-4 space-y-3">
            {matches.map((m) => (
              <div key={m.id} className="panel flex items-center justify-between p-4">
                <div>
                  <div className="text-xs text-muted-foreground">Round {m.round}</div>
                  <div className="font-medium">
                    {teamName(m.team_a_id)} <span className="text-muted-foreground">vs</span>{" "}
                    {teamName(m.team_b_id)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(m.scheduled_at).toLocaleString("it-IT", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display text-xl font-bold">
                    {m.score_a} – {m.score_b}
                  </div>
                  <Badge variant={m.status === "confirmed" ? "default" : "secondary"}>{m.status}</Badge>
                </div>
              </div>
            ))}
            {matches.length === 0 && <p className="text-muted-foreground">Calendario non ancora pubblicato.</p>}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20">
        <h2 className="text-2xl font-bold">Roster</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-4">
          {teams.map((t) => (
            <div key={t.id} className="panel p-5">
              <h3 className="font-semibold">{t.name}</h3>
              <p className="text-xs text-muted-foreground">[{t.tag}]</p>
              <ul className="mt-3 space-y-2 text-sm">
                {players
                  .filter((p) => p.team_id === t.id)
                  .map((p) => (
                    <li key={p.id} className="flex items-center justify-between">
                      <span>{p.display_name}</span>
                      <span className="text-xs text-muted-foreground">{p.role}</span>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
