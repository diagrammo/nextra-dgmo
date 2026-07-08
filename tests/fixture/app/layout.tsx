import 'nextra-theme-docs/style.css';
import { Footer, Layout, Navbar } from 'nextra-theme-docs';
import { Head } from 'nextra/components';
import { getPageMap } from 'nextra/page-map';
import { DgmoClient } from 'nextra-dgmo/client';
import type { ReactNode } from 'react';

// `basePath`-aware favicon href: Next does not prefix metadata icons with
// basePath, so bake the Pages subpath in explicitly (empty at root in dev).
const base = process.env.PAGES_BASE || '';

export const metadata = {
  // Uniform brand tab title across every showcase page (generateMetadata drops
  // each page's own title so this default always wins).
  title: 'Diagrammo × Nextra',
  description: 'Nextra site exercising the dgmo wrapper.',
  icons: {
    icon: [
      { url: `${base}/favicon.svg`, type: 'image/svg+xml' },
      { url: `${base}/favicon.ico`, sizes: 'any' },
    ],
  },
};

const navbar = <Navbar logo={<b>nextra-dgmo</b>} />;
const footer = <Footer>MIT — nextra-dgmo fixture</Footer>;

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head />
      <body>
        <Layout
          navbar={navbar}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/diagrammo/nextra-dgmo/tree/main/tests/fixture"
          footer={footer}
        >
          {children}
        </Layout>
        {/* Re-binds dgmo viewBox tightening + copy buttons on every soft
            navigation and side-effect-imports nextra-dgmo/client.css.
            Renders nothing. */}
        <DgmoClient />
      </body>
    </html>
  );
}
