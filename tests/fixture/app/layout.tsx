import 'nextra-theme-docs/style.css';
import { Footer, Layout, Navbar } from 'nextra-theme-docs';
import { Banner, Head } from 'nextra/components';
import { getPageMap } from 'nextra/page-map';
import { DgmoClient } from 'nextra-dgmo/client';
import type { ReactNode } from 'react';
import { EmbedBannerLink, EMBED_BANNER_CSS } from './embed-banner';

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

// Match the showcase banner's brand: logo mark + wordmark, linking home.
const navbar = (
  <Navbar
    logo={
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        <img src={`${base}/favicon.svg`} alt="" width={24} height={24} style={{ borderRadius: 6 }} />
        <b style={{ fontSize: '1.05rem' }}>Diagrammo</b>
      </span>
    }
    logoLink="https://diagrammo.app"
  />
);
const footer = <Footer>MIT — nextra-dgmo fixture</Footer>;

// Diagrammo brand top-bar. Passed as Nextra's `banner` so the theme positions it
// above the navbar and reserves layout space (no overlap / no scroll-off).
const banner = (
  <Banner dismissible={false} className="dgmo-nx-inner">
    <EmbedBannerLink />
  </Banner>
);

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head />
      <body>
        <style dangerouslySetInnerHTML={{ __html: EMBED_BANNER_CSS }} />
        <Layout
          banner={banner}
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
