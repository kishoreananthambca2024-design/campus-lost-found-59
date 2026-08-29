import { Link } from "@tanstack/react-router";
import { Compass, Plus } from "lucide-react";
import { useCampusFind } from "@/lib/campusfind/store";

const NAV = [
  { to: "/", label: "Dashboard" },
  { to: "/browse", label: "Browse Items" },
  { to: "/matches", label: "Smart Matches" },
  { to: "/report/lost", label: "Report Lost" },
  { to: "/report/found", label: "Report Found" },
] as const;

export function Header() {
  const { stats } = useCampusFind();

  return (
    <header className="sticky top-0 z-40 glass border-x-0 border-t-0">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-5 py-3">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="relative grid size-9 place-items-center rounded-xl bg-primary/15 text-primary">
            <Compass className="size-5" />
            <span className="absolute -right-0.5 -top-0.5 size-2.5 animate-pulse rounded-full bg-neon" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight">
            CAMPUS<span className="text-primary">FIND</span>
          </span>
        </Link>

        <nav className="order-3 flex w-full items-center gap-1 overflow-x-auto md:order-none md:w-auto">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/" }}
              className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
              activeProps={{ className: "bg-secondary text-foreground" }}
            >
              {n.label}
              {n.label === "Smart Matches" && stats.possibleMatches > 0 ? (
                <span className="ml-2 rounded-full bg-accent/20 px-1.5 py-0.5 text-[11px] font-semibold text-accent">
                  {stats.possibleMatches}
                </span>
              ) : null}
            </Link>
          ))}
        </nav>

        <Link
          to="/report/lost"
          className="ml-auto inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.03] glow"
        >
          <Plus className="size-4" /> Report an Item
        </Link>
      </div>
    </header>
  );
}
