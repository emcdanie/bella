import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import MapLabel from './MapLabel';
import cssRaw from './MapLabel.module.css?raw';
import componentContract from '../../../tokens/contracts.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const contract = (componentContract as any).component?.['map-label']?.$extensions?.bella ?? {};

const meta: Meta<typeof MapLabel> = {
  title: 'Components/Data/MapLabel',
  component: MapLabel,
  parameters: { docs: { page: ComponentDocsPage }, bellaDocs: { tokens: consumedTokens, a11y: contract.a11y } },
  argTypes: { kind: { control: 'inline-radio' }, as: { control: 'inline-radio' }, className: { control: false }, style: { control: false } },
  args: { kind: 'stage', children: 'Sources' },
};
export default meta;
type Story = StoryObj<typeof MapLabel>;

export const Playground: Story = {};

/** The root is a rounded box; a stage name is bare bold text. */
export const Kinds: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--spacing-32)', alignItems: 'center', padding: 'var(--spacing-16)' }}>
      <MapLabel kind="root" style={{ inlineSize: '10rem' }}>BELLA pipeline</MapLabel>
      <MapLabel kind="stage">Sources</MapLabel>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const [root, stage] = Array.from(canvasElement.querySelectorAll<HTMLElement>('[data-bella-component="map-label"]'));
    await expect(getComputedStyle(root).borderRadius).toBe('20px');
    await expect(root.getBoundingClientRect().height).toBeGreaterThanOrEqual(64);
    await expect(getComputedStyle(stage).borderTopWidth).toBe('0px');
    await expect(getComputedStyle(stage).fontSize).toBe('20px');
    await expect(getComputedStyle(stage).fontWeight).toBe('600');
  },
};
