# loader — Loader component family (Expo project)

This is the ONE Expo project for the **loader** component family of the
`ReactNativeComponents` library. It hosts development and demo screens for
each loader variation. See the repository-root `README.md` and `AGENTS.md`
for the full architecture.

## Layout

```text
loader/
├── v1/
│   ├── GlowingLoader.tsx   # V1 component (placeholder for now)
│   └── index.ts            # barrel: export * from './GlowingLoader'
└── src/
    └── app/
        ├── _layout.tsx     # root Stack layout
        ├── index.tsx       # component gallery (/)
        └── v1.tsx          # V1 demo screen (/v1)
```

- `v1/` is a plain source folder, NOT an Expo project. Future `v2`/`v3`
  variations follow the same pattern (plain folders, not projects).
- Routes: `/` (gallery), `/v1` (V1 demo). There is no `/explore` route.
- The V1 component is currently a minimal placeholder. Do not use Skia.

## Commands (run from `loader/`)

```bash
npm install
npx expo-doctor
npm run typecheck
npm run lint
npx expo export --platform web
npx expo start
```

See `AGENTS.md` in this folder for Expo app conventions (SDK versions,
`npx expo install`, Expo Router, EAS builds).
