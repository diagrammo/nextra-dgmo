# Release Checklist — nextra-dgmo

Every `chore: release vX.Y.Z` PR body MUST link to this checklist. Each item MUST be ticked before `git tag v* && git push --tags`.

## Pre-flight (local)

- [ ] `package.json` `version` matches the intended tag (without the `v` prefix).
- [ ] `package.json` deps on `remark-dgmo` are **`^x.y.z`** — no `file:` or `link:` left over from the dev loop.
- [ ] `package.json` has no `pnpm.overrides` key (the release workflow rejects it, but catch it here).
- [ ] `pnpm build` succeeded.
- [ ] `pnpm test` (unit tests) passed.

## User-visible smoke (manual, ad-hoc)

The unit suite asserts the injection shape but not the actual toggle UX. Once per release, scaffold a real Nextra site and eyeball it:

- [ ] `pnpm create nextra-app _smoke` in a scratch dir; pick the Next.js app-router template.
- [ ] `pnpm pack` in this repo; install the tarball into `_smoke` (`pnpm add ../nextra-dgmo-X.Y.Z.tgz`).
- [ ] Wire the wrapper per README into `_smoke/next.config.mjs`, `_smoke/app/global.css`, `_smoke/app/layout.tsx`.
- [ ] `pnpm dev` (WITHOUT `--turbopack` — see README caveat) opens the page.
- [ ] A docs page contains a dgmo block — confirm it **renders** (not raw fence text).
- [ ] The Nextra theme switcher is present.
- [ ] Click it — confirm the diagram visually switches between light and dark variants.
- [ ] Soft-navigate to another docs page and back — confirm copy-button + viewBox rebinding still works.
- [ ] `next build` (Webpack) succeeds — the SSG path that emits inline SVG is unaffected by the Turbopack caveat.

## Cross-package coordination

- [ ] `remark-dgmo@^0.4` is already on npm and your `dependencies.remark-dgmo` range resolves to it.
- [ ] If this is a v0.x.0 minor and `remark-dgmo` shipped a minor too, `astro-dgmo` + `docusaurus-plugin-dgmo` + `fumadocs-dgmo` got coordinated patches in the same release window.

## After the tag

- [ ] CI release workflow finished successfully (logs green; npm view confirms publish).
- [ ] GitHub release was auto-created and has reasonable auto-generated notes; edit if needed to surface the marquee feature.
- [ ] Bump consumer documentation if README install snippet changed.
