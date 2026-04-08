# Architecture

This repo now treats the frontend as a thin app shell over a backend-owned domain layer.

## Layers

- `src/features/<domain>`: Domain APIs, types, hooks, and feature-scoped components.
- `src/lib`: Thin cross-cutting helpers that are still frontend-owned, such as shared time/date helpers.
- `src/config`: Validated environment loaders (`env.server`, `env.client`).
- `src/app`: Next.js routes and top-level layout; keep pages thin and delegate logic to features.
- `src/components`: UI atoms/molecules and global layout pieces.
- `src/schemas`: Reusable Zod schemas for shared form validation.

## Backend Boundary

- Database models, DB connections, and server-only helpers now live in the backend.
- Frontend code should call backend routes through `src/app/api/*` proxies or feature API helpers.
- Do not reintroduce frontend MongoDB models, direct DB connections, or backend-only upload logic unless a file is explicitly meant to be server-side route plumbing.

## Environment

- Server-only secrets live in `src/config/env.server.ts`; client-safe vars in `src/config/env.client.ts`.
- Add new vars to `.env.example` and the appropriate schema. Server modules must never import client env and vice versa.

## Data fetching

- Use the backend-proxy route handlers in `src/app/api/*` for authenticated calls that need server-side session access.
- Use feature-local fetch helpers or React Query for client data access.
- Use React Query for server state: `QueryClientProvider` is wired in `src/components/Providers.tsx`.
- Co-locate API calls per feature (see `src/features/auctions/api.ts`) and expose typed DTOs.

## Adding a feature

1. Create `src/features/<name>/types.ts` for DTOs and `api.ts` for network calls.
2. Build hooks/components inside the feature folder; export the minimal surface needed by pages.
3. Keep pages/layouts thin: import hooks/components from the feature instead of writing logic inline.
4. Put shared form validation in `src/schemas` instead of duplicating `z.object(...)` in pages.

## Quality gates

- Scripts: `npm run lint`, `npm run typecheck`, `npm run format:check`, `npm run ci`.
- Formatter: Prettier config at `.prettierrc`; ignore list in `.prettierignore`.
