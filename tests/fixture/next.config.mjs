import nextra from 'nextra';
import { withDgmo } from 'nextra-dgmo/config';

// `withDgmo` augments the Nextra config's nested `mdxOptions.remarkPlugins`
// so the remark-dgmo plugin runs as part of Nextra's MDX pipeline. It
// defaults `mdx: true` on remark-dgmo so rendered diagrams come through as
// mdxJsxFlowElement nodes (MDX rejects raw html nodes). One line; no other
// wiring required.
const withNextra = nextra(withDgmo({}, { dgmo: {} }));

// `basePath`/`assetPrefix` are env-gated so the e2e fixture build (no env)
// stays at root and its committed baseline holds. The Pages workflow sets
// PAGES_BASE to the repo subpath so chunks resolve under github.io/<repo>.
const pagesBase = process.env.PAGES_BASE;

export default withNextra({
  reactStrictMode: true,
  ...(pagesBase ? { basePath: pagesBase, assetPrefix: pagesBase } : {}),
  // Static export gives us a flat `out/` directory of pre-rendered HTML and
  // asset chunks — no running Node runtime required to serve on GitHub Pages.
  // Nextra's `[[...mdxPath]]` catch-all is fully statically resolvable since
  // we wire `generateStaticParamsFor('mdxPath')`.
  output: 'export',
  // Static export disables Next's image optimizer; required when output=export.
  images: { unoptimized: true },
});
