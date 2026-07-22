import type { ReactNode, SVGProps } from 'react';
import { Link } from '@tanstack/react-router';
import {
  Badge,
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  Tab,
  TabPanel,
  Tabs,
  TabsList,
} from '@kairo-ui/react';
import { DynamicCodeBlock } from 'fumadocs-ui/components/dynamic-codeblock';
import { ComponentPreview } from '@/components/component-preview';
import { HomeGallery } from '@/components/home-gallery';
import { HomeNav } from '@/components/home-nav';
import { HOME_COPY, INSTALL_COMMANDS, THEMING_SNIPPET } from '@/lib/home-copy';
import type { Locale } from '@/lib/i18n';

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

/** Small caps section marker, the way the reference labels each band. */
function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-xs font-medium tracking-widest text-fd-muted-foreground uppercase">
        {children}
      </span>
      <span className="h-px flex-1 bg-fd-border" />
    </div>
  );
}

export function HomePage({ locale }: { locale: Locale }) {
  const copy = HOME_COPY[locale];

  return (
    /*
      Split landing page: the pitch is pinned on the left while the supporting
      material scrolls on the right.

      `sticky` rather than `fixed` — a fixed pane is taken out of flow, so it
      cannot reserve its own column and the scrolling side has to be padded by
      a hard-coded width to avoid sliding underneath it. A sticky pane keeps
      its grid column, and the whole thing degrades to a plain stacked page
      below `lg` with no separate mobile branch.

      This page deliberately does not use `HomeLayout`: its header duplicated
      the brand against the pinned pane's own wordmark and put a second GitHub
      link above the nav bar's. `HomeNav` carries those controls instead.
    */
    <main className="flex flex-col lg:grid lg:grid-cols-2 lg:items-start">
      {/*
        Pinned pane. `h-dvh` + `overflow-hidden` is the contract: it fills
        exactly one viewport and never scrolls, so `justify-between` can push
        the wordmark to the top and the pills to the bottom against a known
        height. Anything that would overflow is a signal the copy is too long
        for the pane, not something to solve with a scrollbar.
      */}
      {/* `min-w-0` on BOTH columns is load-bearing: `grid-cols-2` is
          `1fr 1fr`, and `1fr` means `minmax(auto, 1fr)` — a track refuses to
          shrink below its content's min-content width. The scrolling column
          holds a nav bar of `whitespace-nowrap` tabs and code blocks, whose
          combined min-content easily exceeds half the viewport, so it stole
          space until this pane collapsed to a sliver. `min-w-0` overrides that
          floor and lets the fractions actually split the row evenly. */}
      <div className="kairo-hero-grid flex min-w-0 flex-col justify-between gap-10 border-fd-border px-6 py-10 lg:sticky lg:top-0 lg:h-dvh lg:overflow-hidden lg:border-e lg:px-12 lg:py-10">
        <Link
          to={locale === 'th' ? '/th' : '/'}
          className="text-2xl font-semibold tracking-tight text-fd-foreground"
        >
          Kairo
        </Link>

        <div className="flex flex-col items-start gap-5">
          <Badge variant="soft" intent="primary">
            {copy.badge}
          </Badge>
          <h1 className="text-4xl font-semibold tracking-tight text-balance text-fd-foreground xl:text-5xl">
            {copy.title}
          </h1>
          <p className="max-w-lg text-fd-muted-foreground xl:text-lg">{copy.description}</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              {...docsLink(locale, '')}
              className="kairo-btn"
              data-variant="solid"
              data-size="lg"
            >
              {copy.ctaPrimary}
            </Link>
            <Link
              {...docsLink(locale, 'components')}
              className="kairo-btn"
              data-variant="outline"
              data-size="lg"
            >
              {copy.ctaSecondary}
            </Link>
          </div>
        </div>

        {/* Anchored to the bottom of the pinned pane, the way the reference
            keeps its secondary links out of the headline's way. */}
        <ul className="flex flex-wrap items-center gap-2">
          {copy.pills.map((pill) => (
            <li key={pill}>
              <Badge variant="outline">{pill}</Badge>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex min-w-0 flex-col">
        <HomeNav locale={locale} />

        {/* Overview: lead paragraph + install snippet + what it stands on */}
        <section className="flex flex-col gap-6 border-b border-fd-border px-6 py-12 lg:px-12">
          <SectionLabel>{copy.overviewLabel}</SectionLabel>
          <p className="max-w-2xl text-fd-foreground">{copy.lead}</p>

          <Tabs defaultValue={INSTALL_COMMANDS[0].id}>
            <TabsList>
              {INSTALL_COMMANDS.map((entry) => (
                <Tab key={entry.id} value={entry.id}>
                  {entry.id}
                </Tab>
              ))}
            </TabsList>
            {INSTALL_COMMANDS.map((entry) => (
              <TabPanel key={entry.id} value={entry.id}>
                <DynamicCodeBlock lang="bash" code={entry.command} />
              </TabPanel>
            ))}
          </Tabs>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2">
            <span className="text-xs font-medium tracking-widest text-fd-muted-foreground uppercase">
              {copy.builtOnLabel}
            </span>
            {copy.builtOn.map((item) => (
              <span key={item} className="text-sm text-fd-muted-foreground">
                {item}
              </span>
            ))}
          </div>
        </section>

        {/* Live preview */}
        <section className="flex flex-col gap-6 border-b border-fd-border px-6 py-12 lg:px-12">
          <SectionLabel>{copy.previewHeading}</SectionLabel>
          <p className="max-w-2xl text-fd-muted-foreground">{copy.previewDescription}</p>
          <ComponentPreview
            code={`<Button variant="solid">Solid</Button>\n<Button variant="outline">Outline</Button>\n<Button variant="ghost">Ghost</Button>`}
          >
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="solid">Solid</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
          </ComponentPreview>
          <HomeGallery locale={locale} />
        </section>

        {/* Feature grid — numbered, in the reference's two-up rhythm */}
        <section className="flex flex-col gap-6 border-b border-fd-border px-6 py-12 lg:px-12">
          <SectionLabel>{copy.featuresHeading}</SectionLabel>
          <p className="max-w-2xl text-fd-muted-foreground">{copy.featuresDescription}</p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {copy.features.map((feature, index) => (
              <Card key={feature.title}>
                <CardHeader>
                  <div className="mb-1 flex items-center gap-3">
                    <span className="font-mono text-xs text-fd-muted-foreground">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span
                      className="flex size-9 items-center justify-center"
                      style={{
                        backgroundColor: 'var(--kairo-accent)',
                        color: 'var(--kairo-accent-foreground)',
                      }}
                    >
                      {FEATURE_ICONS[index]}
                    </span>
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* Theming — code beside the claims it backs up */}
        <section className="flex flex-col gap-6 border-b border-fd-border px-6 py-12 lg:px-12">
          <SectionLabel>{copy.themingHeading}</SectionLabel>
          <p className="max-w-2xl text-fd-muted-foreground">{copy.themingDescription}</p>
          <div className="grid grid-cols-1 gap-px border border-fd-border bg-fd-border xl:grid-cols-[1.4fr_1fr]">
            {/* Same `minmax(auto, 1fr)` trap as the page columns — without
                  `min-w-0` the snippet's longest line sets this track's floor
                  and pushes the points list off the edge. `DynamicCodeBlock`
                  scrolls its own overflow, but the grid cell wrapping it still
                  needs the override to shrink below that content's width. */}
            <div className="min-w-0">
              <DynamicCodeBlock lang="ts" code={THEMING_SNIPPET} />
            </div>
            <ul className="flex flex-col gap-px bg-fd-border">
              {copy.themingPoints.map((point) => (
                <li key={point.title} className="flex-1 bg-fd-background p-4">
                  <p className="text-sm font-medium text-fd-foreground">{point.title}</p>
                  <p className="mt-1 text-sm text-fd-muted-foreground">{point.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="flex flex-col items-start gap-4 px-6 py-12 lg:px-12">
          <h2 className="text-2xl font-semibold tracking-tight text-fd-foreground">
            {copy.closingHeading}
          </h2>
          <p className="max-w-xl text-fd-muted-foreground">{copy.closingDescription}</p>
          <Link {...docsLink(locale, '')} className="kairo-btn" data-variant="solid" data-size="lg">
            {copy.finalCta}
          </Link>
        </section>
      </div>
    </main>
  );
}
