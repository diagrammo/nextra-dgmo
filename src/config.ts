import remarkDgmo from 'remark-dgmo';
import type { DgmoOptions } from 'remark-dgmo';

/**
 * Shape of the `remarkPlugins` slot inside a Nextra config's `mdxOptions`.
 * We only need that one slot — everything else on the config is forwarded
 * untouched — so we type it loosely instead of importing Nextra's internal
 * types (which churn between minor versions).
 *
 * `remarkPlugins` accepts the same shapes Nextra accepts: either a plain
 * array, or a function that receives the framework's defaults and returns
 * the array to use. We preserve whichever form the user passed.
 */
export type RemarkPlugin = unknown;
export type RemarkPluginsArray = RemarkPlugin[];
export type RemarkPluginsFn = (
  defaults: RemarkPluginsArray
) => RemarkPluginsArray;
export type RemarkPluginsField = RemarkPluginsArray | RemarkPluginsFn;

// Loosely-typed mirror of Nextra's config object. We accept and return
// `any` for the field shape so this composes cleanly with
// `nextra(withDgmo(...))` — Nextra's own types are invariant in surprising
// ways across minors. We type-check just enough to preserve compile-time
// safety on `mdxOptions.remarkPlugins`, the only field we touch.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type NextraConfig = Record<string, any>;

export interface WithDgmoOptions {
  /** Options forwarded to `remark-dgmo` (palette, theme, colorMode, etc.). */
  dgmo?: DgmoOptions;
}

/**
 * Augment a Nextra config object so the `remark-dgmo` plugin runs as part
 * of the MDX pipeline. Unlike Fumadocs — which exposes `remarkPlugins` at
 * the top level of its `mdxOptions` object — Nextra nests the remark
 * pipeline one level deeper, under `nextraConfig.mdxOptions.remarkPlugins`.
 * Designed to compose with Nextra's own `nextra()` factory:
 *
 * ```js
 * // next.config.mjs
 * import nextra from 'nextra'
 * import { withDgmo } from 'nextra-dgmo/config'
 *
 * const withNextra = nextra(
 *   withDgmo({ /* nextra options *\/ }, { dgmo: { palette: 'slate' } })
 * )
 *
 * export default withNextra({ /* next config *\/ })
 * ```
 *
 * Idempotent — running it on an already-wired config returns the same
 * config without double-injecting. The remark plugin is prepended to the
 * plugin list so it sees fenced `dgmo` blocks before any downstream remark
 * plugin (notably Nextra's own MDX file resolver) gets a chance to
 * transform them.
 *
 * If `mdxOptions.remarkPlugins` is the function form Nextra supports
 * (`(defaults) => [...]`), the returned config keeps the function form and
 * prepends `remarkDgmo` to the function's eventual output.
 */
export function withDgmo(
  nextraConfig: NextraConfig = {},
  options: WithDgmoOptions = {}
): NextraConfig {
  // Nextra always routes content through @mdx-js/mdx, which rejects raw
  // `html` mdast nodes with `Cannot handle unknown node "raw"`. Default
  // remark-dgmo's `mdx` flag to `true` so blocks emit an
  // mdxJsxFlowElement (`<div dangerouslySetInnerHTML={…}/>`) that MDX
  // accepts. The user can still override via `options.dgmo.mdx = false`.
  const dgmoOptions: DgmoOptions = { mdx: true, ...options.dgmo };
  const remarkInstance: RemarkPlugin = [remarkDgmo, dgmoOptions];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mdxOptions = (nextraConfig['mdxOptions'] ?? {}) as Record<string, any>;
  const existing = mdxOptions['remarkPlugins'];

  // Already wired — bail early. Identity match doesn't survive across
  // calls (we construct a new tuple each time), so we check by reference
  // to the `remarkDgmo` function itself.
  if (Array.isArray(existing) && existing.some(isDgmoEntry)) {
    return nextraConfig;
  }

  let remarkPlugins: RemarkPluginsField;
  if (typeof existing === 'function') {
    const userFn = existing as RemarkPluginsFn;
    remarkPlugins = (defaults: RemarkPluginsArray) => {
      const next = userFn(defaults);
      const arr: RemarkPluginsArray = Array.isArray(next) ? [...next] : [];
      if (!arr.some(isDgmoEntry)) arr.unshift(remarkInstance);
      return arr;
    };
  } else {
    const arr = Array.isArray(existing) ? [...existing] : [];
    arr.unshift(remarkInstance);
    remarkPlugins = arr;
  }

  return {
    ...nextraConfig,
    mdxOptions: { ...mdxOptions, remarkPlugins },
  };
}

function isDgmoEntry(entry: unknown): boolean {
  if (entry === remarkDgmo) return true;
  if (Array.isArray(entry) && entry[0] === remarkDgmo) return true;
  return false;
}
