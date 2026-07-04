// Nextra 4 requires an `mdx-components` file at the project root that maps
// MDX element tags to components. We merge Nextra's docs-theme components with
// any per-page overrides. `useMDXComponents` is discovered by Nextra's MDX
// compiler; no import wiring needed beyond existing here.
import { useMDXComponents as getDocsMDXComponents } from 'nextra-theme-docs';
import type { MDXComponents } from 'nextra/mdx-components';

const docsComponents = getDocsMDXComponents();

export function useMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...docsComponents,
    ...components,
  };
}
