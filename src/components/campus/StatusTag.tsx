import type { Item } from "@/lib/campusfind/types";

export function StatusTag({ item }: { item: Item }) {
  const label = item.status === "RETURNED" ? "RETURNED" : item.type;
  const cls =
    item.status === "RETURNED"
      ? "bg-returned/20 text-returned"
      : item.type === "LOST"
        ? "bg-lost/20 text-lost"
        : "bg-found/20 text-found";

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-bold tracking-widest ${cls}`}
    >
      {label}
    </span>
  );
}
