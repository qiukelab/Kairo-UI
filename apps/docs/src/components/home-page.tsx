import type { ReactNode, SVGProps } from 'react';
import { Link } from '@tanstack/react-router';
import { Badge, Button, Card, CardDescription, CardHeader, CardTitle } from '@kairo-ui/react';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { ComponentPreview } from '@/components/component-preview';
import { HOME_COPY } from '@/lib/home-copy';
import type { Locale } from '@/lib/i18n';
import { baseOptions } from '@/lib/layout.shared';

function Icon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5"
      aria-hidden
      {...props}
    />
  );
}

// Decorative, locale-independent — order matches `HOME_COPY[locale].features`.
const FEATURE_ICONS: ReactNode[] = [
  <Icon key="no-tailwind">
    <polyline points="8 6 2 12 8 18" />
    <polyline points="16 6 22 12 16 18" />
  </Icon>,
  <Icon key="theming">
    <path d="M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9Z" />
  </Icon>,
  <Icon key="frameworks">
    <path d="M13 2 3 14h7l-1 8 11-14h-7l1-8Z" />
  </Icon>,
  <Icon key="animations">
    <path d="M21 12a9 9 0 1 1-3-6.7" />
    <polyline points="21 3 21 9 15 9" />
  </Icon>,
  <Icon key="a11y">
    <path d="M12 3 4 6v6c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V6l-8-3Z" />
    <path d="m9 12 2 2 4-4" />
  </Icon>,
  <Icon key="tree-shakeable">
    <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
    <path d="m3 8 9 5 9-5" />
    <path d="M12 13v8" />
  </Icon>,
];

/** `/docs/$` (en) or `/th/docs/$` (th) — typed as a literal union so `Link`'s type-safe `to` prop still checks out. */
function docsLink(locale: Locale, splat: string) {
  return locale === 'th'
    ? ({ to: '/th/docs/$', params: { _splat: splat } } as const)
    : ({ to: '/docs/$', params: { _splat: splat } } as const);
}

export function HomePage({ locale }: { locale: Locale }) {
  const copy = HOME_COPY[locale];

  return (
    <HomeLayout {...baseOptions()}>
      <main className="flex flex-1 flex-col">
        {/* Hero */}
        <section className="border-b border-fd-border">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-6 pt-20 pb-16 text-center sm:pt-28 sm:pb-24">
            <Badge variant="soft" intent="primary">
              {copy.badge}
            </Badge>
            <h1 className="text-4xl font-semibold tracking-tight text-fd-foreground sm:text-5xl md:text-6xl">
              {copy.title}
            </h1>
            <p className="max-w-2xl text-lg text-fd-muted-foreground">{copy.description}</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link {...docsLink(locale, '')} className="kairo-btn" data-variant="solid" data-size="lg">
                {copy.ctaPrimary}
              </Link>
              <Link
                {...docsLink(locale, 'components/button')}
                className="kairo-btn"
                data-variant="outline"
                data-size="lg"
              >
                {copy.ctaSecondary}
              </Link>
            </div>
            <ul className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {copy.pills.map((pill) => (
                <li key={pill}>
                  <Badge variant="outline">{pill}</Badge>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Live preview */}
        <section className="mx-auto w-full max-w-4xl px-6 py-16">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-fd-foreground sm:text-3xl">
              {copy.previewHeading}
            </h2>
            <p className="mt-2 text-fd-muted-foreground">{copy.previewDescription}</p>
          </div>
          <ComponentPreview
            code={`<Button variant="solid">Solid</Button>\n<Button variant="outline">Outline</Button>\n<Button variant="ghost">Ghost</Button>`}
          >
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button variant="solid">Solid</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
          </ComponentPreview>
        </section>

        {/* Feature grid */}
        <section className="border-t border-fd-border bg-fd-muted/30">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="text-2xl font-semibold tracking-tight text-fd-foreground sm:text-3xl">
                {copy.featuresHeading}
              </h2>
              <p className="mt-2 text-fd-muted-foreground">{copy.featuresDescription}</p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {copy.features.map((feature, index) => (
                <Card key={feature.title}>
                  <CardHeader>
                    <div
                      className="mb-1 flex size-9 items-center justify-center rounded-md"
                      style={{
                        backgroundColor: 'var(--kairo-accent)',
                        color: 'var(--kairo-accent-foreground)',
                      }}
                    >
                      {FEATURE_ICONS[index]}
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="mx-auto w-full max-w-3xl px-6 py-20 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-fd-foreground sm:text-3xl">
            {copy.closingHeading}
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-fd-muted-foreground">{copy.closingDescription}</p>
          <pre className="mx-auto mt-6 w-fit overflow-x-auto rounded-lg border border-fd-border bg-fd-secondary px-4 py-3 text-left text-sm">
            <code>pnpm add @kairo-ui/react @kairo-ui/theme</code>
          </pre>
          <div className="mt-6 flex justify-center">
            <Link {...docsLink(locale, '')} className="kairo-btn" data-variant="solid" data-size="lg">
              {copy.finalCta}
            </Link>
          </div>
        </section>
      </main>
    </HomeLayout>
  );
}
