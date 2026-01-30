# Long-term learning & ingestion (architecture principles)

## Learning loop (per user/org)
- Every auto-category and recommendation is a draft.
- User can approve/correct.
- The system stores:
  - chosen category/subcategory
  - why it was chosen
  - outcome (accepted/dismissed/edited)
- Use this feedback to improve future suggestions.

## Ingestion sources (keep vendor-neutral)
- Files uploaded directly
- Mobile capture (photo/video)
- Voice notes -> transcripts
- Optional email ingestion (later)
- Optional web research ingestion (later)

## Ingestion pipeline invariant
1) Create Document record (status needs_review)
2) Extract metadata + text (where possible)
3) Suggest categories + tags
4) User approves
5) Link to domain objects as proof
