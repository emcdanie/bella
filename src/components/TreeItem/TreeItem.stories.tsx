import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { expectTouchTarget } from '../../testing/behavioral';
import TreeItem from './TreeItem';
import cssRaw from './TreeItem.module.css?raw';
import componentContract from '../../../tokens/contracts.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const contract = (componentContract as any).component?.['tree-item']?.$extensions?.bella ?? {};

const THEMES = ['chip-light', 'chip-dark'] as const;

/** One panel per Chip theme, at the panel's 232 content width (story frame only). */
const Themed = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', gap: 'var(--spacing-24)', flexWrap: 'wrap' }}>
    {THEMES.map((theme) => (
      <div
        key={theme}
        data-theme={theme}
        style={{ inlineSize: 232, padding: 'var(--spacing-16)', background: 'var(--color-background-default)', display: 'grid' }}
      >
        {children}
      </div>
    ))}
  </div>
);

const meta: Meta<typeof TreeItem> = {
  title: 'Components/Layout/TreeItem',
  component: TreeItem,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: contract.a11y },
  },
  argTypes: { className: { control: false }, style: { control: false } },
  args: { label: 'CHIP', kind: 'folder', open: true, current: true },
};
export default meta;

type Story = StoryObj<typeof TreeItem>;

export const Playground: Story = {};

/** folder, branch and status, as the Project panel stacks them. Hover and focus are CSS. */
export const ProjectTree: Story = {
  render: () => (
    <Themed>
      <TreeItem kind="folder" label="CHIP" open current />
      <TreeItem kind="branch" label="main" status="passed" />
      <TreeItem kind="branch" label="chip/theme" status="working" current />
      <TreeItem kind="branch" label="chip-button-page" status="waiting" />
      <TreeItem kind="branch" label="fix-llms-txt" status="failed" lineBelow={false} />
      <TreeItem kind="folder" label="BELLA" />
      <TreeItem kind="folder" label="elleta.design" />
      <TreeItem kind="status" label="Needs you" tone="attention" count={4} />
      <TreeItem kind="status" label="Claude" tone="info" count={2} />
      <TreeItem kind="status" label="Gate" tone="neutral" count={1} />
      <TreeItem kind="status" label="Ready" tone="success" count={3} />
    </Themed>
  ),
};

/** group and item, the older kinds: chevron, bold label, count; needs work as the attention StatusDot. */
export const GroupAndItem: Story = {
  render: () => (
    <Themed>
      <TreeItem kind="group" label="Data" count={4} open needsWork />
      <TreeItem kind="item" label="Table" />
      <TreeItem kind="item" label="Stat" current needsWork />
      <TreeItem kind="group" label="Forms" count={10} />
    </Themed>
  ),
};

/** Behavior: current and expanded are in the tree, statuses are spoken, rows are 44. */
export const Behavior: Story = {
  render: () => (
    <div style={{ inlineSize: 232, display: 'grid' }}>
      <TreeItem kind="folder" label="CHIP" open current />
      <TreeItem kind="branch" label="main" status="failed" lineBelow={false} />
      <TreeItem kind="status" label="Needs you" count={4} />
    </div>
  ),
  play: async ({ canvas, step }) => {
    const folder = canvas.getByRole('button', { name: 'CHIP' });
    await step('folder: aria-expanded and aria-current', async () => {
      expect(folder).toHaveAttribute('aria-expanded', 'true');
      expect(folder).toHaveAttribute('aria-current', 'page');
    });
    await step('branch: the status square is part of the name', async () => {
      expect(canvas.getByRole('button', { name: 'failed main' })).toBeInTheDocument();
    });
    await step('44 rows', async () => {
      for (const b of canvas.getAllByRole('button')) expectTouchTarget(b);
    });
  },
};

/** A branch name that wraps (batch 4, published 22 Nov; rule 20): the Status square and the tree tick stay on
 * the first line, the spine runs down the whole row, and a one-line branch is still 44 tall. */
export const WrappedBranch: Story = {
  render: () => (
    <Themed>
      <TreeItem kind="branch" label="main" status="passed" />
      <TreeItem kind="branch" label="chip/retire-status-pill-everywhere-in-the-shell" status="working" current />
      <TreeItem kind="branch" label="fix-llms-txt" status="failed" lineBelow={false} />
    </Themed>
  ),
  play: async ({ canvasElement }) => {
    const rows = Array.from(canvasElement.querySelectorAll<HTMLElement>('[data-bella-component="tree-item"]')).slice(0, 3);
    const [one, wrapped] = rows;
    await expect(Math.round(one.getBoundingClientRect().height)).toBe(44);
    await expect(wrapped.getBoundingClientRect().height).toBeGreaterThan(44);
    const icon = wrapped.querySelector('[data-bella-component="status-square"], svg') as Element;
    const r = icon.getBoundingClientRect();
    await expect(Math.abs((r.top + r.bottom) / 2 - wrapped.getBoundingClientRect().top - 22)).toBeLessThanOrEqual(1);
    const leader = wrapped.firstElementChild as HTMLElement;
    const tick = getComputedStyle(leader, '::after');
    await expect(tick.top).toBe('22px');
  },
};
