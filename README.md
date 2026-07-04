# nextra-dgmo

Render [DGMO](https://diagrammo.app) diagrams from ` ```dgmo ` fenced code blocks in your [Nextra](https://nextra.site) site at build time. Powered by [`@diagrammo/dgmo`](https://www.npmjs.com/package/@diagrammo/dgmo) and the framework-agnostic [`remark-dgmo`](https://www.npmjs.com/package/remark-dgmo) core. Zero client JavaScript by default (one tiny re-binder fires on route change).

📖 **Setup guide:** [diagrammo.app/embed#nextra](https://diagrammo.app/embed#nextra)

Every diagram is rendered twice at build time (light + dark palettes) and follows Nextra's color-mode toggle through a shipped, `.dark`-rewritten stylesheet.

<p align="center">
  <a href="https://diagrammo.app"><img src="https://diagrammo.app/readme/sequence.gif" alt="A DGMO diagram authored as plain text" width="100%"></a>
  <br>
  <em>Write a fenced <code>dgmo</code> block — it renders to SVG at build time.</em>
</p>

## Chart types & visual authoring

One small plain-text language, **45 chart types** — flowcharts, sequence, state, class, ER, C4, org charts, gantt, maps, mind maps, and the full bar/line/pie/area/sankey family. Browse every type with live examples in the **[language reference](https://diagrammo.app/reference)**.

Prefer to author visually? Draft diagrams in the **[Diagrammo desktop app](https://diagrammo.app/app)** or the **[online editor](https://online.diagrammo.app)** — live preview, autocomplete, optional vim keybindings, 7 themeable palettes, and one-click PNG/SVG export — then paste the `dgmo` block into your docs. More at **[diagrammo.app](https://diagrammo.app)**.

## Install

```bash
pnpm add nextra-dgmo @diagrammo/dgmo
```

`@diagrammo/dgmo`, `nextra`, `next`, and `react` are peer dependencies. Node 20.6+.

## ⚠️ Turbopack caveat (read first)

Nextra wires DGMO in through `next.config.mjs`, and `withDgmo` injects the `remark-dgmo` plugin as a **function-valued** MDX option. Turbopack cannot serialize function-valued remark plugins, so:

- **Production builds:** use Webpack — `next build` (Nextra 4's default). Do **not** pass `--turbopack` to `next build`.
- **Dev:** run `next dev` **without** `--turbopack`.

The build/SSG path that actually emits the inline SVG is unaffected — this is purely about how the plugin is passed to the compiler, and Webpack handles it fine. If your `package.json` scripts were scaffolded with `--turbopack`, drop that flag.

## Quick start

Two small edits to your Nextra site.

### 1. `next.config.mjs` — wire the remark plugin

```js
import nextra from 'nextra';
import { withDgmo } from 'nextra-dgmo/config';

const withNextra = nextra(
  withDgmo(
    {/* your existing nextra options, if any */},
    { dgmo: { palette: 'slate' } }
  )
);

export default withNextra({/* your next config */});
```

`withDgmo()` augments your Nextra config's `mdxOptions.remarkPlugins` with `remark-dgmo` and defaults `mdx: true` on it so blocks render as MDX-safe `mdxJsxFlowElement` nodes. Idempotent. Unlike Fumadocs, Nextra nests the remark pipeline under `mdxOptions`, so `withDgmo` injects one level deeper — you don't have to know that; just pass your Nextra options object through it. If you already have your own remark plugins:

```js
const withNextra = nextra(
  withDgmo({ mdxOptions: { remarkPlugins: [myOtherPlugin] } })
);
```

`remark-dgmo` is prepended so it runs before any downstream remark plugin.

### 2. `app/layout.tsx` — mount the client component

```tsx
import './global.css';
import { DgmoClient } from 'nextra-dgmo/client';
import type { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {children}
        <DgmoClient />
      </body>
    </html>
  );
}
```

`<DgmoClient />` is a no-render Client Component that does two things:

1. Runs `bindDgmo()` on initial mount and on every soft route change — Next's app router doesn't refire `DOMContentLoaded` semantics on client-side navigation, so without this you'd lose viewBox tightening and showcase-mode copy buttons after the first SPA transition.
2. Side-effect-imports the shipped `nextra-dgmo/client.css` so Next's CSS pipeline picks it up automatically. The stylesheet is generated from `remark-dgmo/client.css` at build time with `[data-theme="dark"]` rewritten to `html.dark` — the attribute Nextra's `next-themes` default uses. No manual `@import` required.

That's the whole integration.

### Passing remark-dgmo options

```js
const withNextra = nextra(
  withDgmo({}, { dgmo: { palette: 'catppuccin', colorMode: 'auto' } })
);
```

The second argument forwards anything in `remark-dgmo`'s option surface (palette, theme, colorMode, mode, className, etc.).

## Options

The second argument to `withDgmo` is `{ dgmo: DgmoOptions }`. Common keys:

| Option      | Type                            | Default  | Effect                                                                        |
| ----------- | ------------------------------- | -------- | ----------------------------------------------------------------------------- |
| `palette`   | palette name                    | `slate`  | Which of the 7 built-in palettes to render with.                              |
| `theme`     | theme name                      | —        | Named theme preset (overrides individual palette/colorMode where it applies). |
| `colorMode` | `'auto' \| 'light' \| 'dark'`   | `'auto'` | `auto` dual-renders light + dark and toggles via the host's `.dark` class.    |
| `mode`      | render mode                     | —        | Passthrough to `@diagrammo/dgmo`'s render mode.                               |
| `showcase`  | boolean (per-block info string) | `false`  | Renders the source alongside the diagram with a copy-to-clipboard button.     |

Per-block overrides live on the fence info string (see below); the `withDgmo` `dgmo` option sets the site-wide defaults.

## Configure (manual)

If `withDgmo` doesn't fit (dynamic remark plugin loading, you need to inspect the wiring), do it by hand — remember Nextra's remark slot lives under `mdxOptions`:

```js
import nextra from 'nextra';
import remarkDgmo from 'nextra-dgmo/remark';

const withNextra = nextra({
  mdxOptions: {
    remarkPlugins: [[remarkDgmo, { mdx: true }]],
  },
});

export default withNextra({});
```

The `mdx: true` option is required — Nextra always routes content through `@mdx-js/mdx`, which rejects the raw `html` mdast nodes `remark-dgmo` emits by default.

## Use

Drop a fenced block with the language `dgmo` into any `.md`/`.mdx` file in your Nextra content tree.

````markdown
```dgmo
sequence
Client -POST /login-> API
API -validate-> Auth
Auth -JWT-> API
API -200 OK-> Client
```
````

## Per-block overrides

Append options to the fence info string. Tokens are space-separated; values may be quoted.

````markdown
```dgmo showcase title="Login flow" palette=catppuccin colorMode=light
sequence
A -> B
```
````

See the [`remark-dgmo` README](https://github.com/diagrammo/remark-dgmo) for the full option matrix.

## How CSS is delivered

`nextra-dgmo/client.css` is the shipped stylesheet. It's the same three visibility rules + sizing + showcase chrome as upstream `remark-dgmo/client.css`, but the dark-mode selector is rewritten from `[data-theme="dark"]` to `html.dark` — the attribute Nextra's `next-themes` integration uses by default.

It's auto-imported by `<DgmoClient />` via a side-effect `import 'nextra-dgmo/client.css'`. Next's CSS pipeline picks the import up from the Client Component module and extracts it into the page bundle. If you prefer to manage the import yourself, drop in the manual config path above and `@import 'nextra-dgmo/client.css'` from your `app/global.css` instead.

## Custom color-mode selector

If you've configured `next-themes` with a non-default attribute (e.g. `attribute="data-theme"`), the shipped CSS won't match. Two options:

1. Switch back to the default (Nextra's preset expects `html.dark`).
2. Skip `<DgmoClient />`'s auto-import and instead `@import 'remark-dgmo/client.css'` directly in `app/global.css` (keys on `[data-theme="dark"]`), then override your theme's dark-mode rules to match.

See the "Custom color-mode selector" section in the [`remark-dgmo` README](https://github.com/diagrammo/remark-dgmo) for the underlying selectors.

## How it works

1. `withDgmo` prepends `remark-dgmo` (with `mdx: true`) to your Nextra config's `mdxOptions.remarkPlugins`. Nextra's MDX build pipeline runs the plugin during compilation.
2. For each fenced `dgmo` block, `remark-dgmo` calls `render()` from `@diagrammo/dgmo` once per theme (under default `colorMode: 'auto'`) and replaces the block with an `mdxJsxFlowElement` carrying the rendered SVG wrappers via `dangerouslySetInnerHTML`.
3. The shipped CSS, side-effect-imported by `<DgmoClient />`, gates the wrappers' visibility on `html.dark`. Toggling Nextra's theme switcher flips the class, which flips visibility.
4. The `<DgmoClient />` Client Component subscribes to `usePathname()` and re-runs `bindDgmo()` on every soft navigation. The function tightens each diagram's `viewBox` to content bounds and wires showcase-mode copy buttons.

All rendering happens at build time. The browser ships only inline SVG + the small CSS rules + a ~1.5 KB `bindDgmo` payload. This wrapper reuses the `remark-dgmo` core shared with the Astro, Docusaurus, and Fumadocs integrations.

## License

MIT
