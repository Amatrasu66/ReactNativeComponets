# AGENTS.md — ReactNativeComponents (repository root + single Expo app)

This file defines the repository architecture. Follow it strictly.
The repository root IS the single Expo application. There is no nested Expo project.

## Repository

- `ReactNativeComponents` is the ONLY Git repository.
- NEVER create a nested `.git` (no `loader/.git`, no `loaders/.git`).
- NEVER introduce workspaces or monorepo tooling.
- NEVER commit, push, or add a remote unless explicitly requested.

## Expo project ownership (ONE Expo application)

- The repository root IS the ONE Expo application (promoted from `loader/`).
- NEVER create, initialize, recreate, or replace the Expo project.
- NEVER run `create-expo-app`, `npx create-expo-app`, or equivalent in this repo.
- There is exactly one `package.json`, one `package-lock.json`, one
  `node_modules/`, one `.expo/`, one `app.json` — all at the root.
- NEVER create a nested Expo project (no `loader/` Expo app, no per-component
  Expo apps).
- Do NOT reinstall dependencies unnecessarily; the single root dependency tree
  is authoritative.

## Layout

```text
ReactNativeComponents/
├── .git/                    # ONLY Git repository
├── package.json / package-lock.json / app.json / tsconfig.json / eslint.config.js
├── node_modules/ / .expo/ / assets/
├── src/
│   └── app/
│       ├── _layout.tsx      # root Stack layout
│       ├── index.tsx        # component gallery (/)
│       └── v1.tsx           # V1 demo screen (/v1)
├── loaders/
│   └── v1/                  # V1 component (plain folder, NOT Expo)
│       ├── GlowingLoader.tsx
│       └── index.ts
├── README.md / LICENSE / AGENTS.md
└── ...                      # future: loaders/v2, progress-bars/, buttons/
```

- `loaders/v1` is NOT an Expo project (no `package.json`, no `app.json`).
- Future `loaders/v2`, `loaders/v3` are also plain folders, NOT Expo projects.
  Do NOT create them until requested.
- Future component families (`progress-bars/`, `buttons/`, `inputs/`) are plain
  folders sharing the SAME root Expo installation, `package.json`,
  `node_modules`, and assets where appropriate. Do NOT create them until
  requested.
- There is NO `loader/` directory. Do NOT recreate it.

## Expo Router

- Routes live in `src/app/`. Every file there is a screen.
- Required routes: `src/app/_layout.tsx`, `src/app/index.tsx` (`/` gallery),
  `src/app/v1.tsx` (`/v1` demo).
- There is NO `/explore` route. Do NOT create `src/app/explore.tsx`.
- Keep non-route code outside `src/app/` (for example `loaders/v1/`).
- Keep demo UI minimal.

## V1 component

- `loaders/v1/GlowingLoader.tsx` is the working V1 implementation. Preserve it
  exactly; do not refactor, redesign, or change its behavior.
- `loaders/v1/index.ts` must contain `export * from './GlowingLoader';`.
- Do NOT invent old SVG paths. Do NOT use Skia. No `skia` dependency.
- Only update imports if a move requires path changes.

## .gitignore (single, at root)

- Single root `.gitignore` covers generic rules (`node_modules/`, `dist/`,
  `build/`, `coverage/`, `.env` files, logs, OS files, editor files,
  `*.tsbuildinfo`, `*.tmp`) PLUS Expo/React Native generated files (`.expo/`,
  `expo-env.d.ts`, `web-build/`, `/android`, `/ios`, Metro cache, native
  signing files).
- There is NO nested Expo `.gitignore`. Do NOT create `loader/.gitignore`.

## Expo conventions

This is an Expo/React Native mobile application. Prioritize mobile-first
patterns, performance, and cross-platform compatibility.

Expo ships breaking changes every SDK release. APIs you remember are likely
renamed, moved, or removed. Before writing any code that touches an Expo, EAS,
or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all
   Expo docs with corrections to common LLM misconceptions. Follow its links
   to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file
  there is a screen, `_layout.tsx` files define navigators. Keep non-route code
  (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`,
`eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode
or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun
projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare
`eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated
  (Continuous Native Generation). Never create or edit them by hand — configure
  native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with
  native code, the app needs a development build: `npx expo run:ios|android`
  locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your
  available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md

## Verification (run from root)

```bash
npm install
npx expo-doctor
npm run typecheck
npm run lint
npx expo export --platform web
```

Expected: no `loader/` directory, no nested `.git`, exactly one root
`package.json`, one root `node_modules/`, no Skia dependency, `/` exists,
`/v1` exists, no `/explore` route, `loaders/v1/GlowingLoader.tsx` exists.
