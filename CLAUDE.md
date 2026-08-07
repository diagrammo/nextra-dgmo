# nextra-dgmo

Nextra 4 (Next.js **app router**) wrapper around `remark-dgmo`, and a deliberate near-clone of `fumadocs-dgmo` — `config.ts`, the client component and `scripts/build-css.mjs` differ only in nesting depth and package self-reference. Change one, check the other.

Two-step install: `nextra(withDgmo(nextraOptions, { dgmo }))` in `next.config.mjs`, plus `<DgmoClient />` from `nextra-dgmo/client` in `app/layout.tsx`.

Shared wrapper contract: [`../remark-dgmo/WRAPPER-CONVENTIONS.md`](../remark-dgmo/WRAPPER-CONVENTIONS.md). `remark-dgmo` lands on npm before this ships — order is in the workspace CLAUDE.md.

## Versions — read `package.json`

- `remark-dgmo` `^0.14.0` (moved 2026-08-04 — a caret on `0.x` locks the minor, so this never happens on its own)
- peers: `@diagrammo/dgmo` `>=0.60.0 <1`, `nextra` `^4.0.0`, `next` `^15 || ^16`, `react` `^19`. The floor tracks remark-dgmo's own: 0.14.0 imports `@diagrammo/dgmo/live-link-resolve`, a subpath that first exists in dgmo 0.60.0
- `tests/fixture/` pins both **exactly** (`0.14.0` / `0.60.0`) rather than by range, so the Pages showcase can never build against a `remark-dgmo` that predates live links
- Caret on a `0.x` dep pins the **minor** — a `remark-dgmo` minor needs an explicit bump here

## Host specifics

- **Nextra nests the pipeline one level deeper than Fumadocs**: `nextraConfig.mdxOptions.remarkPlugins`, not top-level `remarkPlugins`. That single difference is why `withDgmo` isn't shared code. Idempotent, and preserves the `(defaults) => [...]` function form.
- **`withDgmo` defaults remark-dgmo's `mdx: true`** — Nextra routes through `@mdx-js/mdx`, which rejects raw `html` nodes (`Cannot handle unknown node "raw"`).
- 🔴 **Turbopack is unsupported, for consumers too.** `withDgmo` injects a function-valued remark plugin and Turbopack can't serialize it — `next dev`/`next build` need `--webpack`. This is a real product constraint (the README leads with it), unlike fumadocs-dgmo's Turbopack note, which is only a fixture `link:`-resolution quirk.
- `nextra-client.tsx` calls `bindDgmo()` in a `useEffect` keyed on `usePathname()` — the app router doesn't refire `DOMContentLoaded` on soft navigation — and side-effect-imports `nextra-dgmo/client.css` through this package's own exports map, so consumers need no `@import`.
- **`dist/client.css` is generated, never hand-edited.** `scripts/build-css.mjs` uses `adaptClientCssToClassToggle` from `remark-dgmo/client-css` to rewrite `[data-theme="dark"]` → `html.dark` for Nextra's next-themes default.
- Server/client split matches the others: `src/index.ts` stays config-side, React lives behind `./client`.

## Verify

`pnpm test:e2e` runs in CI as of **2026-08-06**, closing the gap that made this the only wrapper whose fixture CI never built. It static-exports `tests/fixture/` and runs `scripts/assert-build-output.mjs`: dual-render class names in the HTML, a `_next/static` CSS file carrying the rewritten `html.dark` selector, no jsdom sentinel in page chunks, and gzipped page JS within 100 KB of `baseline-bundle-size.json`. The script had been written but never once run; its first run passed.

⚠️ **The baseline was re-seeded (265,320 → 272,398 gzipped bytes) in the same change**, deliberately. The old number was captured 2026-07-04 against dgmo 0.60.0 and `remark-dgmo` 0.14.0 and had never gated anything, so enforcing against it would have been enforcing a stale measurement of different pins.

`pages.yml` still composes dgmo-content's all-chart-types page into the fixture and deploys it — that is a different build from the e2e one, and it stays.

Locally: `pnpm build`, then `cd tests/fixture && pnpm install --no-frozen-lockfile && pnpm dev`, open `/docs/diagrams`.
