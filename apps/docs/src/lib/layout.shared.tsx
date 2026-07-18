import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { ThemePresetSwitcher } from '@/components/theme-preset-switcher';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: 'Kairo',
      children: <ThemePresetSwitcher />,
    },
  };
}
