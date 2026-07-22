import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import Heading from './Heading';
import headingCssRaw from './Heading.module.css?raw';
import componentContract from '../../../tokens/component.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((headingCssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const headingContract =
  (componentContract as any).component?.heading?.$extensions?.bella ?? {};

const meta: Meta<typeof Heading> = {
  title: 'Components/Heading',
  component: Heading,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: headingContract.a11y },
  },
  argTypes: {
    tier: { control: 'inline-radio' },
    as: { control: false },
    accent: { control: false },
    id: { control: false },
    className: { control: false },
    style: { control: false },
    children: { control: false },
  },
  args: { tier: 'section' },
};
export default meta;

type Story = StoryObj<typeof Heading>;

/** The three tiers on the ramp: hero 6xl, page 5xl, section 3xl. */
export const Tiers: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--spacing-6)' }}>
      <Heading tier="hero">Hero step</Heading>
      <Heading tier="page">Page title</Heading>
      <Heading tier="section">Section head</Heading>
    </div>
  ),
};

/** The established accent treatment: the key word wears the theme accent. */
export const WithAccent: Story = {
  render: () => (
    <Heading tier="page" accent="on purpose">
      Design systems,
    </Heading>
  ),
};

/** Semantic level decouples from the visual tier via `as`; the type never
 * drops below the display floor. */
export const Behavior: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--spacing-6)' }}>
      <Heading tier="section" as="h3" id="sub">
        Section look, h3 outline
      </Heading>
    </div>
  ),
  play: async ({ canvas, step }) => {
    await step('semantic level follows the as prop', async () => {
      const h = canvas.getByRole('heading', { level: 3, name: /section look/i });
      expect(h.id).toBe('sub');
    });

    await step('display face, uppercase, at or above the 24px floor', async () => {
      const h = canvas.getByRole('heading', { level: 3 });
      const cs = getComputedStyle(h);
      expect(cs.fontFamily).toMatch(/Unique/);
      expect(cs.textTransform).toBe('uppercase');
      expect(parseFloat(cs.fontSize)).toBeGreaterThanOrEqual(24);
      expect(parseFloat(cs.letterSpacing)).toBeGreaterThanOrEqual(0);
    });
  },
};
