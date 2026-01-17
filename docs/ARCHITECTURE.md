# Architecture

This repo organizes UI and domain logic into feature modules with shared infrastructure.

## Layers

- `src/features/<domain>`: Domain APIs, types, hooks, and feature-scoped components.
- `src/lib`: Cross-cutting utilities (HTTP client, sockets, DB, pusher, etc.).
- `src/config`: Validated environment loaders (`env.server`, `env.client`).
- `src/app`: Next.js routes and top-level layout; keep pages thin and delegate to features.
- `src/components`: UI atoms/molecules and global layout pieces.

## Environment

- Server-only secrets live in `src/config/env.server.ts`; client-safe vars in `src/config/env.client.ts`.
- Add new vars to `.env.example` and the appropriate schema. Server modules must never import client env and vice versa.

## Data fetching

- Use `src/lib/http.ts` (axios) for HTTP calls; configure auth headers via `setAuthToken`.
- Use React Query for server state: `QueryClientProvider` is wired in `src/components/Providers.tsx`.
- Co-locate API calls per feature (see `src/features/auctions/api.ts`) and expose typed DTOs.

## Adding a feature

1. Create `src/features/<name>/types.ts` for DTOs and `api.ts` for network calls.
2. Build hooks/components inside the feature folder; export the minimal surface needed by pages.
3. Keep pages/layouts thin: import hooks/components from the feature instead of writing logic inline.

## Quality gates

- Scripts: `npm run lint`, `npm run typecheck`, `npm run format:check`, `npm run ci`.
- Formatter: Prettier config at `.prettierrc`; ignore list in `.prettierignore`.
