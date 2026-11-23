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
  title: 'Components/Layout/ClientSwitcher',
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

/** variant="plain" (her 21 Nov pick "A, one plain line", CHIP Screen template 601:112027): the client's
 * name alone with a small ⌄, for the phone Projects drawer and the panel top. No tile, no caption. */
export const Plain: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--spacing-16)', padding: 'var(--spacing-24)', background: 'var(--color-background-surface)', maxInlineSize: 'calc(var(--spacing-80) * 3)' }}>
      <ClientSwitcher variant="plain" name="BELLA" caption="Design system" onClick={() => {}} />
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const b = canvasElement.querySelector('[data-bella-component="client-switcher"]') as HTMLElement;
    await step('the name and a ⌄ only: no tile, no caption', async () => {
      await expect(b).toHaveTextContent(/BELLA$/);
      await expect(b.textContent).not.toMatch(/Design system/);
      await expect(b.querySelectorAll('svg').length).toBe(1);
    });
    await step('the row keeps its 64 height and the 44 target', async () => {
      await expect(Math.round(b.getBoundingClientRect().height)).toBeGreaterThanOrEqual(64);
    });
  },
};

/** variant="plain" with `logo` (CHIP, 23 Nov 2026): the client's drawn logo stands where the name stood; the button is still
 * named "Switch client: BELLA" and keeps its ⌄ and its height. */
export const PlainLogo: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--spacing-16)', padding: 'var(--spacing-24)', background: 'var(--color-background-surface)', maxInlineSize: 'calc(var(--spacing-80) * 3)' }}>
      <ClientSwitcher variant="plain" name="BELLA" logo={<BrandWordmark word="BELLA" variant="ink" size="nav" />} onClick={() => {}} />
    </div>
  ),
  play: async ({ canvas, canvasElement, step }) => {
    const b = canvas.getByRole('button', { name: /^Switch client: BELLA$/ });
    await step('the logo draws, the name is only the accessible text', async () => {
      await expect(b.querySelectorAll('svg').length).toBe(2);
      await expect(b).toHaveAttribute('aria-haspopup', 'listbox');
    });
    await step('the row keeps its 64 height', async () => {
      await expect(Math.round(b.getBoundingClientRect().height)).toBeGreaterThanOrEqual(64);
      void canvasElement;
    });
  },
};
