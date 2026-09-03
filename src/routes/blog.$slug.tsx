import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/blog/$slug")({
  head: () => ({
    meta: [
      { title: "Articolo — Blog Nova" },
      { name: "description", content: "Leggi le guide e le novità competitive pubblicate dal team Nova." },
      { property: "og:title", content: "Articolo — Blog Nova" },
      { property: "og:description", content: "Guide competitive e aggiornamenti dalla piattaforma Nova." },
    ],
  }),
  component: BlogPost,
});

function BlogPost() {
  const { slug } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <div className="mx-auto max-w-3xl px-4 py-20 text-muted-foreground">Caricamento...</div>;

  if (!data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Articolo non trovato</h1>
        <Link to="/blog" className="mt-4 inline-block">
          <Button variant="secondary">Torna al blog</Button>
        </Link>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-16">
      <Badge variant="secondary">{data.category}</Badge>
      <h1 className="mt-4 text-4xl font-bold">{data.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {new Date(data.published_at).toLocaleDateString("it-IT")} · {data.author ?? "Team Nova"}
      </p>
      <p className="mt-6 text-lg text-muted-foreground">{data.excerpt}</p>
      <div className="mt-8 whitespace-pre-wrap leading-relaxed">{data.body}</div>
      <Link to="/blog" className="mt-10 inline-block">
        <Button variant="secondary">Tutti gli articoli</Button>
      </Link>
    </article>
  );
}
