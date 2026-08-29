import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, Sparkles, X } from "lucide-react";
import { useCampusFind, type ReportResult } from "@/lib/campusfind/store";
import { CATEGORIES, type ItemType } from "@/lib/campusfind/types";

const today = () => new Date().toISOString().slice(0, 10);

const field =
  "w-full rounded-xl border border-input bg-secondary/40 px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/60 focus:ring-2 focus:ring-ring/30";

export function ReportForm({ type }: { type: ItemType }) {
  const { reportItem } = useCampusFind();
  const [result, setResult] = useState<ReportResult | null>(null);
  const [form, setForm] = useState({
    title: "",
    category: CATEGORIES[0] as string,
    description: "",
    location: "",
    date: today(),
    contactName: "",
    contactInfo: "",
  });

  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(reportItem({ ...form, type }));
  };

  const isLost = type === "LOST";

  return (
    <>
      <form onSubmit={onSubmit} className="glass rounded-3xl p-6 md:p-8">
        <div className="mb-6 flex items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold tracking-widest ${
              isLost ? "bg-lost/20 text-lost" : "bg-found/20 text-found"
            }`}
          >
            {type}
          </span>
          <h1 className="font-display text-2xl font-bold">
            Report {isLost ? "a Lost" : "a Found"} Item
          </h1>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="md:col-span-2 block text-sm">
            <span className="mb-1.5 block font-medium text-muted-foreground">Title</span>
            <input
              required
              className={field}
              placeholder="e.g. Black Leather Wallet"
              value={form.title}
              onChange={(e) => set("title")(e.target.value)}
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-muted-foreground">Category</span>
            <select
              className={field}
              value={form.category}
              onChange={(e) => set("category")(e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c} className="bg-popover">
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-muted-foreground">Location</span>
            <input
              required
              className={field}
              placeholder="e.g. CS Block"
              value={form.location}
              onChange={(e) => set("location")(e.target.value)}
            />
          </label>

          <label className="md:col-span-2 block text-sm">
            <span className="mb-1.5 block font-medium text-muted-foreground">Description</span>
            <textarea
              required
              rows={3}
              className={field}
              placeholder="Colour, brand, distinguishing marks…"
              value={form.description}
              onChange={(e) => set("description")(e.target.value)}
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-muted-foreground">Date</span>
            <input
              required
              type="date"
              className={field}
              value={form.date}
              onChange={(e) => set("date")(e.target.value)}
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-muted-foreground">Contact Name</span>
            <input
              required
              className={field}
              placeholder="Your name"
              value={form.contactName}
              onChange={(e) => set("contactName")(e.target.value)}
            />
          </label>

          <label className="md:col-span-2 block text-sm">
            <span className="mb-1.5 block font-medium text-muted-foreground">Contact Info</span>
            <input
              required
              className={field}
              placeholder="Email or phone"
              value={form.contactInfo}
              onChange={(e) => set("contactInfo")(e.target.value)}
            />
          </label>
        </div>

        <button
          type="submit"
          className="mt-6 w-full rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground transition-transform hover:scale-[1.01] glow"
        >
          Submit Report & Run Smart Match
        </button>
      </form>

      <AnimatePresence>
        {result ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.94, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              className="glass w-full max-w-md rounded-3xl p-7 text-center glow"
            >
              <button
                onClick={() => setResult(null)}
                aria-label="Close"
                className="ml-auto block text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
              <CheckCircle2 className="mx-auto size-12 text-found" />
              <h2 className="mt-3 font-display text-xl font-bold">Report submitted</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                “{result.item.title}” is now live on CampusFind.
              </p>

              {result.newMatches.length > 0 ? (
                <div className="mt-5 rounded-2xl border border-accent/40 bg-accent/10 p-4">
                  <p className="flex items-center justify-center gap-2 font-display font-bold text-accent">
                    <Sparkles className="size-4" /> Match Found!
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {result.newMatches.length} possible match at {result.newMatches[0].matchScore}%
                    confidence.
                  </p>
                  <Link
                    to="/matches"
                    className="mt-3 inline-flex rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground"
                  >
                    Go to Smart Matches
                  </Link>
                </div>
              ) : (
                <p className="mt-5 rounded-2xl bg-secondary/50 p-4 text-sm text-muted-foreground">
                  No confident match yet (best score {result.bestScore}%). We'll keep scanning every
                  new report.
                </p>
              )}

              <button
                onClick={() => setResult(null)}
                className="mt-4 w-full rounded-xl border border-border px-4 py-2.5 text-sm font-medium hover:bg-secondary/60"
              >
                Report another item
              </button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
