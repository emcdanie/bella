import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import Screen from './Screen';
import SideMenu from '../SideMenu/SideMenu';
import Button from '../Button/Button';
import Card from '../Card/Card';
import Link from '../Link/Link';
import cssRaw from './Screen.module.css?raw';
import componentContract from '../../../tokens/contracts.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))).sort();
const contract = (componentContract as any).component?.screen?.$extensions?.bella ?? {};

const menu = (
  <SideMenu
    client="Product"
    items={[
      { label: 'Work', href: '#work', icon: 'CheckCircle', current: true },
      { label: 'Health', href: '#health', icon: 'Activity' },
      { label: 'System', href: '#system', icon: 'ViewGrid' },
    ]}
    foot={[{ label: 'Team', href: '#team', icon: 'Group' }]}
  />
);

const lead = (
  <span style={{ display: 'inline-flex', gap: 'var(--spacing-8)', alignItems: 'center' }}>
    <Button variant="tertiary" iconOnly icon="SidebarCollapse" ariaLabel="Hide menu" />
    <Link href="#work">Product</Link>
  </span>
);

const content = (
  <Card>
    <p style={{ margin: 0 }}>The content slot: the page's one content component.</p>
  </Card>
);

const meta: Meta<typeof Screen> = {
  title: 'Components/Layout/Screen',
  component: Screen,
  parameters: {
    layout: 'fullscreen',
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: contract.a11y },
  },
  argTypes: { menu: { control: false }, lead: { control: false }, actions: { control: false }, overlay: { control: false }, children: { control: false } },
  args: {
    menu,
    lead,
    title: 'Health',
    actions: <Button variant="primary" size="sm">New</Button>,
    children: content,
  },
};
export default meta;

type Story = StoryObj<typeof Screen>;

/** The side menu, the one top row and the content. */
export const Default: Story = {};

/** With tabs under the row: the content is the selected tab's panel. */
export const WithTabs: Story = {
  args: {
    title: 'Components',
    tabs: {
      items: [
        { id: 'components', label: 'Components' },
        { id: 'foundations', label: 'Foundations' },
        { id: 'history', label: 'History' },
      ],
      value: 'components',
      onChange: () => {},
      label: 'System views',
      idBase: 'story-screen',
    },
  },
};

/** The menu hidden (or stepped out into a Drawer below 1024): the main column takes the whole width. */
export const NoMenu: Story = {
  args: { menu: undefined },
};

/** Behavioral suite: one h1, one main landmark, the menu after the page in the source, each tab's panel present. */
export const Behavior: Story = {
  args: { ...WithTabs.args },
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector('[data-bella-component="screen"]') as HTMLElement;
    await expect(root).toBeTruthy();
    await expect(root.querySelectorAll('h1').length).toBe(1);
    await expect(root.querySelectorAll('main').length).toBe(1);
    const parts = [...root.children].map((c) => c.getAttribute('data-screen-part'));
    await expect(parts.indexOf('main')).toBeLessThan(parts.indexOf('menu'));
    const tabs = [...root.querySelectorAll('[role="tab"]')];
    await expect(tabs.length).toBe(3);
    for (const t of tabs) {
      const id = t.getAttribute('aria-controls');
      await expect(id && root.querySelector(`#${id}`)).toBeTruthy();
    }
    const content = root.querySelector('[data-screen-part="content"]') as HTMLElement;
    await expect(getComputedStyle(content).overflowY).toBe('auto');
  },
};
