'use client';

import { Tabs, TabsList, Tab, TabPanel } from '@kairo-ui/react';

/**
 * Interactive demo for the Tabs docs page: three tabs (one disabled) with an
 * animated active-tab indicator and arrow-key navigation between them.
 */
export function TabsDemo() {
  return (
    <Tabs defaultValue="account" className="w-full max-w-sm">
      <TabsList>
        <Tab value="account">Account</Tab>
        <Tab value="password">Password</Tab>
        <Tab value="team" disabled>
          Team
        </Tab>
      </TabsList>
      <TabPanel value="account">Update your account details here.</TabPanel>
      <TabPanel value="password">Change your password here.</TabPanel>
      <TabPanel value="team">Manage your team members here.</TabPanel>
    </Tabs>
  );
}
