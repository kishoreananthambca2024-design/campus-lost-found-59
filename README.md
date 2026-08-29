# CampusFind — Campus Lost & Found

## Problem Statement

On any campus, lost belongings are reported across WhatsApp groups, notice boards, and
department desks. Nobody can tell how many items are actually still missing, and the same
physical object gets counted twice — once by the person who lost it and once by the person
who found it. CampusFind gives a college one shared surface where a lost report and a found
report are bound into a **single unique case**, so the numbers on screen are always true.

## Core Architecture

- **Stack:** React + TypeScript + TanStack Start/Router, Tailwind CSS v4 design tokens,
  Lucide icons, Motion animations, canvas-confetti.
- **State:** React Context (`src/lib/campusfind/store.tsx`) persisted to `localStorage`
  under `campusfind:v1`. No external database — fully deterministic for demos.
- **Data models** (`src/lib/campusfind/types.ts`):
  - `Item { id, type: LOST|FOUND, title, category, description, location, date, contactName, contactInfo, status: OPEN|MATCHED|RETURNED }`
  - `MatchCase { id, lostItemId, foundItemId, matchScore, status: POSSIBLE|CONFIRMED|RETURNED, returnedAt? }`

### Zero double-counting rules

| Stat | Formula |
| --- | --- |
| Active Lost | `Items where type=LOST and status != RETURNED` |
| Items Found | `Items where type=FOUND and status != RETURNED` |
| Possible Matches | `MatchCases where status = POSSIBLE` |
| Successfully Returned | `MatchCases where status = RETURNED` (never items) |
| Success Rate | `Returned MatchCases / Total MatchCases × 100` |

**Return idempotency:** `markReturned(matchId)` returns `"Already returned."` when the case
is already `RETURNED`. Otherwise it sets the case to `RETURNED`, flips *both* linked items to
`RETURNED`, timestamps `returnedAt`, and fires confetti — the returned counter moves by
exactly 1, no matter how many times the button is clicked.

## Local Match Algorithm

`calculateMatchScore(lostItem, foundItem)` in `src/lib/campusfind/matching.ts`:

- **+40** identical category
- **+20** case-insensitive location substring match (either direction)
- **up to +30** keyword overlap of title + description (stop-words removed, tokens > 2 chars,
  scaled by the smaller token set)
- **+10** reported dates within 3 days

Every new report is scored against all open counterpart items. Any score **≥ 60** creates a
`MatchCase` with status `POSSIBLE` and marks both items `MATCHED`. An item already bound to a
case is never paired again, which keeps one physical object inside exactly one case.

## 2-Minute Judge Demo Script

1. **(0:00) Dashboard.** "Four live stats, all derived from one source of truth." Point to the
   animated flow: LOST ➔ SMART MATCH ➔ FOUND ➔ RETURNED. Note Success Rate = 0% of 2 cases.
2. **(0:20) Smart Matches.** Show the wallet case: Black Leather Wallet ⟷ 92% ⟷ Black Wallet,
   CS Block, same day. Open *View Match Details* to show the score breakdown.
3. **(0:45) Close a case.** Click **Mark as Returned** → confetti. Return to the Dashboard:
   Successfully Returned = 1, Active Lost and Items Found each drop by one, Success Rate 50%.
4. **(1:05) Idempotency.** Click **Mark as Returned** again → *"Already returned."* The counter
   does not move. This is the anti-double-counting guarantee.
5. **(1:25) Live matching.** Go to **Report Found**, submit "AirPods Pro case, white, Auditorium,
   Earphones, today". The success modal shows **✨ Match Found!** with the score and a shortcut.
6. **(1:50) Browse Items.** Filter by type FOUND and search "wallet" to show returned items keep
   a RETURNED tag and stay out of the active counts. Done.

## Run locally

```bash
bun install
bun run dev
```
