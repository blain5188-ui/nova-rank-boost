import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/dashboard")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Dashboard Nova — Statistiche, tornei e saldo" },
      { name: "description", content: "La tua dashboard Nova: statistiche ELO, tornei, saldo cashback e gestione account." },
      { property: "og:title", content: "Dashboard Nova" },
      { property: "og:description", content: "Gestisci il tuo profilo competitivo Nova." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { user, profile, isAdmin, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [epic, setEpic] = useState("");

  useEffect(() => {
    if (!loading && !user) void navigate({ to: "/auth", search: { mode: "login" } });
  }, [loading, user, navigate]);

  useEffect(() => {
    setEpic(profile?.epic_name ?? "");
  }, [profile?.epic_name]);

  const { data: stats } = useQuery({
    queryKey: ["my-stats", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("ranked_stats").select("*").eq("user_id", user!.id);
      if (error) throw error;
      return data;
    },
  });

  const saveEpic = async () => {
    const { error } = await supabase.from("profiles").update({ epic_name: epic }).eq("id", user!.id);
    if (error) return toast.error(error.message);
    await refreshProfile();
    toast.success("Nome Epic aggiornato");
  };

  if (loading || !user) return <div className="mx-auto max-w-6xl px-4 py-20 text-muted-foreground">Caricamento...</div>;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <p className="eyebrow">Dashboard</p>
      <h1 className="mt-2 text-3xl font-bold">Ciao {profile?.username ?? "player"}</h1>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="panel p-6">
          <div className="text-sm text-muted-foreground">Saldo cashback</div>
          <div className="font-display text-3xl font-bold text-accent">
            € {((profile?.balance_cents ?? 0) / 100).toFixed(2)}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Payout disponibile da € 10,00</p>
        </div>
        <div className="panel p-6 md:col-span-2">
          <Label htmlFor="epic">Nome Epic</Label>
          <div className="mt-2 flex gap-2">
            <Input id="epic" value={epic} onChange={(e) => setEpic(e.target.value)} placeholder="Il tuo Epic ID" />
            <Button onClick={saveEpic}>Salva</Button>
          </div>
        </div>
      </div>

      <h2 className="mt-10 text-2xl font-bold">Le tue statistiche</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {(stats ?? []).map((s) => (
          <div key={s.id} className="panel p-5">
            <div className="flex gap-2">
              <Badge variant="secondary">{s.mode}</Badge>
              <Badge variant="outline">{s.size}</Badge>
            </div>
            <div className="mt-3 font-display text-2xl font-bold">{s.elo} ELO</div>
            <p className="text-sm text-muted-foreground">
              Peak {s.peak_elo} · {s.wins}V / {s.losses}S
            </p>
          </div>
        ))}
        {(stats?.length ?? 0) === 0 && <p className="text-muted-foreground">Nessuna partita registrata.</p>}
      </div>

      {isAdmin && <AdminPanel />}

      <div className="mt-10 flex gap-3">
        <Link to="/ranked">
          <Button variant="secondary">Classifica</Button>
        </Link>
        <Link to="/tournaments">
          <Button variant="secondary">Tornei</Button>
        </Link>
      </div>
    </div>
  );
}

function AdminPanel() {
  const qc = useQueryClient();
  const [t, setT] = useState({ title: "", slug: "", description: "", prize: "0" });
  const [team, setTeam] = useState({ tournament_id: "", name: "", tag: "" });
  const [post, setPost] = useState({ title: "", slug: "", category: "news", excerpt: "", body: "" });

  const { data: tournaments } = useQuery({
    queryKey: ["admin-tournaments"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tournaments").select("id, title, slug, published");
      if (error) throw error;
      return data;
    },
  });

  const createTournament = async (published: boolean) => {
    const { error } = await supabase.from("tournaments").insert({
      title: t.title,
      slug: t.slug,
      description: t.description,
      prize_cents: Math.round(Number(t.prize) * 100) || 0,
      published,
    });
    if (error) return toast.error(error.message);
    toast.success(published ? "Torneo pubblicato" : "Torneo salvato come bozza");
    setT({ title: "", slug: "", description: "", prize: "0" });
    void qc.invalidateQueries({ queryKey: ["admin-tournaments"] });
    void qc.invalidateQueries({ queryKey: ["tournaments"] });
  };

  const createTeam = async () => {
    if (!team.tournament_id) return toast.error("Seleziona un torneo");
    const { error } = await supabase.from("teams").insert({
      tournament_id: team.tournament_id,
      name: team.name,
      tag: team.tag,
    });
    if (error) return toast.error(error.message);
    toast.success("Squadra creata");
    setTeam({ tournament_id: team.tournament_id, name: "", tag: "" });
  };

  const createPost = async (published: boolean) => {
    const { error } = await supabase.from("blog_posts").insert({ ...post, published });
    if (error) return toast.error(error.message);
    toast.success(published ? "Articolo pubblicato" : "Bozza salvata");
    setPost({ title: "", slug: "", category: "news", excerpt: "", body: "" });
    void qc.invalidateQueries({ queryKey: ["blog-posts"] });
  };

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold">Pannello admin</h2>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="panel space-y-3 p-6">
          <h3 className="font-semibold">Nuovo torneo</h3>
          <Input placeholder="Titolo" value={t.title} onChange={(e) => setT({ ...t, title: e.target.value })} />
          <Input placeholder="slug-url" value={t.slug} onChange={(e) => setT({ ...t, slug: e.target.value })} />
          <Input placeholder="Montepremi €" value={t.prize} onChange={(e) => setT({ ...t, prize: e.target.value })} />
          <Textarea
            placeholder="Descrizione"
            value={t.description}
            onChange={(e) => setT({ ...t, description: e.target.value })}
          />
          <div className="flex gap-2">
            <Button onClick={() => createTournament(true)}>Pubblica</Button>
            <Button variant="secondary" onClick={() => createTournament(false)}>
              Bozza
            </Button>
          </div>
        </div>

        <div className="panel space-y-3 p-6">
          <h3 className="font-semibold">Nuova squadra</h3>
          <select
            className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm"
            value={team.tournament_id}
            onChange={(e) => setTeam({ ...team, tournament_id: e.target.value })}
          >
            <option value="">Seleziona torneo</option>
            {(tournaments ?? []).map((x) => (
              <option key={x.id} value={x.id}>
                {x.title}
              </option>
            ))}
          </select>
          <Input placeholder="Nome squadra" value={team.name} onChange={(e) => setTeam({ ...team, name: e.target.value })} />
          <Input placeholder="TAG" value={team.tag} onChange={(e) => setTeam({ ...team, tag: e.target.value })} />
          <Button onClick={createTeam}>Aggiungi squadra</Button>
        </div>

        <div className="panel space-y-3 p-6">
          <h3 className="font-semibold">Nuovo articolo</h3>
          <Input placeholder="Titolo" value={post.title} onChange={(e) => setPost({ ...post, title: e.target.value })} />
          <Input placeholder="slug-url" value={post.slug} onChange={(e) => setPost({ ...post, slug: e.target.value })} />
          <Input placeholder="Categoria" value={post.category} onChange={(e) => setPost({ ...post, category: e.target.value })} />
          <Textarea placeholder="Estratto" value={post.excerpt} onChange={(e) => setPost({ ...post, excerpt: e.target.value })} />
          <Textarea placeholder="Contenuto" value={post.body} onChange={(e) => setPost({ ...post, body: e.target.value })} />
          <div className="flex gap-2">
            <Button onClick={() => createPost(true)}>Pubblica</Button>
            <Button variant="secondary" onClick={() => createPost(false)}>
              Bozza
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
