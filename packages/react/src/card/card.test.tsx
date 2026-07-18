import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
// Side-effect import so the jest-dom matcher types are visible to `tsc`,
// which only type-checks `src` (the actual runtime wiring for both jest-dom
// and vitest-axe matchers lives in test/setup.ts; see also
// ../button/vitest-axe.d.ts for the vitest-axe matcher types).
import '@testing-library/jest-dom/vitest';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card';

describe('Card', () => {
  it('renders a composed card with all parts', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description</CardDescription>
        </CardHeader>
        <CardContent>Content</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>,
    );
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  it('applies the base kairo-card class and merges a custom className', () => {
    render(<Card className="extra-class">content</Card>);
    const card = screen.getByText('content');
    expect(card).toHaveClass('kairo-card');
    expect(card).toHaveClass('extra-class');
  });

  it('applies kairo-card-header to CardHeader', () => {
    render(<CardHeader>header</CardHeader>);
    expect(screen.getByText('header')).toHaveClass('kairo-card-header');
  });

  it('applies kairo-card-title to CardTitle and renders an h3', () => {
    render(<CardTitle>title</CardTitle>);
    const title = screen.getByText('title');
    expect(title).toHaveClass('kairo-card-title');
    expect(title.tagName).toBe('H3');
  });

  it('applies kairo-card-description to CardDescription', () => {
    render(<CardDescription>description</CardDescription>);
    expect(screen.getByText('description')).toHaveClass('kairo-card-description');
  });

  it('applies kairo-card-content to CardContent', () => {
    render(<CardContent>content</CardContent>);
    expect(screen.getByText('content')).toHaveClass('kairo-card-content');
  });

  it('applies kairo-card-footer to CardFooter', () => {
    render(<CardFooter>footer</CardFooter>);
    expect(screen.getByText('footer')).toHaveClass('kairo-card-footer');
  });

  it('forwards the ref to the underlying div element', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Card ref={ref}>content</Card>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description</CardDescription>
        </CardHeader>
        <CardContent>Content</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
