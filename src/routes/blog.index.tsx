import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Blog Nova — Guide, novità e payout Fortnite" },
      {
        name: "description",
        content: "Guide competitive, aggiornamenti della piattaforma e report sui payout: il blog ufficiale di Nova.",
      },
      { property: "og:title", content: "Blog Nova" },
      { property: "og:description", content: "Guide e novità dal mondo competitivo Nova." },
    ],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  const [category, setCategory] = useState<string>("all");

  const { data, isLoading } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("published", true)
        .order("published_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const categories = ["all", ...Array.from(new Set((data ?? []).map((p) => p.category)))];
  const posts = (data ?? []).filter((p) => category === "all" || p.category === category);

  return (
    <div>
      <section className="hero-gradient border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <p className="eyebrow">Blog</p>
          <h1 className="mt-2 text-4xl font-bold">Guide e novità Nova</h1>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <Button key={c} size="sm" variant={category === c ? "default" : "secondary"} onClick={() => setCategory(c)}>
              {c === "all" ? "Tutte" : c}
            </Button>
          ))}
        </div>

        {isLoading && <p className="mt-8 text-muted-foreground">Caricamento articoli...</p>}

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {posts.map((p) => (
            <Link
              key={p.id}
              to="/blog/$slug"
              params={{ slug: p.slug }}
              className="panel p-6 transition-colors hover:border-primary"
            >
              <Badge variant="secondary">{p.category}</Badge>
              <h2 className="mt-3 text-lg font-semibold">{p.title}</h2>
              <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{p.excerpt}</p>
              <p className="mt-4 text-xs text-muted-foreground">
                {new Date(p.published_at).toLocaleDateString("it-IT")} · {p.author ?? "Team Nova"}
              </p>
            </Link>
          ))}
        </div>
        {!isLoading && posts.length === 0 && <p className="mt-8 text-muted-foreground">Nessun articolo.</p>}
      </section>
    </div>
  );
}
