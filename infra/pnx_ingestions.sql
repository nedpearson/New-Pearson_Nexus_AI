-- Minimal canonical schema for ingestion results (Supabase/Postgres)
-- Create once in Supabase SQL editor.

create table if not exists public.pnx_ingestions (
  id text primary key,
  correlationId text not null,
  receivedAt timestamptz not null default now(),
  source text not null,
  type text not null,
  hash text not null unique,
  filename text,
  mimeType text,
  sizeBytes bigint,
  extracted jsonb not null,
  transcript text,
  transcriptConfidence double precision,
  routing jsonb not null,
  status text not null,
  audit jsonb not null
);

-- Optional helpful index for review queue
create index if not exists pnx_ingestions_status_idx on public.pnx_ingestions (status);

