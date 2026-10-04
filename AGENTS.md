# AGENTS.md — ReactNativeComponents (repository root)

This file defines the repository architecture. Follow it strictly.
`loader/AGENTS.md` covers Expo app conventions; this file covers repo structure.

## Repository

- `ReactNativeComponents` is the ONLY Git repository.
- NEVER create `loader/.git` or any nested Git repository.
- NEVER create a root `package.json` or root `node_modules`.
- NEVER introduce workspaces or monorepo tooling.
- NEVER commit, push, or add a remote unless explicitly requested.

## Expo project ownership

- The Expo project in `loader/` was created manually by the owner.
- NEVER create, initialize, recreate, or replace the Expo project.
- NEVER run `create-expo-app`, `npx create-expo-app`, or equivalent in this repo.

## Layout

```text
ReactNativeComponents/
├── .gitignore / README.md / LICENSE / AGENTS.md   # repo-level only
└── loader/                                          # ONE Expo project
    ├── v1/GlowingLoader.tsx + v1/index.ts           # plain folder, NOT Expo
    └── src/app/_layout.tsx, index.tsx, v1.tsx       # Expo Router routes
```

- `loader/v1` is NOT an Expo project (no `package.json`, no `app.json`).
- Future `loader/v2`, `loader/v3` are also plain folders, NOT Expo projects.
  Do NOT create them until requested.
- Future component families (`progress-bar`, `button`) each get their own
  Expo project. Do NOT create them until requested.

## Expo Router

- Routes live in `loader/src/app/`. Every file there is a screen.
- Required routes: `src/app/_layout.tsx`, `src/app/index.tsx` (`/` gallery),
  `src/app/v1.tsx` (`/v1` demo).
- There is NO `/explore` route. Do NOT create `src/app/explore.tsx`.
- Keep non-route code outside `src/app/` (for example `loader/v1/`).
- Keep demo UI minimal.

## V1 component

- `loader/v1/GlowingLoader.tsx` is a minimal placeholder for now.
- `loader/v1/index.ts` must contain `export * from './GlowingLoader';`.
- Do NOT invent old SVG paths. Do NOT use Skia. No `skia` dependency.

## .gitignore split

- Root `.gitignore`: generic rules (`node_modules/`, `dist/`, `build/`,
  `coverage/`, `.env` files, logs, OS files, editor files, `*.tsbuildinfo`,
  `*.tmp`).
- `loader/.gitignore`: Expo/React Native generated files only (`.expo/`,
  `expo-env.d.ts`, `web-build/`, `/android`, `/ios`, Metro cache, native
  signing files). Avoid duplicating root rules.

## Verification (run from `loader/`)

```bash
npm install
npx expo-doctor
npm run typecheck
npm run lint
npx expo export --platform web
```

Expected: no `loader/.git`, no root `package.json`, no root `node_modules`,
no Skia dependency, `/` exists, `/v1` exists, no `/explore` route,
`loader/v1/GlowingLoader.tsx` exists.
