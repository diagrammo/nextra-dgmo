import 'nextra-theme-docs/style.css';
import { Footer, Layout, Navbar } from 'nextra-theme-docs';
import { Head } from 'nextra/components';
import { getPageMap } from 'nextra/page-map';
import { DgmoClient } from 'nextra-dgmo/client';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'nextra-dgmo fixture',
  description: 'Nextra site exercising the dgmo wrapper.',
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
