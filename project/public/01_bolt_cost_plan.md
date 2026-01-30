# Bolt cost plan (estimates + how to keep it cheap)

## How Bolt spends tokens
Bolt usage is token-based, and large projects cost more per message because Bolt reads and syncs project files. citeturn4search0  
Bolt’s billing examples show a **10M monthly plan** and a **26M monthly plan**, with example pricing at **$25** and **$50** respectively (example in Bolt support docs). citeturn4search2

## Strategy to minimize cost
1) Keep prompts small and scoped (one feature per prompt).
2) Avoid large refactors. Freeze architecture early.
3) Use “Do not refactor unrelated files” in every prompt.
4) Build Simple View first; defer Growth/Elite modules until MVP is stable.
5) When adding a new module, add routes + UI first, then data, then logic.

## Phase-by-phase token budgeting (rough)
These are planning estimates; real usage depends on retries and project size.

- Phase 0 (Foundation): 1–3M tokens
- Phase 1 (MVP Simple View): 3–8M tokens
- Phase 2 (Business core): 5–12M tokens
- Phase 3 (QuickBooks boundary + UI): 3–8M tokens (more if integration implemented)
- Phase 4 (Funding Navigator + packets): 8–20M tokens
- Phase 5 (Advisory workflows): 8–25M tokens
- Phase 6 (Admin console): 5–12M tokens
- Phase 7 (Policy monitor automation): 5–15M tokens

## Recommended approach
- Start with a 10M plan for Phase 0–1.
- Upgrade when you begin Funding Navigator / Advisory work (those phases have the most surface area).

## What you should do first (highest ROI)
- Phase 0–1 builds a working product you can use.
- Don’t start QuickBooks/Funding/Advisory until you love the UX and proof-first flow.
