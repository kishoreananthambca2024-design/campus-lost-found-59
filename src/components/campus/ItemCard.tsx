import { CalendarDays, MapPin, Tag, User } from "lucide-react";
import { motion } from "motion/react";
import type { Item } from "@/lib/campusfind/types";
import { StatusTag } from "./StatusTag";

export function ItemCard({ item, index = 0 }: { item: Item; index?: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.4) }}
      className="glass rounded-2xl p-5 transition-colors hover:border-primary/40"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-base font-semibold leading-snug">{item.title}</h3>
        <StatusTag item={item} />
      </div>

      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{item.description}</p>

      <dl className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Tag className="size-3.5 text-primary" /> {item.category}
        </div>
        <div className="flex items-center gap-1.5">
          <MapPin className="size-3.5 text-primary" /> {item.location}
        </div>
        <div className="flex items-center gap-1.5">
          <CalendarDays className="size-3.5 text-primary" /> {item.date}
        </div>
        <div className="flex items-center gap-1.5 truncate">
          <User className="size-3.5 text-primary" /> {item.contactName}
        </div>
      </dl>
    </motion.article>
  );
}
