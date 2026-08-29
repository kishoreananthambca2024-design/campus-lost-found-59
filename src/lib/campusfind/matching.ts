import type { Item } from "./types";

const STOP_WORDS = new Set([
  "the",
  "a",
  "an",
  "my",
  "with",
  "and",
  "of",
  "in",
  "on",
  "at",
  "is",
  "it",
  "for",
  "to",
  "lost",
  "found",
  "item",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

function locationMatch(a: string, b: string): boolean {
  const x = a.trim().toLowerCase();
  const y = b.trim().toLowerCase();
  if (!x || !y) return false;
  return x.includes(y) || y.includes(x);
}

function daysApart(a: string, b: string): number {
  const t1 = new Date(a).getTime();
  const t2 = new Date(b).getTime();
  if (Number.isNaN(t1) || Number.isNaN(t2)) return Number.POSITIVE_INFINITY;
  return Math.abs(t1 - t2) / 86_400_000;
}

/**
 * Rule-based match score (0-100):
 *  category +40 | location +20 | keyword overlap up to +30 | date within 3 days +10
 */
export function calculateMatchScore(lostItem: Item, foundItem: Item): number {
  let score = 0;

  if (lostItem.category.toLowerCase() === foundItem.category.toLowerCase()) {
    score += 40;
  }

  if (locationMatch(lostItem.location, foundItem.location)) {
    score += 20;
  }

  const lostWords = new Set(tokenize(`${lostItem.title} ${lostItem.description}`));
  const foundWords = new Set(tokenize(`${foundItem.title} ${foundItem.description}`));
  if (lostWords.size && foundWords.size) {
    let overlap = 0;
    for (const w of lostWords) if (foundWords.has(w)) overlap += 1;
    const ratio = overlap / Math.min(lostWords.size, foundWords.size);
    score += Math.round(ratio * 30);
  }

  if (daysApart(lostItem.date, foundItem.date) <= 3) {
    score += 10;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

export const MATCH_THRESHOLD = 60;
