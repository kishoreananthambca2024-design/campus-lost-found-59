import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { SEED_ACTIVITY, SEED_ITEMS, SEED_MATCHES } from "./seed";
import { MATCH_THRESHOLD, calculateMatchScore } from "./matching";
import type { ActivityEvent, Item, MatchCase } from "./types";

const STORAGE_KEY = "campusfind:v1";

interface Persisted {
  items: Item[];
  matches: MatchCase[];
  activity: ActivityEvent[];
}

export interface ReportInput {
  type: Item["type"];
  title: string;
  category: string;
  description: string;
  location: string;
  date: string;
  contactName: string;
  contactInfo: string;
}

export interface ReportResult {
  item: Item;
  newMatches: MatchCase[];
  bestScore: number;
}

interface Store extends Persisted {
  stats: {
    activeLost: number;
    itemsFound: number;
    possibleMatches: number;
    returned: number;
    totalCases: number;
    successRate: number;
  };
  getItem: (id: string) => Item | undefined;
  reportItem: (input: ReportInput) => ReportResult;
  confirmMatch: (matchId: string) => { ok: boolean; message: string };
  markReturned: (matchId: string) => { ok: boolean; message: string };
  resetDemo: () => void;
}

const CampusFindContext = createContext<Store | null>(null);

const seed = (): Persisted => ({
  items: structuredClone(SEED_ITEMS),
  matches: structuredClone(SEED_MATCHES),
  activity: structuredClone(SEED_ACTIVITY),
});

function load(): Persisted {
  if (typeof window === "undefined") return seed();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return seed();
    const parsed = JSON.parse(raw) as Partial<Persisted>;
    if (!Array.isArray(parsed.items) || !Array.isArray(parsed.matches)) return seed();
    return {
      items: parsed.items,
      matches: parsed.matches,
      activity: parsed.activity ?? [],
    };
  } catch {
    return seed();
  }
}

const uid = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

export function CampusFindProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Persisted>(() => seed());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(load());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const stats = useMemo(() => {
    const activeLost = state.items.filter(
      (i) => i.type === "LOST" && i.status !== "RETURNED",
    ).length;
    const itemsFound = state.items.filter(
      (i) => i.type === "FOUND" && i.status !== "RETURNED",
    ).length;
    const possibleMatches = state.matches.filter((m) => m.status === "POSSIBLE").length;
    const returned = state.matches.filter((m) => m.status === "RETURNED").length;
    const totalCases = state.matches.length;
    return {
      activeLost,
      itemsFound,
      possibleMatches,
      returned,
      totalCases,
      successRate: totalCases === 0 ? 0 : Math.round((returned / totalCases) * 100),
    };
  }, [state]);

  const getItem = useCallback((id: string) => state.items.find((i) => i.id === id), [state.items]);

  const reportItem = useCallback(
    (input: ReportInput): ReportResult => {
      const item: Item = {
        ...input,
        id: uid("item"),
        status: "OPEN",
        createdAt: new Date().toISOString(),
      };

      const counterparts = state.items.filter(
        (i) => i.type !== item.type && i.status !== "RETURNED",
      );
      const alreadyPaired = new Set(state.matches.flatMap((m) => [m.lostItemId, m.foundItemId]));

      const newMatches: MatchCase[] = [];
      let bestScore = 0;

      for (const other of counterparts) {
        const lost = item.type === "LOST" ? item : other;
        const found = item.type === "FOUND" ? item : other;
        const score = calculateMatchScore(lost, found);
        if (score > bestScore) bestScore = score;
        if (score >= MATCH_THRESHOLD && !alreadyPaired.has(other.id)) {
          newMatches.push({
            id: uid("case"),
            lostItemId: lost.id,
            foundItemId: found.id,
            matchScore: score,
            status: "POSSIBLE",
            createdAt: new Date().toISOString(),
          });
          alreadyPaired.add(other.id);
        }
      }

      const matchedIds = new Set(newMatches.flatMap((m) => [m.lostItemId, m.foundItemId]));
      const at = new Date().toISOString();
      const events: ActivityEvent[] = [
        {
          id: uid("act"),
          kind: "REPORT",
          message: `${item.type === "LOST" ? "Lost" : "Found"} item reported: ${item.title} at ${item.location}`,
          at,
        },
        ...newMatches.map((m) => ({
          id: uid("act"),
          kind: "MATCH" as const,
          message: `Smart match found: ${item.title} paired at ${m.matchScore}% confidence`,
          at,
        })),
      ];

      setState((prev) => {
        if (prev.items.some((i) => i.id === item.id)) return prev;
        return {
          items: [...prev.items, item].map((i) =>
            matchedIds.has(i.id) && i.status === "OPEN" ? { ...i, status: "MATCHED" as const } : i,
          ),
          matches: [...prev.matches, ...newMatches],
          activity: [...events, ...prev.activity],
        };
      });

      return { item, newMatches, bestScore };
    },
    [state.items, state.matches],
  );


  const confirmMatch = useCallback(
    (matchId: string) => {
      const match = state.matches.find((m) => m.id === matchId);
      if (!match) return { ok: false, message: "Match not found." };
      if (match.status === "RETURNED") return { ok: false, message: "Already returned." };
      if (match.status === "CONFIRMED") return { ok: false, message: "Match already confirmed." };

      setState((prev) => ({
        ...prev,
        matches: prev.matches.map((m) =>
          m.id === matchId ? { ...m, status: "CONFIRMED" as const } : m,
        ),
        activity: [
          {
            id: uid("act"),
            kind: "CONFIRM" as const,
            message: `Match confirmed (${match.matchScore}% confidence)`,
            at: new Date().toISOString(),
          },
          ...prev.activity,
        ],
      }));
      return { ok: true, message: "Match confirmed. Contact details unlocked." };
    },
    [state.matches],
  );

  const markReturned = useCallback(
    (matchId: string) => {
      const match = state.matches.find((m) => m.id === matchId);
      if (!match) return { ok: false, message: "Match not found." };
      if (match.status === "RETURNED") return { ok: false, message: "Already returned." };

      const at = new Date().toISOString();
      const lost = state.items.find((i) => i.id === match.lostItemId);

      setState((prev) => {
        const current = prev.matches.find((m) => m.id === matchId);
        if (!current || current.status === "RETURNED") return prev;
        return {
          items: prev.items.map((i) =>
            i.id === match.lostItemId || i.id === match.foundItemId
              ? { ...i, status: "RETURNED" as const }
              : i,
          ),
          matches: prev.matches.map((m) =>
            m.id === matchId ? { ...m, status: "RETURNED" as const, returnedAt: at } : m,
          ),
          activity: [
            {
              id: uid("act"),
              kind: "RETURN" as const,
              message: `Returned to owner: ${lost?.title ?? "Item"} ✓`,
              at,
            },
            ...prev.activity,
          ],
        };
      });

      return { ok: true, message: "Item returned to its owner. Case closed." };
    },
    [state.matches, state.items],
  );


  const resetDemo = useCallback(() => setState(seed()), []);

  const value = useMemo<Store>(
    () => ({ ...state, stats, getItem, reportItem, confirmMatch, markReturned, resetDemo }),
    [state, stats, getItem, reportItem, confirmMatch, markReturned, resetDemo],
  );

  return <CampusFindContext.Provider value={value}>{children}</CampusFindContext.Provider>;
}

export function useCampusFind(): Store {
  const ctx = useContext(CampusFindContext);
  if (!ctx) throw new Error("useCampusFind must be used inside CampusFindProvider");
  return ctx;
}
