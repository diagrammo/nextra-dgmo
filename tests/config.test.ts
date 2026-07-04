import { describe, it, expect } from 'vitest';
import remarkDgmo from 'remark-dgmo';
import { withDgmo } from '../src/config.ts';

function unwrap(plugin: unknown): unknown {
  return Array.isArray(plugin) ? plugin[0] : plugin;
}
function pluginOpts(plugin: unknown): Record<string, unknown> | undefined {
  return Array.isArray(plugin)
    ? (plugin[1] as Record<string, unknown>)
    : undefined;
}
// Reach into the Nextra config's nested remark slot. Unlike Fumadocs, the
// pipeline lives at `config.mdxOptions.remarkPlugins`, one level deeper.
function remarkPlugins(config: Record<string, unknown>): unknown {
  const mdxOptions = config['mdxOptions'] as Record<string, unknown>;
  return mdxOptions['remarkPlugins'];
}

describe('withDgmo', () => {
  it('injects remarkDgmo with mdx:true by default under mdxOptions.remarkPlugins', () => {
    const result = withDgmo();
    const plugins = remarkPlugins(result) as unknown[];
    expect(plugins).toHaveLength(1);
    expect(unwrap(plugins[0])).toBe(remarkDgmo);
    expect(pluginOpts(plugins[0])).toEqual({ mdx: true });
  });

  it('prepends remarkDgmo so it runs before existing user plugins', () => {
    const userPlugin = () => undefined;
    const result = withDgmo({ mdxOptions: { remarkPlugins: [userPlugin] } });
    const plugins = remarkPlugins(result) as unknown[];
    expect(plugins).toHaveLength(2);
    expect(unwrap(plugins[0])).toBe(remarkDgmo);
    expect(plugins[1]).toBe(userPlugin);
  });

  it('preserves other top-level config fields untouched', () => {
    const result = withDgmo({
      contentDirBasePath: '/docs',
      defaultShowCopyCode: true,
    });
    expect(result['contentDirBasePath']).toBe('/docs');
    expect(result['defaultShowCopyCode']).toBe(true);
  });

  it('preserves other mdxOptions fields untouched', () => {
    const result = withDgmo({
      mdxOptions: { rehypePlugins: ['some-rehype'], format: 'mdx' },
    });
    const mdxOptions = result['mdxOptions'] as Record<string, unknown>;
    expect(mdxOptions['format']).toBe('mdx');
    expect(mdxOptions['rehypePlugins']).toEqual(['some-rehype']);
  });

  it('is idempotent — calling twice does not double-inject', () => {
    const once = withDgmo();
    const twice = withDgmo(once);
    expect((remarkPlugins(twice) as unknown[]).length).toBe(1);
  });

  it('forwards user dgmo options merged over the mdx:true default', () => {
    const result = withDgmo({}, { dgmo: { palette: 'catppuccin' } });
    const plugin = (remarkPlugins(result) as unknown[])[0];
    expect(pluginOpts(plugin)).toEqual({ mdx: true, palette: 'catppuccin' });
  });

  it('lets user override mdx:true via explicit false', () => {
    const result = withDgmo({}, { dgmo: { mdx: false } });
    const plugin = (remarkPlugins(result) as unknown[])[0];
    expect(pluginOpts(plugin)).toEqual({ mdx: false });
  });

  it('handles function-form remarkPlugins by composing into the function', () => {
    const userPlugin = () => undefined;
    const defaults: unknown[] = ['nextra-builtin'];
    const result = withDgmo({
      mdxOptions: {
        remarkPlugins: (d: unknown[]) => [userPlugin, ...d],
      },
    });
    expect(typeof remarkPlugins(result)).toBe('function');
    const fn = remarkPlugins(result) as (defaults: unknown[]) => unknown[];
    const out = fn(defaults);
    expect(out.length).toBe(3);
    expect(unwrap(out[0])).toBe(remarkDgmo);
    expect(out[1]).toBe(userPlugin);
    expect(out[2]).toBe('nextra-builtin');
  });

  it('is idempotent against the function form too', () => {
    const once = withDgmo({
      mdxOptions: { remarkPlugins: () => [] },
    });
    const twice = withDgmo(once);
    const fn = remarkPlugins(twice) as (defaults: unknown[]) => unknown[];
    const out = fn([]);
    // exactly one remarkDgmo entry survives the second wrap
    const dgmoCount = out.filter((e) => unwrap(e) === remarkDgmo).length;
    expect(dgmoCount).toBe(1);
  });
});
