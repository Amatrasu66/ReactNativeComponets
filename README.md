# ReactNativeComponents

A React Native component library. Each component family gets its own Expo
project for development and demo purposes. Component variations live as plain
source folders inside that Expo project — they are NOT separate Expo projects.

## Architecture

```text
ReactNativeComponents/
├── .git/               # ONLY Git repository
├── .gitignore          # repository-wide ignore rules
├── README.md
├── LICENSE
├── AGENTS.md           # repository architecture rules
│
└── loader/             # ONE Expo project (manually created, do not recreate)
    ├── app.json
    ├── package.json
    ├── src/
    │   └── app/
    │       ├── _layout.tsx   # root Stack layout
    │       ├── index.tsx     # component gallery (/)
    │       └── v1.tsx        # V1 demo screen (/v1)
    │
    └── v1/                 # V1 component (plain folder, NOT an Expo project)
        ├── GlowingLoader.tsx
        └── index.ts
```

## Rules

- `ReactNativeComponents` is the ONLY Git repository. Never create a nested
  Git repository inside `loader/` (no `loader/.git`).
- `loader` is ONE Expo project. It was created manually and must NOT be
  recreated, reinitialized, or replaced.
- `loader/v1` is NOT an Expo project. Future `v2`/`v3` variations are also NOT
  separate Expo projects — they are plain folders under `loader/`.
- Future component families (for example `progress-bar`, `button`) each get
  their own Expo project. Do not create them until requested.
- No root `package.json`. No root `node_modules`. No workspaces or monorepo
  tooling.
- No Skia dependency in `loader`.
- Expo Router routes live in `loader/src/app/`. Routes: `/` (gallery),
  `/v1` (V1 demo). There is no `/explore` route.

## Development

All commands run from `loader/`:

```bash
cd loader
npm install
npx expo-doctor
npm run typecheck
npm run lint
npx expo export --platform web
npx expo start
```

## V1 status

`loader/v1/GlowingLoader.tsx` is currently a minimal placeholder. The real
implementation will be added later. Do not invent old SVG paths. Do not use
Skia.
