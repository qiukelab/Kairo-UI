'use client';

import { forwardRef } from 'react';
import type { ReactNode } from 'react';
import { Avatar as BaseAvatar } from '@base-ui/react/avatar';
import type { AvatarRootProps } from '@base-ui/react/avatar';

export interface AvatarProps extends Omit<AvatarRootProps, 'children'> {
  /** The image source URL. */
  src?: string;
  /** Accessible alt text describing the image. */
  alt?: string;
  /**
   * Rendered when there is no `src`, or the image fails/hasn't finished
   * loading. Typically initials (e.g. `"JD"`) or an icon.
   */
  fallback?: ReactNode;
  /** Size of the avatar. @default 'md' */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Kairo's Avatar. A convenience wrapper over Base UI's
 * `Avatar.Root`/`Avatar.Image`/`Avatar.Fallback` anatomy — Base UI handles
 * image-load-status tracking (so the fallback only renders once loading has
 * failed or there's no image yet) while Kairo supplies the `src`/`alt`/
 * `fallback`/`size` convenience props plus the `.kairo-avatar*` classes for
 * `@kairo-ui/theme` to style.
 */
export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  { src, alt, fallback, size = 'md', className, ...props },
  ref,
) {
  return (
    <BaseAvatar.Root
      ref={ref}
      data-size={size}
      className={className ? `kairo-avatar ${className}` : 'kairo-avatar'}
      {...props}
    >
      {src ? <BaseAvatar.Image src={src} alt={alt} className="kairo-avatar-image" /> : null}
      {fallback !== undefined ? (
        <BaseAvatar.Fallback className="kairo-avatar-fallback">{fallback}</BaseAvatar.Fallback>
      ) : null}
    </BaseAvatar.Root>
  );
});

Avatar.displayName = 'Avatar';
