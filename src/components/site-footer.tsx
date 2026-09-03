import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-primary font-display font-bold text-primary-foreground">
              N
            </span>
            <span className="font-display font-bold">NOVA</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Ranked competitivo su Fortnite con cashback su ogni partita. Server EU.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Piattaforma</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/ranked" className="hover:text-foreground">
                Ranked
              </Link>
            </li>
            <li>
              <Link to="/tournaments" className="hover:text-foreground">
                Tornei
              </Link>
            </li>
            <li>
              <Link to="/blog" className="hover:text-foreground">
                Blog
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Account</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/auth" search={{ mode: "signup" }} className="hover:text-foreground">
                Registrati
              </Link>
            </li>
            <li>
              <Link to="/dashboard" className="hover:text-foreground">
                Dashboard
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Legale</h4>
          <p className="mt-3 text-sm text-muted-foreground">
            Nova non è affiliata a Epic Games. Gioca responsabilmente, 18+.
          </p>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Nova. Tutti i diritti riservati.
      </div>
    </footer>
  );
}
