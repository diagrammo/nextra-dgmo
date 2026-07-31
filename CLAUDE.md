# nextra-dgmo

Nextra 4 (Next.js **app router**) wrapper around `remark-dgmo`, and a deliberate near-clone of `fumadocs-dgmo` — `config.ts`, the client component and `scripts/build-css.mjs` differ only in nesting depth and package self-reference. Change one, check the other.

Two-step install: `nextra(withDgmo(nextraOptions, { dgmo }))` in `next.config.mjs`, plus `<DgmoClient />` from `nextra-dgmo/client` in `app/layout.tsx`.

Shared wrapper contract: [`../remark-dgmo/WRAPPER-CONVENTIONS.md`](../remark-dgmo/WRAPPER-CONVENTIONS.md). `remark-dgmo` lands on npm before this ships — order is in the workspace CLAUDE.md.

## Versions — read `package.json`

- `remark-dgmo` `^0.10.0` (astro-dgmo is on `^0.11.0`; this one has not moved)
- peers: `@diagrammo/dgmo` `>=0.45.0 <1`, `nextra` `^4.0.0`, `next` `^15 || ^16`, `react` `^19`
- Caret on a `0.x` dep pins the **minor** — a `remark-dgmo` minor needs an explicit bump here

## Host specifics

- **Nextra nests the pipeline one level deeper than Fumadocs**: `nextraConfig.mdxOptions.remarkPlugins`, not top-level `remarkPlugins`. That single difference is why `withDgmo` isn't shared code. Idempotent, and preserves the `(defaults) => [...]` function form.
- **`withDgmo` defaults remark-dgmo's `mdx: true`** — Nextra routes through `@mdx-js/mdx`, which rejects raw `html` nodes (`Cannot handle unknown node "raw"`).
- 🔴 **Turbopack is unsupported, for consumers too.** `withDgmo` injects a function-valued remark plugin and Turbopack can't serialize it — `next dev`/`next build` need `--webpack`. This is a real product constraint (the README leads with it), unlike fumadocs-dgmo's Turbopack note, which is only a fixture `link:`-resolution quirk.
- `nextra-client.tsx` calls `bindDgmo()` in a `useEffect` keyed on `usePathname()` — the app router doesn't refire `DOMContentLoaded` on soft navigation — and side-effect-imports `nextra-dgmo/client.css` through this package's own exports map, so consumers need no `@import`.
- **`dist/client.css` is generated, never hand-edited.** `scripts/build-css.mjs` uses `adaptClientCssToClassToggle` from `remark-dgmo/client-css` to rewrite `[data-theme="dark"]` → `html.dark` for Nextra's next-themes default.
- Server/client split matches the others: `src/index.ts` stays config-side, React lives behind `./client`.

## Verify

🔴 **This is the only wrapper with no e2e in CI.** `scripts/assert-build-output.mjs` exists and is written, but there is no `test:e2e` script in `package.json` and no fixture-build step in `ci.yml` — CI stops at `check:all` / build / typecheck / unit tests. The de facto build check is `pages.yml`, which composes dgmo-content's all-chart-types page into the fixture and runs `next build --webpack`. Wiring `test:e2e` the way the other three do is the obvious gap to close.

Locally: `pnpm build`, then `cd tests/fixture && pnpm install --no-frozen-lockfile && pnpm dev`, open `/docs/diagrams`.
