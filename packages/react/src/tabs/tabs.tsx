'use client';

import { forwardRef } from 'react';
import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import type {
  TabsRootProps,
  TabsListProps,
  TabsTabProps,
  TabsPanelProps,
} from '@base-ui/react/tabs';

export interface TabsProps extends TabsRootProps {}
export interface TabsListComponentProps extends TabsListProps {}
export interface TabProps extends TabsTabProps {}
export interface TabPanelProps extends TabsPanelProps {}

/**
 * Kairo's Tabs. Thin wrappers over Base UI's
 * `Tabs.Root`/`Tabs.List`/`Tabs.Tab`/`Tabs.Panel`/`Tabs.Indicator` anatomy —
 * all interaction and accessibility logic (roles `tablist`/`tab`/`tabpanel`,
 * arrow-key navigation, controlled/uncontrolled active value) comes from
 * `@base-ui/react`. Kairo only supplies the `.kairo-tabs*` classes (plus a
 * `Tabs.Indicator` for the active-tab highlight) so `@kairo-ui/theme` can
 * style everything purely off Base UI's `data-selected`/`data-active`/
 * `data-orientation` attributes.
 */
export const Tabs = forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  { className, ...props },
  ref,
) {
  return (
    <BaseTabs.Root
      ref={ref}
      className={className ? `kairo-tabs ${className}` : 'kairo-tabs'}
      {...props}
    />
  );
});

Tabs.displayName = 'Tabs';

export const TabsList = forwardRef<HTMLDivElement, TabsListComponentProps>(function TabsList(
  { className, children, ...props },
  ref,
) {
  return (
    <BaseTabs.List
      ref={ref}
      className={className ? `kairo-tabs-list ${className}` : 'kairo-tabs-list'}
      {...props}
    >
      {children}
      <BaseTabs.Indicator className="kairo-tabs-indicator" />
    </BaseTabs.List>
  );
});

TabsList.displayName = 'TabsList';

export const Tab = forwardRef<HTMLElement, TabProps>(function Tab({ className, ...props }, ref) {
  return (
    <BaseTabs.Tab
      ref={ref}
      className={className ? `kairo-tab ${className}` : 'kairo-tab'}
      {...props}
    />
  );
});

Tab.displayName = 'Tab';

export const TabPanel = forwardRef<HTMLDivElement, TabPanelProps>(function TabPanel(
  { className, ...props },
  ref,
) {
  return (
    <BaseTabs.Panel
      ref={ref}
      className={className ? `kairo-tab-panel ${className}` : 'kairo-tab-panel'}
      {...props}
    />
  );
});

TabPanel.displayName = 'TabPanel';
