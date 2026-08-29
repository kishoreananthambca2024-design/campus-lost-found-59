import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { ItemCard } from "@/components/campus/ItemCard";
import { useCampusFind } from "@/lib/campusfind/store";
import { CATEGORIES } from "@/lib/campusfind/types";

export const Route = createFileRoute("/browse")({
  head: () => ({
    meta: [
      { title: "Browse Lost & Found Items — CampusFind" },
      {
        name: "description",
        content:
          "Search every lost and found report on campus by keyword, category, and type to spot your belongings.",
      },
      { property: "og:title", content: "Browse Lost & Found Items — CampusFind" },
      {
        property: "og:description",
        content: "Filter campus lost and found reports by keyword, category, and type.",
      },
    ],
  }),
  component: BrowsePage,
});

const control =
  "rounded-xl border border-input bg-secondary/40 px-3.5 py-2.5 text-sm outline-none focus:border-primary/60";

function BrowsePage() {
  const { items } = useCampusFind();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("ALL");
  const [type, setType] = useState<"ALL" | "LOST" | "FOUND">("ALL");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items
      .filter((i) => (type === "ALL" ? true : i.type === type))
      .filter((i) => (category === "ALL" ? true : i.category === category))
      .filter((i) =>
        needle
          ? `${i.title} ${i.description} ${i.location}`.toLowerCase().includes(needle)
          : true,
      )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [items, q, category, type]);

  return (
    <main className="mx-auto max-w-7xl px-5 py-10">
      <h1 className="font-display text-3xl font-bold">Browse Items</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {filtered.length} of {items.length} reports
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-56">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search items, places, details…"
            className={`${control} w-full pl-9`}
          />
        </div>

        <select
          className={control}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Category filter"
        >
          <option value="ALL" className="bg-popover">
            All categories
          </option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c} className="bg-popover">
              {c}
            </option>
          ))}
        </select>

        <div className="flex rounded-xl border border-input bg-secondary/40 p-1">
          {(["ALL", "LOST", "FOUND"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold tracking-wider transition-colors ${
                type === t ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="glass mt-8 rounded-2xl p-10 text-center text-sm text-muted-foreground">
          No items match these filters.
        </p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item, i) => (
            <ItemCard key={item.id} item={item} index={i} />
          ))}
        </div>
      )}
    </main>
  );
}
