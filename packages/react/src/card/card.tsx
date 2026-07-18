import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {}

/**
 * Kairo's base Card and its composable parts. Each part is a thin
 * `forwardRef` wrapper over a native element styled via its own
 * `.kairo-card-*` class from `@kairo-ui/theme` — plain, static markup with no
 * shared context, so parts can be used standalone or composed together.
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, ...props },
  ref,
) {
  return (
    <div ref={ref} className={className ? `kairo-card ${className}` : 'kairo-card'} {...props} />
  );
});

Card.displayName = 'Card';

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(function CardHeader(
  { className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={className ? `kairo-card-header ${className}` : 'kairo-card-header'}
      {...props}
    />
  );
});

CardHeader.displayName = 'CardHeader';

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {}

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(function CardTitle(
  { className, ...props },
  ref,
) {
  return (
    <h3
      ref={ref}
      className={className ? `kairo-card-title ${className}` : 'kairo-card-title'}
      {...props}
    />
  );
});

CardTitle.displayName = 'CardTitle';

export interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}

export const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  function CardDescription({ className, ...props }, ref) {
    return (
      <p
        ref={ref}
        className={className ? `kairo-card-description ${className}` : 'kairo-card-description'}
        {...props}
      />
    );
  },
);

CardDescription.displayName = 'CardDescription';

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(function CardContent(
  { className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={className ? `kairo-card-content ${className}` : 'kairo-card-content'}
      {...props}
    />
  );
});

CardContent.displayName = 'CardContent';

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(function CardFooter(
  { className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={className ? `kairo-card-footer ${className}` : 'kairo-card-footer'}
      {...props}
    />
  );
});

CardFooter.displayName = 'CardFooter';
