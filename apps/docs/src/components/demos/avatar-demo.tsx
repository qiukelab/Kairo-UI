'use client';

import { useState } from 'react';
import { Avatar } from '@kairo-ui/react';

/**
 * Interactive demo for the Avatar docs page: toggling a broken image URL on
 * and off shows Base UI's automatic fallback-to-initials behavior, alongside
 * a text-only fallback and the three available sizes.
 */
export function AvatarDemo() {
  const [broken, setBroken] = useState(false);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap items-center gap-4">
        <Avatar
          src={broken ? 'https://broken.example/avatar.png' : 'https://i.pravatar.cc/80?img=12'}
          alt="Jane Doe"
          fallback="JD"
        />
        <Avatar fallback="AK" />
        <Avatar size="sm" fallback="SM" />
        <Avatar size="lg" fallback="LG" />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={broken}
          onChange={(event) => setBroken(event.target.checked)}
        />
        Simulate a broken image URL (falls back to initials)
      </label>
    </div>
  );
}
