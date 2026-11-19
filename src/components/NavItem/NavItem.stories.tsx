import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { expectTouchTarget } from '../../testing/behavioral';
import NavItem from './NavItem';
import cssRaw from './NavItem.module.css?raw';
import componentContract from '../../../tokens/contracts.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const contract = (componentContract as any).component?.['nav-item']?.$extensions?.bella ?? {};

const THEMES = ['chip-light', 'chip-dark'] as const;

/** One surface per Chip theme; dark comes from the token modes, never a variant. */
const Themed = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'grid', gap: 'var(--spacing-16)' }}>
    {THEMES.map((theme) => (
      <div
        key={theme}
        data-theme={theme}
        style={{
          padding: 'var(--spacing-24)',
          background: 'var(--color-background-surface)',
          display: 'flex',
          gap: 'var(--spacing-24)',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
        }}
      >
        {children}
      </div>
    ))}
  </div>
);

const meta: Meta<typeof NavItem> = {
  title: 'Components/Layout/NavItem',
  component: NavItem,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: contract.a11y },
  },
  argTypes: {
    icon: { control: 'select' },
    className: { control: false },
    style: { control: false },
  },
  args: { label: 'Projects', icon: 'Folder', badge: 18, showBadge: true },
};
export default meta;

type Story = StoryObj<typeof NavItem>;

export const Playground: Story = {};

/** With label: default, current, with and without badge, in Chip light and Chip dark.
 * Hover and focus are CSS; hover them or Tab to them. */
export const Labelled: Story = {
  render: () => (
    <Themed>
      <div style={{ display: 'grid', gap: 'var(--spacing-4)', inlineSize: 240 }}>
        <NavItem label="Components" icon="ViewGrid" badge={18} />
        <NavItem label="Projects" icon="Folder" badge={4} current />
        <NavItem label="Team" icon="Group" />
        <NavItem label="Not again" icon="Book" showIcon={false} />
      </div>
    </Themed>
  ),
};

/** iconOnly, as the Icon rail uses it: a 44 square; the label is the name and the tooltip. */
export const IconOnly: Story = {
  render: () => (
    <Themed>
      <div style={{ display: 'grid', gap: 'var(--spacing-8)', justifyItems: 'center', inlineSize: 72 }}>
        <NavItem iconOnly label="Projects" icon="Folder" current />
        <NavItem iconOnly label="Not again" icon="Book" />
        <NavItem iconOnly label="Team" icon="Group" />
      </div>
    </Themed>
  ),
};

/** Behavior: current is in the tree, not only paint; iconOnly is named by its label; 44 targets. */
export const Behavior: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--spacing-8)', inlineSize: 240 }}>
      <NavItem label="Projects" icon="Folder" current href="#projects" />
      <NavItem iconOnly label="Team" icon="Group" />
    </div>
  ),
  play: async ({ canvas, step }) => {
    await step('current is aria-current="page"', async () => {
      expect(canvas.getByRole('link', { name: 'Projects' })).toHaveAttribute('aria-current', 'page');
    });
    await step('iconOnly is named by its label', async () => {
      expect(canvas.getByRole('button', { name: 'Team' })).toBeInTheDocument();
    });
    await step('44 targets', async () => {
      expectTouchTarget(canvas.getByRole('link', { name: 'Projects' }));
      expectTouchTarget(canvas.getByRole('button', { name: 'Team' }));
    });
  },
};
