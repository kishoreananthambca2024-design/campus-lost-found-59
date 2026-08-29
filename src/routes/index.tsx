import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  ArrowRight,
  CheckCircle2,
  PackageSearch,
  Radar,
  Search,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { AnimatedCounter } from "@/components/campus/AnimatedCounter";
import { useCampusFind } from "@/lib/campusfind/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CampusFind — Campus Lost & Found, Smartly Matched" },
      {
        name: "description",
        content:
          "CampusFind reunites students with lost belongings using smart lost-and-found matching, live case stats, and one-click returns.",
      },
      { property: "og:title", content: "CampusFind — Campus Lost & Found, Smartly Matched" },
      {
        property: "og:description",
        content: "Report, match, and return lost campus belongings in minutes.",
      },
    ],
  }),
  component: Dashboard,
});

const FLOW = [
  { label: "LOST ITEM", icon: Search },
  { label: "SMART MATCH", icon: Radar },
  { label: "FOUND ITEM", icon: PackageSearch },
  { label: "RETURNED ✓", icon: CheckCircle2 },
];

function StatCard({
  label,
  value,
  tone,
  index,
}: {
  label: string;
  value: number;
  tone: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="glass rounded-2xl p-5"
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className={`mt-2 font-display text-4xl font-bold ${tone}`}>
        <AnimatedCounter value={value} />
      </p>
    </motion.div>
  );
}

function Dashboard() {
  const { stats, activity } = useCampusFind();

  return (
    <main className="mx-auto max-w-7xl px-5 py-12">
      <section className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary">
          <Sparkles className="size-3.5" /> Smart matching, zero double-counting
        </span>
        <h1 className="mx-auto mt-5 max-w-3xl text-balance text-4xl font-bold leading-tight md:text-6xl">
          <span className="text-gradient">Lost something on campus?</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-pretty text-base text-muted-foreground md:text-lg">
          CampusFind connects lost belongings with their owners.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            to="/report/lost"
            className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground glow"
          >
            Report a Lost Item
          </Link>
          <Link
            to="/report/found"
            className="rounded-xl border border-border px-5 py-3 text-sm font-semibold hover:bg-secondary/60"
          >
            I Found Something
          </Link>
        </div>
      </section>

      <section className="glass mt-12 rounded-3xl p-6">
        <div className="flex flex-wrap items-center justify-center gap-3 md:gap-5">
          {FLOW.map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 * i }}
              className="flex items-center gap-3 md:gap-5"
            >
              <div className="flex items-center gap-2.5 rounded-2xl bg-secondary/50 px-4 py-3">
                <step.icon className="size-4 text-primary" />
                <span className="font-display text-xs font-bold tracking-widest">{step.label}</span>
              </div>
              {i < FLOW.length - 1 ? (
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.6, delay: i * 0.2 }}
                  className="text-primary"
                >
                  <ArrowRight className="size-4" />
                </motion.span>
              ) : null}
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard index={0} label="Active Lost" value={stats.activeLost} tone="text-lost" />
        <StatCard index={1} label="Items Found" value={stats.itemsFound} tone="text-found" />
        <StatCard
          index={2}
          label="Possible Matches"
          value={stats.possibleMatches}
          tone="text-accent"
        />
        <StatCard
          index={3}
          label="Successfully Returned"
          value={stats.returned}
          tone="text-primary"
        />
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <section className="glass rounded-3xl p-6">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <TrendingUp className="size-4 text-primary" /> Campus Impact
          </p>
          <p className="mt-4 font-display text-6xl font-bold text-primary">
            <AnimatedCounter value={stats.successRate} suffix="%" />
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Success rate — {stats.returned} returned of {stats.totalCases} unique cases.
          </p>
          <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-secondary">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${stats.successRate}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
          <Link
            to="/matches"
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
          >
            Review smart matches <ArrowRight className="size-4" />
          </Link>
        </section>

        <section className="glass rounded-3xl p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Recent Activity
          </p>
          <ol className="mt-4 space-y-4">
            {activity.slice(0, 6).map((a) => (
              <li key={a.id} className="flex gap-3">
                <span
                  className={`mt-1.5 size-2 shrink-0 rounded-full ${
                    a.kind === "RETURN"
                      ? "bg-found"
                      : a.kind === "MATCH"
                        ? "bg-accent"
                        : "bg-primary"
                  }`}
                />
                <div>
                  <p className="text-sm">{a.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(a.at).toLocaleString()}
                  </p>
                </div>
              </li>
            ))}
            {activity.length === 0 ? (
              <li className="text-sm text-muted-foreground">No activity yet.</li>
            ) : null}
          </ol>
        </section>
      </div>
    </main>
  );
}
