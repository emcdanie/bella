import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor } from 'storybook/test';
import { expectTouchTarget } from '../../testing/behavioral';
import NavList, { type NavListGroup } from './NavList';
import navCssRaw from './NavList.module.css?raw';
import componentContract from '../../../tokens/component.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((navCssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const navContract = (componentContract as any).component?.['nav-list']?.$extensions?.bella ?? {};

const meta: Meta<typeof NavList> = {
  title: 'Components/NavList',
  component: NavList,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: navContract.a11y },
  },
  argTypes: {
    groups: { control: false },
    label: { control: 'text' },
    collapsed: { control: 'boolean' },
    onToggle: { control: false },
    onNavigate: { control: false },
    footer: { control: false },
    className: { control: false },
  },
};
export default meta;

type Story = StoryObj<typeof NavList>;

const GROUPS: NavListGroup[] = [
  {
    items: [
      { href: '#health', label: 'Health', icon: 'ViewGrid', current: true },
      { href: '#ask', label: 'Ask', icon: 'Search' },
      { href: '#library', label: 'Library', icon: 'Table' },
    ],
  },
  {
    label: 'Systems',
    items: [
      { href: '#bella', label: 'BELLA', badge: 2 },
      { href: '#portfolio', label: 'Portfolio' },
    ],
  },
];

const frame = {
  width: 260,
  padding: 'var(--spacing-3)',
  background: 'var(--color-semantic-surface-card)',
  borderRadius: 'var(--radius-lg)',
};

/** Grouped links on the panel surface: the current view is the wash, ink and medium weight. */
export const Default: Story = {
  render: () => (
    <div style={frame}>
      <NavList label="Workspace" groups={GROUPS} />
    </div>
  ),
};

function CollapsibleHarness() {
  const [collapsed, setCollapsed] = useState(false);
  const [current, setCurrent] = useState('#health');
  const groups = GROUPS.map((g) => ({
    ...g,
    items: g.items.map((it) => ({ ...it, current: it.href === current })),
  }));
  return (
    <div style={frame}>
      <NavList
        label="Workspace"
        groups={groups}
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        onNavigate={(href, e) => {
          e.preventDefault();
          setCurrent(href);
        }}
        footer={<span>CHIP 2.0</span>}
      />
    </div>
  );
}

/** With the hide / show toggle and a footer row. */
export const Collapsible: Story = {
  render: () => <CollapsibleHarness />,
};

/** Behavioral suite: a named landmark, aria-current, in-app routing, the
 * toggle's expanded state and accessible name, 44px rows. */
export const Behavior: Story = {
  render: () => <CollapsibleHarness />,
  play: async ({ canvas, step }) => {
    await step('a named nav landmark; groups with a heading are labelled lists', async () => {
      expect(canvas.getByRole('navigation', { name: 'Workspace' })).toBeTruthy();
      expect(canvas.getByRole('list', { name: 'Systems' })).toBeTruthy();
    });

    await step('where you are lives in aria-current', async () => {
      expect(canvas.getByRole('link', { name: 'Health' })).toHaveAttribute('aria-current', 'page');
      expect(canvas.getByRole('link', { name: 'Ask' })).not.toHaveAttribute('aria-current');
    });

    await step('the badge is part of the link name', async () => {
      expect(canvas.getByRole('link', { name: /^BELLA\s*2$/ })).toBeTruthy();
    });

    await step('onNavigate can route in-app and the current item follows', async () => {
      await userEvent.click(canvas.getByRole('link', { name: 'Ask' }));
      await waitFor(() =>
        expect(canvas.getByRole('link', { name: 'Ask' })).toHaveAttribute('aria-current', 'page')
      );
    });

    await step('the toggle hides the lists and says so', async () => {
      const toggle = canvas.getByRole('button', { name: 'Hide Workspace' });
      expect(toggle).toHaveAttribute('aria-expanded', 'true');
      expectTouchTarget(toggle);
      await userEvent.click(toggle);
      await waitFor(() => {
        const shown = canvas.getByRole('button', { name: 'Show Workspace' });
        expect(shown).toHaveAttribute('aria-expanded', 'false');
        expect(canvas.queryByRole('link', { name: 'Ask' })).toBeNull();
      });
      await userEvent.click(canvas.getByRole('button', { name: 'Show Workspace' }));
    });

    await step('keyboard focus draws the 3px ring; rows hit 44px', async () => {
      const link = canvas.getByRole('link', { name: 'Health' });
      link.focus();
      await userEvent.tab({ shift: true });
      await userEvent.tab();
      const cs = getComputedStyle(document.activeElement as HTMLElement);
      expect(cs.outlineStyle).toBe('solid');
      expect(parseFloat(cs.outlineWidth)).toBe(3);
      expectTouchTarget(link);
    });
  },
};
