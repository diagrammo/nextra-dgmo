# `tests/fixture/` — working Nextra + dgmo reference

A minimal Nextra 4 site (Next.js app router) wired with `nextra-dgmo`,
`nextra`, and `nextra-theme-docs`. Two purposes:

1. **Consumer copy-paste template.** If you want to use this wrapper in your
   own Nextra site, the files here are the smallest working configuration. The
   non-obvious bits:
   - **`next.config.mjs`** wraps the Nextra config with `withDgmo()`:
     `nextra(withDgmo({}, { dgmo: {} }))`. That's the entire MDX-pipeline
     integration. Unlike Fumadocs, Nextra nests the remark pipeline under
     `mdxOptions.remarkPlugins`, so `withDgmo` injects one level deeper —
     you don't have to know that; just pass your Nextra options through it.
     `withDgmo` defaults `remark-dgmo`'s `mdx` option to `true` so rendered
     blocks come through as `mdxJsxFlowElement` nodes (MDX rejects raw `html`
     nodes with `Cannot handle unknown node "raw"`).
   - **`app/layout.tsx`** renders `<DgmoClient />` alongside Nextra's
     `<Layout>`. The component is a no-render Client Component that re-runs
     `bindDgmo()` on every soft navigation (viewBox tightening + showcase copy
     buttons) and side-effect-imports `nextra-dgmo/client.css` so Next's CSS
     pipeline picks up the theme-aware stylesheet automatically. The shipped
     stylesheet rewrites `[data-theme="dark"]` → `html.dark` so it follows
     Nextra's next-themes default (`attribute="class"`).

2. **Test / demo fixture.** [`content/docs/diagrams.mdx`](./content/docs/diagrams.mdx)
   exercises four canonical shapes for local development. On GitHub Pages, CI
   overwrites the body with dgmo-content's full `all-chart-types.md` (every
   chart type) via `scripts/compose-showcase.mjs`, and the site is deployed by
   `.github/workflows/pages.yml`.

## Running it

The fixture lives outside the parent repo's pnpm install so it can use its own
lockfile and `link:../..` dep on the plugin source.

```bash
# from the parent nextra-dgmo repo root
pnpm build                                      # build the wrapper
cd tests/fixture
pnpm install --no-frozen-lockfile               # link: deps require non-frozen
pnpm dev                                        # opens http://localhost:3000
```

Open <http://localhost:3000/docs/diagrams> after the dev server boots.

### Why `--webpack` on `next dev` and `next build`

The fixture's `package.json` scripts run Next with `--webpack` instead of
Turbopack. `withDgmo` injects `remark-dgmo` as a **function-valued** MDX
option, and Turbopack cannot serialize function-valued remark plugins. Webpack
handles the same config cleanly. Real consumers building with Webpack (Nextra
4's supported path) aren't affected — drop the flag once Turbopack closes the
gap.

## Not shipped to npm

`tests/` is excluded from the npm tarball via `"files": ["dist", "README.md",
"LICENSE"]` in the root `package.json`. The fixture adds zero bytes to consumer
installs.
