export type ItemType = "LOST" | "FOUND";
export type ItemStatus = "OPEN" | "MATCHED" | "RETURNED";
export type MatchStatus = "POSSIBLE" | "CONFIRMED" | "RETURNED";

export const CATEGORIES = [
  "ID Card",
  "Wallet",
  "Mobile",
  "Books",
  "Keys",
  "Bag",
  "Earphones",
  "Water Bottle",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface Item {
  id: string;
  type: ItemType;
  title: string;
  category: string;
  description: string;
  location: string;
  date: string;
  contactName: string;
  contactInfo: string;
  status: ItemStatus;
  createdAt: string;
}

export interface MatchCase {
  id: string;
  lostItemId: string;
  foundItemId: string;
  matchScore: number;
  status: MatchStatus;
  createdAt: string;
  returnedAt?: string;
}

export interface ActivityEvent {
  id: string;
  kind: "REPORT" | "MATCH" | "RETURN" | "CONFIRM";
  message: string;
  at: string;
}
