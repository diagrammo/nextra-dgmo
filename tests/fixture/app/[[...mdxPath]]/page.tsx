import { generateStaticParamsFor, importPage } from 'nextra/pages';
import { useMDXComponents as getMDXComponents } from '../../mdx-components';

export const generateStaticParams = generateStaticParamsFor('mdxPath');

interface PageProps {
  params: Promise<{ mdxPath?: string[] }>;
}

export async function generateMetadata(props: PageProps) {
  const params = await props.params;
  const { metadata } = await importPage(params.mdxPath);
  // Drop the page's own title so the root layout's "Diagrammo × Nextra" default
  // is the tab title on every showcase page.
  const { title: _title, ...rest } = metadata;
  return rest;
}

const Wrapper = getMDXComponents().wrapper!;

export default async function Page(props: PageProps) {
  const params = await props.params;
  const result = await importPage(params.mdxPath);
  const { default: MDXContent, ...rest } = result;
  return (
    <Wrapper {...rest}>
      <MDXContent {...props} params={params} />
    </Wrapper>
  );
}
