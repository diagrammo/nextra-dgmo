# nextra-dgmo

Nextra 4 (Next.js **app router**) wrapper around `remark-dgmo`, and a deliberate near-clone of `fumadocs-dgmo` — `config.ts`, the client component and `scripts/build-css.mjs` differ only in nesting depth and package self-reference. Change one, check the other.

Two-step install: `nextra(withDgmo(nextraOptions, { dgmo }))` in `next.config.mjs`, plus `<DgmoClient />` from `nextra-dgmo/client` in `app/layout.tsx`.

Shared wrapper contract: [`../remark-dgmo/WRAPPER-CONVENTIONS.md`](../remark-dgmo/WRAPPER-CONVENTIONS.md). `remark-dgmo` lands on npm before this ships — order is in the workspace CLAUDE.md.

## Versions — read `package.json`

- `remark-dgmo` and the `@diagrammo/dgmo` peer are open `>=X <1` ranges, in step with the other four wrappers; the dgmo floor never sits below the dgmo subpaths remark-dgmo imports. Other peers: `nextra` `^4.0.0`, `next` `^15 || ^16`, `react` `^19`
- `tests/fixture/` pins both **exactly** rather than by range, so the Pages showcase can never build against an older `remark-dgmo` or renderer
- An open range never re-resolves on its own — bump ranges and fixture pins on each release and check what the lockfile resolved

## Host specifics

- **Nextra nests the pipeline one level deeper than Fumadocs**: `nextraConfig.mdxOptions.remarkPlugins`, not top-level `remarkPlugins`. That single difference is why `withDgmo` isn't shared code. Idempotent, and preserves the `(defaults) => [...]` function form.
- **`withDgmo` defaults remark-dgmo's `mdx: true`** — Nextra routes through `@mdx-js/mdx`, which rejects raw `html` nodes (`Cannot handle unknown node "raw"`).
- 🔴 **Turbopack is unsupported, for consumers too.** `withDgmo` injects a function-valued remark plugin and Turbopack can't serialize it — `next dev`/`next build` need `--webpack`. This is a real product constraint (the README leads with it), unlike fumadocs-dgmo's Turbopack note, which is only a fixture `link:`-resolution quirk.
- `nextra-client.tsx` calls `bindDgmo()` in a `useEffect` keyed on `usePathname()` — the app router doesn't refire `DOMContentLoaded` on soft navigation — and side-effect-imports `nextra-dgmo/client.css` through this package's own exports map, so consumers need no `@import`.
- **`dist/client.css` is generated, never hand-edited.** `scripts/build-css.mjs` uses `adaptClientCssToClassToggle` from `remark-dgmo/client-css` to rewrite `[data-theme="dark"]` → `html.dark` for Nextra's next-themes default.
- Server/client split matches the others: `src/index.ts` stays config-side, React lives behind `./client`.

## Verify

`pnpm test:e2e` runs in CI. It static-exports `tests/fixture/` and runs `scripts/assert-build-output.mjs`: dual-render class names in the HTML, a `_next/static` CSS file carrying the rewritten `html.dark` selector, no jsdom sentinel in page chunks, and gzipped page JS within 100 KB of `baseline-bundle-size.json`. Re-seed that baseline when the fixture pins move, or the check enforces a measurement of different pins.

`pages.yml` still composes dgmo-content's all-chart-types page into the fixture and deploys it — that is a different build from the e2e one, and it stays.

Locally: `pnpm build`, then `cd tests/fixture && pnpm install --no-frozen-lockfile && pnpm dev`, open `/docs/diagrams`.
