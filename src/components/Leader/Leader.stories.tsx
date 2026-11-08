import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';
import Leader from './Leader';
import Pin from '../Pin/Pin';
import cssRaw from './Leader.module.css?raw';
import componentContract from '../../../tokens/component.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const contract = (componentContract as any).component?.leader?.$extensions?.bella ?? {};

const meta: Meta<typeof Leader> = {
  title: 'Components/Leader',
  component: Leader,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: contract.a11y },
  },
  argTypes: {
    variant: { control: 'inline-radio' },
    end: { control: 'inline-radio' },
    className: { control: false },
    style: { control: false },
  },
  args: { from: '#leader-a', to: '#leader-b', label: 'Pin 3 points to what it explains', variant: 'blue', end: 'arrow' },
};
export default meta;

type Story = StoryObj<typeof Leader>;

/** Measured from one element to the other, in their positioned parent. */
export const SideBySide: Story = {
  render: (args) => (
    <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 'var(--spacing-16)', paddingBlock: 'var(--spacing-8)' }}>
      <span id="leader-a"><Pin number="3" variant={args.variant} label="Box" /></span>
      <span id="leader-b" style={{ marginTop: 'var(--spacing-12)', color: 'var(--color-semantic-text-primary)' }}>What it explains</span>
      <Leader {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const svg = canvasElement.querySelector('[data-bella-component="leader"]');
    await waitFor(() => expect(svg?.querySelector('path')?.getAttribute('d')).toMatch(/^M/));
  },
};

/** The dot landing, for a line that ends on a part. */
export const DotEnd: Story = {
  ...SideBySide,
  args: { end: 'dot', variant: 'red' },
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(canvasElement.querySelector('[data-bella-component="leader"] circle')).toBeTruthy());
  },
};
