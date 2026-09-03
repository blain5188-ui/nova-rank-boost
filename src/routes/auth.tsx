import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Search = { mode: "login" | "signup" };

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    mode: search['mode'] === "signup" ? "signup" : "login",
  }),
  head: () => ({
    meta: [
      { title: "Accedi a Nova — Ranked Fortnite" },
      { name: "description", content: "Accedi o registrati su Nova per giocare ranked e incassare cashback." },
      { property: "og:title", content: "Accedi a Nova" },
      { property: "og:description", content: "Crea il tuo account Nova e inizia a competere." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) void navigate({ to: "/dashboard" });
  }, [loading, user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { username: username || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success("Account creato! Ora puoi accedere.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Bentornato su Nova");
      }
      await navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Errore di autenticazione");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="hero-gradient">
      <div className="mx-auto flex max-w-md flex-col px-4 py-20">
        <div className="panel p-8">
          <p className="eyebrow">{mode === "signup" ? "Registrazione" : "Accesso"}</p>
          <h1 className="mt-2 text-2xl font-bold">
            {mode === "signup" ? "Crea il tuo account Nova" : "Accedi a Nova"}
          </h1>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="nova_player" />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Attendi..." : mode === "signup" ? "Registrati" : "Accedi"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signup" ? (
              <>
                Hai già un account?{" "}
                <Link to="/auth" search={{ mode: "login" }} className="text-accent hover:underline">
                  Accedi
                </Link>
              </>
            ) : (
              <>
                Nuovo su Nova?{" "}
                <Link to="/auth" search={{ mode: "signup" }} className="text-accent hover:underline">
                  Registrati
                </Link>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
