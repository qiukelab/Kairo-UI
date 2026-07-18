import Link from 'next/link';
import type { Metadata } from 'next';
import type { ReactNode, SVGProps } from 'react';
import { Badge, Button, Card, CardDescription, CardHeader, CardTitle } from '@kairo-ui/react';
import { ComponentPreview } from '@/components/component-preview';

export const metadata: Metadata = {
  title: 'Kairo — Lightweight, themeable React components',
  description:
    "Accessible React components with a CSS-first theme system. No Tailwind required. Built for Next.js and Vite.",
};

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

interface Feature {
  title: string;
  description: string;
  icon: ReactNode;
}

const FEATURES: Feature[] = [
  {
    title: 'No Tailwind required',
    description:
      "Ships plain CSS and --kairo-* variables. Drop it into any React app — Tailwind is welcome, but never required.",
    icon: (
      <Icon>
        <polyline points="8 6 2 12 8 18" />
        <polyline points="16 6 22 12 16 18" />
      </Icon>
    ),
  },
  {
    title: 'Full theming, built in',
    description:
      'Light and dark mode plus three presets — Default, Ocean, Sunset — all driven by CSS variables and a tiny setTheme API.',
    icon: (
      <Icon>
        <path d="M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9Z" />
      </Icon>
    ),
  },
  {
    title: 'Next.js & Vite ready',
    description:
      "Static components render as zero-JS Server Components in the App Router. Interactive parts carry their own 'use client' boundary. Drops into Vite just as easily.",
    icon: (
      <Icon>
        <path d="M13 2 3 14h7l-1 8 11-14h-7l1-8Z" />
      </Icon>
    ),
  },
  {
    title: 'CSS-first animations',
    description:
      'Transitions and keyframes live in CSS, not a JS animation runtime — smaller bundles, and prefers-reduced-motion is respected out of the box.',
    icon: (
      <Icon>
        <path d="M21 12a9 9 0 1 1-3-6.7" />
        <polyline points="21 3 21 9 15 9" />
      </Icon>
    ),
  },
  {
    title: 'Accessible by default',
    description:
      'Interactive components are built on Base UI, giving you correct ARIA semantics, keyboard support and focus management for free.',
    icon: (
      <Icon>
        <path d="M12 3 4 6v6c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V6l-8-3Z" />
        <path d="m9 12 2 2 4-4" />
      </Icon>
    ),
  },
  {
    title: 'Tree-shakeable',
    description:
      'Import from the package root or per-component subpaths like @kairo-ui/react/button — bundlers only ship what you use.',
    icon: (
      <Icon>
        <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
        <path d="m3 8 9 5 9-5" />
        <path d="M12 13v8" />
      </Icon>
    ),
  },
];

const HERO_PILLS = ['No Tailwind required', 'Next.js & Vite', 'Light/Dark + 3 presets', 'Built on Base UI'];

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col">
      {/* Hero */}
      <section className="border-b border-fd-border">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-6 pt-20 pb-16 text-center sm:pt-28 sm:pb-24">
          <Badge variant="soft" intent="primary">
            React UI kit · MIT licensed
          </Badge>
          <h1 className="text-4xl font-semibold tracking-tight text-fd-foreground sm:text-5xl md:text-6xl">
            Build interfaces with Kairo
          </h1>
          <p className="max-w-2xl text-lg text-fd-muted-foreground">
            Lightweight, accessible React components with a CSS-first theme system. No Tailwind
            required — just import a stylesheet and go. Built for Next.js App Router and Vite alike.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/docs" className="kairo-btn" data-variant="solid" data-size="lg">
              Get Started
            </Link>
            <Link
              href="/docs/components/button"
              className="kairo-btn"
              data-variant="outline"
              data-size="lg"
            >
              Browse Components
            </Link>
          </div>
          <ul className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {HERO_PILLS.map((pill) => (
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
            See it in action
          </h2>
          <p className="mt-2 text-fd-muted-foreground">
            Real components, rendered straight from <code>@kairo-ui/react</code> — variants, sizes
            and all.
          </p>
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
              Everything you need, nothing you don&apos;t
            </h2>
            <p className="mt-2 text-fd-muted-foreground">
              Kairo focuses on the fundamentals: small, themeable, accessible components you can
              drop into any React setup.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <Card key={feature.title}>
                <CardHeader>
                  <div
                    className="mb-1 flex size-9 items-center justify-center rounded-md"
                    style={{
                      backgroundColor: 'var(--kairo-accent)',
                      color: 'var(--kairo-accent-foreground)',
                    }}
                  >
                    {feature.icon}
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
          Ready to build?
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-fd-muted-foreground">
          Install two packages, import one stylesheet, and start composing accessible UI.
        </p>
        <pre className="mx-auto mt-6 w-fit overflow-x-auto rounded-lg border border-fd-border bg-fd-secondary px-4 py-3 text-left text-sm">
          <code>pnpm add @kairo-ui/react @kairo-ui/theme</code>
        </pre>
        <div className="mt-6 flex justify-center">
          <Link href="/docs" className="kairo-btn" data-variant="solid" data-size="lg">
            Read the docs
          </Link>
        </div>
      </section>
    </main>
  );
}
