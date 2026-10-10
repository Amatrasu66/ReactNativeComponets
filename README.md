# ReactNativeComponents

A React Native component library built on a SINGLE Expo application at the
repository root. Component families live as plain source folders that all share
the same Expo installation, `package.json`, `node_modules`, and assets where
appropriate — they are NOT separate Expo projects.

## Architecture

```text
ReactNativeComponents/
├── .git/               # ONLY Git repository
├── package.json        # single Expo app manifest (do NOT recreate)
├── package-lock.json   # single lockfile (matches package.json)
├── app.json            # single Expo config
├── tsconfig.json / eslint.config.js
├── node_modules/       # single dependency tree
├── .expo/              # single Expo cache/types
├── assets/             # shared Expo assets
├── .gitignore          # single merged ignore file
├── README.md
├── LICENSE
├── AGENTS.md           # repository architecture rules
│
├── src/
│   └── app/
│       ├── _layout.tsx   # root Stack layout (index, index-v2, v1, v2)
│       ├── index.tsx     # V1 showcase (/)
│       ├── index-v2.tsx  # V2 showcase (/index-v2)
│       ├── v1.tsx        # V1 demo screen (/v1)
│       └── v2.tsx        # V2 demo screen (/v2)
│
└── loaders/            # loader component family (plain folder, NOT Expo)
    ├── v1/             # V1 component (frozen, plain folder, NOT Expo)
    │   ├── GlowingLoader.tsx
    │   └── index.ts
    └── v2/             # V2 component (plain folder, NOT Expo)
        ├── ThinkingOrbsLoader.tsx
        └── index.ts
```

Future categories and versions follow the same pattern and share the same installation:

```text
loaders/v3, ...
progress-bars/v1, ...
buttons/v1, ...
inputs/...
```

Do NOT create them until requested. Every new version gets a separate folder and showcase without overwriting older versions.

## Rules

- `ReactNativeComponents` is the ONLY Git repository. Never create a nested
  Git repository (no `loader/.git`, no `loaders/.git`).
- The repository root IS the ONE Expo application (promoted from `loader/`).
  It was created manually and must NOT be recreated, reinitialized, or
  replaced. Never run `create-expo-app` in this repo.
- Never create nested Expo projects, package manifests, lockfiles, node_modules,
  or Git repositories.
- `loaders/v1` and `loaders/v2` are NOT Expo projects. Future variations and future
  families (`progress-bars`, `buttons`, `inputs`) are also NOT separate Expo
  projects — they are plain folders sharing the root installation.
- One `package.json`. One `package-lock.json`. One `node_modules/`. No
  workspaces or monorepo tooling.
- Separate component implementations (in `loaders/`, etc.) from route/showcase screens (in `src/app/`).
- No Skia dependency.
- Expo Router routes live in `src/app/`. Routes: `/` (V1 showcase),
  `/index-v2` (V2 showcase), `/v1` (V1 isolated demo), `/v2` (V2 isolated demo).
  There is no `/explore` route.

## Development

All commands run from the repository root:

```bash
npm install
npx expo-doctor
npm run typecheck
npm run lint
npx expo export --platform web
npx expo start
```

## Versioning and V1 status
 
- `loaders/v1/GlowingLoader.tsx` is the frozen V1 implementation. Preserve it
  exactly — do not refactor, redesign, or change its behavior. Do not invent old
  SVG paths. Do not use Skia.
- Every new version gets a separate folder (`loaders/v2/`, etc.) and a separate
  showcase (`src/app/index-v2.tsx`), without overwriting older versions.

