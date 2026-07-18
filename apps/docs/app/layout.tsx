import '@kairo-ui/theme/styles.css';
import './global.css';

import { RootProvider } from 'fumadocs-ui/provider/next';
import type { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        {/* `attribute: 'class'` matches @kairo-ui/theme's `.dark` toggle convention (already the default, set explicitly for clarity). */}
        <RootProvider theme={{ attribute: 'class' }}>{children}</RootProvider>
      </body>
    </html>
  );
}
