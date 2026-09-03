import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const nav = [
  { to: "/ranked", label: "Ranked" },
  { to: "/tournaments", label: "Tornei" },
  { to: "/blog", label: "Blog" },
] as const;

export function SiteHeader() {
  const { user, profile, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-lg bg-primary font-display text-lg font-bold text-primary-foreground glow">
            N
          </span>
          <span className="font-display text-lg font-bold tracking-tight">NOVA</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "rounded-md px-3 py-2 text-sm text-foreground bg-secondary" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <Link to="/dashboard">
                <Button variant="secondary" size="sm">
                  {profile?.username ?? "Dashboard"}
                </Button>
              </Link>
              <Button size="sm" variant="ghost" onClick={() => void signOut()}>
                Esci
              </Button>
            </>
          ) : (
            <>
              <Link to="/auth" search={{ mode: "login" }}>
                <Button variant="ghost" size="sm">
                  Accedi
                </Button>
              </Link>
              <Link to="/auth" search={{ mode: "signup" }}>
                <Button size="sm">Inizia gratis</Button>
              </Link>
            </>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Apri menu"
        >
          <Menu className="size-5" />
        </Button>
      </div>

      {open && (
        <div className="border-t border-border px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                {n.label}
              </Link>
            ))}
            {user ? (
              <Link to="/dashboard" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm">
                Dashboard
              </Link>
            ) : (
              <Link
                to="/auth"
                search={{ mode: "login" }}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm"
              >
                Accedi
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
