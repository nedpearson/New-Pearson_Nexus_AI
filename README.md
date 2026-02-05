## Pearson Nexus AI (monorepo)

This repo is a **monorepo** that hosts multiple Nexus AI codebases while keeping Railway deployments stable.

### Repo layout

- **`apps/web`**: the app Railway should deploy (Vite/React)
- **`apps/pearson_nexus_ai_new`**: imported codebase kept side-by-side
- **`apps/legacy-project`**: older server bits kept for reference
- **`packages/*`**: future shared packages

### Local dev

From repo root:

```bash
npm install
npm run dev
```

### Railway deployment (guardrails)

Deploys are pinned to **`apps/web`** via:

- **Root `Dockerfile`**: builds `apps/web` and runs the Express server (`/api/*`) + serves `dist/`
- **`railway.toml`**: forces `DOCKERFILE` builder and only triggers deploys when `apps/web/**` (or Docker/workspace files) change

### Supabase environment variables

Canonical names:

```txt
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

Copy `apps/web/.env.example` to `apps/web/.env` and fill in your values.

If you use Supabase OAuth providers, also set redirect URLs in Supabase Dashboard:
- **Site URL**: `https://YOUR-RAILWAY-DOMAIN`
- **Additional Redirect URLs**: `https://YOUR-RAILWAY-DOMAIN/**`

### Mobile capture PWA (`/m`) + offline sync (prototype)

The app includes a **mobile-first capture screen** at **`/m`**:

- Installable PWA (Add to Home Screen)
- Works offline after first visit (service worker caches the app shell + Vite assets)
- Offline queue stored in IndexedDB
- Manual Sync button (desktop + mobile)

#### Railway: secure sync with `SYNC_SHARED_SECRET`

`POST /api/sync` can be gated by a shared secret:

- Set **Railway → Variables → `SYNC_SHARED_SECRET`** to a strong random value
- On each device, paste that same value into:
  - Desktop: **Admin → Integrations → Offline Sync**
  - Mobile: `/m` → **Sync Settings**

Notes:
- This is a **prototype auth** mechanism (shared secret). Use Supabase/Auth for per-user auth later.
- If `SYNC_SHARED_SECRET` is **not** set, `/api/sync` accepts requests without auth (dev-friendly).
