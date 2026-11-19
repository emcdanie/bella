import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { expectTouchTarget } from '../../testing/behavioral';
import ClientSwitcher from './ClientSwitcher';
import BrandWordmark from '../BrandWordmark/BrandWordmark';
import cssRaw from './ClientSwitcher.module.css?raw';
import componentContract from '../../../tokens/contracts.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const contract = (componentContract as any).component?.['client-switcher']?.$extensions?.bella ?? {};

const meta: Meta<typeof ClientSwitcher> = {
  title: 'Components/ClientSwitcher',
  component: ClientSwitcher,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: contract.a11y },
  },
  argTypes: { mark: { control: false }, className: { control: false }, style: { control: false } },
  args: { name: 'BELLA', caption: 'Design system' },
};
export default meta;

type Story = StoryObj<typeof ClientSwitcher>;

export const Playground: Story = {};

/** In the panel's 232 content width (story frame only); a second client swaps the mark. Hover and focus are CSS.
 * The theme toolbar picks the theme (audit:visual shoots all four). */
export const InPanel: Story = {
  render: () => (
    <div style={{ inlineSize: 232, padding: 'var(--spacing-16)', background: 'var(--color-background-default)', display: 'grid', gap: 'var(--spacing-16)' }}>
      <ClientSwitcher name="BELLA" caption="Design system" />
      <ClientSwitcher name="CHIP" caption="App" mark={<BrandWordmark word="CHIP" variant="mark" />} />
    </div>
  ),
};

/** Behavior: one button, named "Switch client" plus the visible name and caption, 44+ tall. */
export const Behavior: Story = {
  render: () => (
    <div style={{ inlineSize: 232 }}>
      <ClientSwitcher name="BELLA" caption="Design system" />
    </div>
  ),
  play: async ({ canvas }) => {
    const b = canvas.getByRole('button', { name: /^Switch client: BELLA\s*Design system$/ });
    expect(b).toHaveAttribute('aria-haspopup', 'listbox');
    expectTouchTarget(b);
  },
};
