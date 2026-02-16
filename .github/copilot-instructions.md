# GitHub Copilot Repository Instructions

## Project Overview

Pearson Nexus AI is a **monorepo** hosting multiple AI-powered personal and business management applications. The primary deployment target is Railway, which serves the `apps/web` application built with Vite, React, TypeScript, and Express.

## Repository Structure

- **`apps/web`**: Main application deployed to Railway (Vite/React frontend + Express backend)
- **`apps/pearson_nexus_ai_new`**: Imported codebase kept side-by-side
- **`apps/legacy-project`**: Older server code kept for reference
- **`packages/*`**: Future shared packages (npm workspaces)

## Technology Stack

### Frontend
- **React 19.2** with TypeScript
- **Vite 7.2** for build tooling
- **Tailwind CSS 4** with PostCSS
- **Supabase** for authentication and database
- **IndexedDB (idb)** for offline storage
- Service Worker for PWA capabilities

### Backend
- **Express 5.2** server
- **Node.js 20-22** (specified in engines)
- Document and speech processing providers
- API routes under `/api/*`

### Development Tools
- **ESLint** with TypeScript and React plugins
- **Vitest** for testing
- **npm workspaces** for monorepo management

## Coding Standards

### TypeScript
- Use TypeScript for all new code (`.ts` and `.tsx` files)
- Enable strict type checking
- Use path aliases: `@/*` maps to `src/*` in apps/web
- Use ES6+ syntax and modern JavaScript features
- Prefer `const` over `let`, avoid `var`

### React
- Use functional components with hooks
- Follow React 19 best practices
- Use descriptive component names in PascalCase
- Keep components focused and modular
- Place reusable components in `src/components/`
- Page components go in `src/pages/`

### File Organization
- Use consistent file naming:
  - Components: `ComponentName.tsx`
  - Utilities: `utilityName.ts`
  - Types: `types.ts` or `ComponentName.types.ts`
- Group related files in feature directories
- Keep server code separate in `server/` directory

### Naming Conventions
- **Components**: PascalCase (e.g., `BigTile`, `SyncButton`)
- **Functions/variables**: camelCase (e.g., `correlationId`, `requireAuth`)
- **Constants**: UPPER_SNAKE_CASE for environment variables (e.g., `SYNC_SHARED_SECRET`)
- **Files**: Match the primary export name

### Code Style
- Use meaningful, descriptive names
- Avoid unnecessary comments; write self-documenting code
- Use template literals for string interpolation
- Prefer arrow functions for callbacks
- Use optional chaining (`?.`) and nullish coalescing (`??`) where appropriate

## Build and Test

### Development
```bash
npm install          # Install dependencies from root
npm run dev          # Start Vite dev server (apps/web)
```

### Building
```bash
npm run build        # Build apps/web for production
```

### Testing
```bash
npm run test         # Run Vitest tests in apps/web
```

### Linting
```bash
npm run lint         # Run ESLint on apps/web
```

All code must pass linting before committing. Fix ESLint errors and warnings.

## Deployment

### Railway Configuration
- Deploys are pinned to `apps/web` via root `Dockerfile`
- Build: Multi-stage Docker build (Node 20 Alpine)
- Runtime: Express server serves built frontend from `dist/` and handles `/api/*` routes
- `railway.toml` enforces `DOCKERFILE` builder and triggers deploys only for:
  - Changes to `apps/web/**`
  - Changes to Dockerfile, package.json, or other workspace files

### Environment Variables
Required for Supabase integration:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Optional for sync authentication:
- `SYNC_SHARED_SECRET` (protects `/api/sync` endpoint)

Copy `apps/web/.env.example` to `apps/web/.env` for local development.

## Architecture Patterns

### State Management
- Use React hooks (`useState`, `useEffect`, etc.)
- Zustand store in `src/state/store.ts` for global state
- Avoid prop drilling; use context or store for deeply nested data

### API Routes
- All backend API routes are under `/api/*`
- Use Express middleware for authentication and request validation
- Place API handlers in `apps/web/scripts/start.mjs` or extract to `server/routing/`

### Offline-First PWA
- Mobile capture screen at `/m` route
- Service Worker caches app shell and assets
- IndexedDB queue for offline operations
- Manual sync via `POST /api/sync`

### Document & Speech Processing
- Provider abstraction pattern in `server/providers/`
- Implement `IDocumentExtractor` or `ISpeechTranscriber` interfaces
- Superagent integration for enhanced AI processing

## Security Practices

- **Never commit secrets** or credentials to source control
- Use environment variables for all sensitive configuration
- Validate and sanitize all user inputs
- Use bearer token authentication for protected endpoints
- Set appropriate CORS headers
- Use `no-store` cache headers for sensitive endpoints

## Third-Party Dependencies

### Adding Dependencies
- Install in the appropriate workspace: `npm install -w apps/web <package>`
- Prefer stable, well-maintained packages
- Check bundle size impact for frontend dependencies
- Update `package.json` engines if requiring specific Node versions

### Preferred Libraries
- **UI**: Use existing Tailwind utilities and custom `ui.tsx` components
- **HTTP**: Native `fetch` API for client, Express for server
- **Database**: Supabase client (`@supabase/supabase-js`)
- **Offline**: `idb` for IndexedDB operations
- **Validation**: Zod for schema validation

## Git Workflow

- Work on feature branches, not `main`
- Use meaningful commit messages
- Keep commits focused and atomic
- PR descriptions should explain the "why" behind changes

## Monorepo Guidelines

- Changes to `apps/web` trigger Railway deploys
- Changes to other apps do not affect production deployment
- Workspace scripts run from repo root: `npm run <script>` or `npm -w <workspace> run <script>`
- Shared code should eventually move to `packages/*`

## Testing Requirements

- Write tests for new features and bug fixes
- Place tests alongside source files or in `__tests__` directories
- Use Vitest for unit and integration tests
- Mock external dependencies (Supabase, APIs)
- Aim for clear, readable test descriptions

## Accessibility

- Use semantic HTML elements
- Provide appropriate ARIA labels where needed
- Ensure keyboard navigation works for interactive elements
- Test responsive design on mobile and desktop viewports

## Performance

- Lazy load routes and heavy components
- Optimize images and assets
- Use code splitting for large dependencies
- Monitor bundle size with build output
- Cache static assets appropriately

## Documentation

- Update README.md for significant architectural changes
- Document complex business logic with inline comments
- Keep environment variable documentation current
- Document API endpoints and their expected payloads

## Troubleshooting Common Issues

### Port Conflicts
- Dev server uses strict port 5199 (apps/web) or 5173 (fallback)
- Change ports in `vite.config.ts` if needed

### Build Failures
- Check Node version (must be 20-22)
- Clear `node_modules` and reinstall if dependency issues occur
- Verify environment variables are set correctly

### TypeScript Errors
- Run `npm run build` to catch type errors
- Check `tsconfig.json` for path mapping issues
- Ensure imports use correct paths with `@/*` alias

## Additional Notes

- This is a personal/business management platform with modular features
- Business modules are registered in `src/biz/registry.ts`
- Personal modules include Documents, Finances, Health, Legal, etc.
- Mobile-first PWA at `/m` route for quick capture (photo/voice/text)
- Offline sync queue managed via IndexedDB with background sync support
