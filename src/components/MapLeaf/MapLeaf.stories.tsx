import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent } from 'storybook/test';
import MapLeaf from './MapLeaf';
import cssRaw from './MapLeaf.module.css?raw';
import componentContract from '../../../tokens/contracts.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const contract = (componentContract as any).component?.['map-leaf']?.$extensions?.bella ?? {};

const meta: Meta<typeof MapLeaf> = {
  title: 'Components/Data/MapLeaf',
  component: MapLeaf,
  parameters: { docs: { page: ComponentDocsPage }, bellaDocs: { tokens: consumedTokens, a11y: contract.a11y } },
  argTypes: { state: { control: 'select' }, onSelect: { control: false }, className: { control: false }, style: { control: false } },
  args: { name: 'Tokens', state: 'ok', status: 'Healthy', detail: '407 CSS variables', selected: false, related: false },
  render: (args) => (
    <div style={{ inlineSize: '16rem', padding: 'var(--spacing-16)', background: 'var(--color-background-canvas, var(--color-background-surface))' }}>
      <MapLeaf {...args} />
    </div>
  ),
};
export default meta;
type Story = StoryObj<typeof MapLeaf>;

export const Playground: Story = {};

/** One shape and word per state, so colour is never the only cue. */
export const States: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--spacing-8)', inlineSize: '16rem', padding: 'var(--spacing-16)' }}>
      <MapLeaf name="Tokens" state="ok" status="Healthy" detail="407 CSS variables" />
      <MapLeaf name="Contracts" state="attention" status="Needs you" detail="91 of 93" />
      <MapLeaf name="Pixel check" state="failed" status="Red items" />
      <MapLeaf name="Compare" state="blocked" status="Blocked" />
      <MapLeaf name="Hook" state="unmeasured" status="Not measured" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const shapes = Array.from(canvasElement.querySelectorAll('[data-bella-component="map-leaf"] svg')).map((s) => s.innerHTML);
    await expect(new Set(shapes).size).toBe(5);
    for (const b of Array.from(canvasElement.querySelectorAll('button'))) await expect(b.textContent?.length).toBeGreaterThan(8);
  },
};

/** selected is MapNode's look; related is a 1px edge; the target is 44 tall. */
export const SelectedAndRelated: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--spacing-8)', inlineSize: '16rem', padding: 'var(--spacing-16)' }}>
      <MapLeaf name="Contracts" state="attention" status="Needs you" selected />
      <MapLeaf name="Tokens" state="ok" status="Healthy" related />
      <MapLeaf name="Gate" state="ok" status="Healthy" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const [sel, rel, plain] = Array.from(canvasElement.querySelectorAll('button'));
    await expect(sel).toHaveAttribute('aria-pressed', 'true');
    await expect(plain).toHaveAttribute('aria-pressed', 'false');
    await expect(getComputedStyle(sel).borderTopWidth).toBe('2px');
    await expect(getComputedStyle(rel).borderTopWidth).toBe('1px');
    await expect(plain.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
  },
};

/** Click, Enter and Space select; Tab reaches it and draws the focus ring. */
export const Keyboard: Story = {
  args: { onSelect: fn() },
  play: async ({ canvasElement, args }) => {
    const b = canvasElement.querySelector('button') as HTMLButtonElement;
    await userEvent.tab();
    await expect(b).toHaveFocus();
    await expect(getComputedStyle(b).outlineStyle).toBe('solid');
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    await userEvent.click(b);
    await expect(args.onSelect).toHaveBeenCalledTimes(3);
  },
};
