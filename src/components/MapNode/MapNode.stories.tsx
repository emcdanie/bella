import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor } from 'storybook/test';
import MapNode from './MapNode';
import MapLine from '../MapLine/MapLine';
import cssRaw from './MapNode.module.css?raw';
import componentContract from '../../../tokens/contracts.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const contract = (componentContract as any).component?.['map-node']?.$extensions?.bella ?? {};

const meta: Meta<typeof MapNode> = {
  title: 'Components/Data/MapNode',
  component: MapNode,
  parameters: { docs: { page: ComponentDocsPage }, bellaDocs: { tokens: consumedTokens, a11y: contract.a11y } },
  argTypes: { tone: { control: 'inline-radio' }, statusTone: { control: 'select' }, onSelect: { control: false }, className: { control: false }, style: { control: false } },
  args: { title: 'Tokens', status: 'Healthy', tone: 'default', selected: false },
  render: (args) => (
    <div style={{ padding: 'var(--spacing-24)', background: 'var(--color-background-subtle)', display: 'inline-block' }}>
      <MapNode {...args} />
    </div>
  ),
};
export default meta;

type Story = StoryObj<typeof MapNode>;

export const Playground: Story = {};

/** The Figma set: default, needs you (warning edge), blocked (neutral dot) and selected. */
export const Tones: Story = {
  render: () => (
    <div style={{ padding: 'var(--spacing-24)', background: 'var(--color-background-subtle)', display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-24)', alignItems: 'flex-start' }}>
      <MapNode title="Tokens" status="Healthy" />
      <MapNode title="Figma" status="Needs you" tone="attention" />
      <MapNode title="Compare with Figma" status="Blocked: Figma" tone="blocked" />
      <MapNode title="Gate" status="Healthy" selected />
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const nodes = Array.from(canvasElement.querySelectorAll<HTMLElement>('[data-bella-component="map-node"]'));
    await step('176 wide, corner 12, flat, a 1px edge', async () => {
      for (const n of nodes) {
        await expect(Math.round(n.getBoundingClientRect().width)).toBe(176);
        await expect(getComputedStyle(n).borderTopLeftRadius).toBe('12px');
        await expect(getComputedStyle(n).boxShadow).toBe('none');
      }
      await expect(getComputedStyle(nodes[0]).borderTopWidth).toBe('1px');
    });
    await step('the edge is the status: warning for needs you, the strong edge for blocked', async () => {
      await expect(getComputedStyle(nodes[1]).borderTopColor).not.toBe(getComputedStyle(nodes[0]).borderTopColor);
      await expect(getComputedStyle(nodes[2]).borderTopColor).toBe(getComputedStyle(nodes[0]).borderTopColor);
    });
    await step('blocked keeps "Blocked: Figma" on one line and its dot is neutral', async () => {
      const word = nodes[2].querySelector('[class*="status"] > span:last-child') as HTMLElement;
      await expect(word.getBoundingClientRect().height).toBeLessThanOrEqual(24);
      await expect(nodes[2].querySelector('[data-bella-component="status-dot"]')?.className).toMatch(/neutral/);
    });
    await step('selected: 2px brand edge and the light-blue fill, size unchanged', async () => {
      await expect(getComputedStyle(nodes[3]).borderTopWidth).toBe('2px');
      await expect(getComputedStyle(nodes[3]).backgroundColor).not.toBe(getComputedStyle(nodes[0]).backgroundColor);
      await expect(Math.round(nodes[3].getBoundingClientRect().height)).toBe(Math.round(nodes[0].getBoundingClientRect().height));
    });
    await step('the dot meets the title edge and the word starts 8 after it', async () => {
      const n = nodes[0];
      const title = n.querySelector('span') as HTMLElement;
      const word = n.querySelector('[class*="status"] > span:last-child') as HTMLElement;
      const slot = n.querySelector('[data-bella-component="status-dot"]')!.firstElementChild as HTMLElement;
      const dotEl = slot.firstElementChild as HTMLElement;
      await expect(Math.round(dotEl.getBoundingClientRect().left)).toBe(Math.round(title.getBoundingClientRect().left));
      await expect(Math.round(word.getBoundingClientRect().left - dotEl.getBoundingClientRect().right)).toBe(8);
    });
  },
};

/** A button with aria-pressed: select toggles through the consumer, and the status is read once. */
export const Selecting: Story = {
  render: () => {
    const [on, setOn] = useState(false);
    return (
      <div style={{ padding: 'var(--spacing-24)' }}>
        <MapNode title="Gate" status="Healthy" selected={on} onSelect={() => setOn((v) => !v)} />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const n = canvasElement.querySelector('button') as HTMLElement;
    await expect(n).toHaveAttribute('aria-pressed', 'false');
    await expect(n).toHaveAccessibleName('Gate Healthy');
    await userEvent.click(n);
    await waitFor(() => expect(n).toHaveAttribute('aria-pressed', 'true'));
    n.blur();
    await userEvent.tab();
    await expect(n.textContent).toContain('Gate');
  },
};

/** Two nodes joined by a curve that follows their edges (the approved map). */
export const JoinedByACurve: Story = {
  render: () => (
    <div style={{ position: 'relative', inlineSize: '25rem', blockSize: '14rem', padding: 'var(--spacing-24)', boxSizing: 'border-box' }}>
      <div style={{ position: 'absolute', left: 24, top: 8 }}>
        <MapNode title="Contrast pairs" status="Healthy" />
      </div>
      <div style={{ position: 'absolute', left: 200, top: 132 }}>
        <MapNode title="Gate" status="Healthy" selected />
      </div>
      <MapLine direction="curve" tone="selected" from={{ x: 112, y: 72 }} to={{ x: 288, y: 132 }} />
    </div>
  ),
};
