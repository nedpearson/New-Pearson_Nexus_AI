# Policy Update Monitor (weekly scanning design)

Goal: a weekly system that monitors changes and turns them into actionable cards.

## Authoritative source types (examples)
- IRS newsroom and credits/deductions pages (tax changes and guidance). citeturn1search6turn1search14
- SBA funding/loan program pages (loan program changes). citeturn1search1turn1search5
- Grants.gov opportunities and grant-program resources (federal grant postings). citeturn1search0turn1search4

## Pipeline
1) Source list (configurable)
2) Weekly scan job (scheduled)
3) Normalize into UpdateCandidate objects:
   - title, source, published date
   - summary + what changed
   - who benefits (target segments)
   - required actions + deadlines
   - submission links
4) Review Queue (admin must approve)
5) Publish:
   - personalized cards based on user profile + business structure
   - “Do this next” checklist
   - optional prefilled templates (if unlocked)

## MVP approach (cost-effective)
- Start with admin-curated sources + manual “add update” UI.
- Add automated scanning later (same pipeline, different input).
