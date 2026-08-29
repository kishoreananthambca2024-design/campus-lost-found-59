import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeftRight, BadgeCheck, ChevronDown, PackageCheck, TriangleAlert } from "lucide-react";
import { useCampusFind } from "@/lib/campusfind/store";
import type { Item, MatchCase } from "@/lib/campusfind/types";

export const Route = createFileRoute("/matches")({
  head: () => ({
    meta: [
      { title: "Smart Matches — CampusFind" },
      {
        name: "description",
        content:
          "Review side-by-side lost and found pairings scored by CampusFind's smart matching engine, then confirm and close cases.",
      },
      { property: "og:title", content: "Smart Matches — CampusFind" },
      {
        property: "og:description",
        content: "Side-by-side lost/found pairings with confidence scores and one-click returns.",
      },
    ],
  }),
  component: MatchesPage,
});

function fireConfetti() {
  confetti({ particleCount: 90, spread: 70, origin: { y: 0.7 } });
  setTimeout(() => confetti({ particleCount: 60, spread: 100, origin: { y: 0.6 } }), 220);
}

function SidePanel({ item, side }: { item: Item; side: "LOST" | "FOUND" }) {
  const tone = side === "LOST" ? "text-lost" : "text-found";
  return (
    <div className="glass-2 flex-1 rounded-2xl p-4">
      <p className={`text-[11px] font-bold tracking-widest ${tone}`}>{side} ITEM</p>
      <h3 className="mt-1 font-display text-lg font-semibold">{item.title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
      <div className="mt-3 space-y-1 text-xs text-muted-foreground">
        <p>Category · {item.category}</p>
        <p>Location · {item.location}</p>
        <p>Date · {item.date}</p>
        <p>Reported by · {item.contactName}</p>
      </div>
    </div>
  );
}

function MatchRow({ match }: { match: MatchCase }) {
  const { getItem, confirmMatch, markReturned } = useCampusFind();
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; message: string } | null>(null);

  const lost = getItem(match.lostItemId);
  const found = getItem(match.foundItemId);
  if (!lost || !found) return null;

  const onReturn = () => {
    const res = markReturned(match.id);
    setNotice(res);
    if (res.ok) fireConfetti();
  };

  const statusTone =
    match.status === "RETURNED"
      ? "bg-returned/20 text-returned"
      : match.status === "CONFIRMED"
        ? "bg-primary/20 text-primary"
        : "bg-accent/20 text-accent";

  return (
    <motion.section
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-3xl p-5 md:p-6"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className={`rounded-full px-3 py-1 text-[11px] font-bold tracking-widest ${statusTone}`}>
          {match.status}
        </span>
        {match.returnedAt ? (
          <span className="text-xs text-muted-foreground">
            Closed {new Date(match.returnedAt).toLocaleString()}
          </span>
        ) : null}
      </div>

      <div className="flex flex-col items-stretch gap-4 md:flex-row md:items-center">
        <SidePanel item={lost} side="LOST" />

        <div className="flex shrink-0 flex-col items-center gap-1.5">
          <ArrowLeftRight className="size-4 text-muted-foreground" />
          <div className="grid size-20 place-items-center rounded-full border border-primary/40 bg-primary/10 glow">
            <span className="font-display text-xl font-bold text-primary">{match.matchScore}%</span>
          </div>
          <span className="text-[10px] font-semibold tracking-widest text-muted-foreground">
            CONFIDENCE
          </span>
        </div>

        <SidePanel item={found} side="FOUND" />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          onClick={() => setOpen((o) => !o)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-secondary/60"
        >
          View Match Details
          <ChevronDown className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        <button
          onClick={() => setNotice(confirmMatch(match.id))}
          disabled={match.status !== "POSSIBLE"}
          className="inline-flex items-center gap-1.5 rounded-xl bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground disabled:opacity-40"
        >
          <BadgeCheck className="size-4" /> Confirm Match
        </button>
        <button
          onClick={onReturn}
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] glow"
        >
          <PackageCheck className="size-4" /> Mark as Returned
        </button>
      </div>

      <AnimatePresence>
        {notice ? (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={`mt-3 flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm ${
              notice.ok ? "bg-found/15 text-found" : "bg-lost/15 text-lost"
            }`}
          >
            {notice.ok ? <PackageCheck className="size-4" /> : <TriangleAlert className="size-4" />}
            {notice.message}
          </motion.p>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 grid gap-3 rounded-2xl bg-secondary/40 p-4 text-sm md:grid-cols-2">
              <div>
                <p className="font-semibold">Lost reporter</p>
                <p className="text-muted-foreground">
                  {lost.contactName} · {lost.contactInfo}
                </p>
              </div>
              <div>
                <p className="font-semibold">Found reporter</p>
                <p className="text-muted-foreground">
                  {found.contactName} · {found.contactInfo}
                </p>
              </div>
              <div className="md:col-span-2 text-xs text-muted-foreground">
                Score breakdown: category {lost.category === found.category ? "+40" : "+0"} ·
                location{" "}
                {lost.location.toLowerCase().includes(found.location.toLowerCase()) ||
                found.location.toLowerCase().includes(lost.location.toLowerCase())
                  ? "+20"
                  : "+0"}{" "}
                · keyword overlap & date proximity make up the rest.
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.section>
  );
}

function MatchesPage() {
  const { matches } = useCampusFind();
  const ordered = [...matches].sort((a, b) => {
    const rank = { POSSIBLE: 0, CONFIRMED: 1, RETURNED: 2 } as const;
    return rank[a.status] - rank[b.status] || b.matchScore - a.matchScore;
  });

  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <h1 className="font-display text-3xl font-bold">Smart Matches</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Every pairing below is one unique case — a lost report bound to a found report.
      </p>

      <div className="mt-7 space-y-5">
        {ordered.length === 0 ? (
          <p className="glass rounded-2xl p-10 text-center text-sm text-muted-foreground">
            No match cases yet. Submit reports and the engine pairs them automatically.
          </p>
        ) : (
          ordered.map((m) => <MatchRow key={m.id} match={m} />)
        )}
      </div>
    </main>
  );
}
