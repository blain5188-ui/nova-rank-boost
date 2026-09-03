import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
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

type Mode = "boxfights" | "realistics";
type Size = "1v1" | "2v2" | "3v3";

export const Route = createFileRoute("/ranked")({
  head: () => ({
    meta: [
      { title: "Classifica Ranked Nova — ELO Boxfights e Realistics" },
      {
        name: "description",
        content: "Classifica ELO di Nova per Boxfights e Realistics in 1v1, 2v2 e 3v3 su server EU.",
      },
      { property: "og:title", content: "Classifica Ranked Nova" },
      { property: "og:description", content: "Scopri i migliori giocatori Nova per ELO e vittorie." },
    ],
  }),
  component: RankedPage,
});

function RankedPage() {
  const [mode, setMode] = useState<Mode>("boxfights");
  const [size, setSize] = useState<Size>("2v2");

  const { data, isLoading } = useQuery({
    queryKey: ["leaderboard", mode, size],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ranked_stats")
        .select("elo, peak_elo, wins, losses, user_id, profiles!inner(username, epic_name, country)")
        .eq("mode", mode)
        .eq("size", size)
        .order("elo", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as unknown as Array<{
        elo: number;
        peak_elo: number;
        wins: number;
        losses: number;
        user_id: string;
        profiles: { username: string; epic_name: string | null; country: string | null };
      }>;
    },
  });

  return (
    <div>
      <section className="hero-gradient border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <p className="eyebrow">Ranked</p>
          <h1 className="mt-2 text-4xl font-bold">Classifica ELO</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Ogni match confermato aggiorna l'ELO con sistema K=32. I primi 50 giocatori per modalità.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-wrap gap-2">
          {(["boxfights", "realistics"] as Mode[]).map((m) => (
            <Button key={m} size="sm" variant={mode === m ? "default" : "secondary"} onClick={() => setMode(m)}>
              {m}
            </Button>
          ))}
          <span className="mx-2 w-px bg-border" />
          {(["1v1", "2v2", "3v3"] as Size[]).map((s) => (
            <Button key={s} size="sm" variant={size === s ? "default" : "secondary"} onClick={() => setSize(s)}>
              {s}
            </Button>
          ))}
        </div>

        <div className="panel mt-6 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14">#</TableHead>
                <TableHead>Giocatore</TableHead>
                <TableHead>Epic</TableHead>
                <TableHead className="text-right">ELO</TableHead>
                <TableHead className="text-right">Peak</TableHead>
                <TableHead className="text-right">V / S</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    Caricamento classifica...
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && (data?.length ?? 0) === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    Nessun giocatore in questa modalità. Sii il primo a giocare.
                  </TableCell>
                </TableRow>
              )}
              {(data ?? []).map((row, i) => (
                <TableRow key={row.user_id}>
                  <TableCell className="font-display font-bold text-primary-glow">{i + 1}</TableCell>
                  <TableCell className="font-medium">{row.profiles.username}</TableCell>
                  <TableCell className="text-muted-foreground">{row.profiles.epic_name ?? "—"}</TableCell>
                  <TableCell className="text-right font-semibold">{row.elo}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{row.peak_elo}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="secondary">
                      {row.wins} / {row.losses}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
