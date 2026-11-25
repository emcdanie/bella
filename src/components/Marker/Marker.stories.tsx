import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import Marker from './Marker';
import cssRaw from './Marker.module.css?raw';
import componentContract from '../../../tokens/contracts.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const contract = (componentContract as any).component?.marker?.$extensions?.bella ?? {};

const meta: Meta<typeof Marker> = {
  title: 'Components/Content/Marker',
  component: Marker,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: contract.a11y },
  },
  argTypes: { children: { control: 'text' }, className: { control: false }, style: { control: false } },
  args: { children: 'the key phrase' },
};
export default meta;

type Story = StoryObj<typeof Marker>;

const LINE: React.CSSProperties = {
  margin: 0,
  inlineSize: 'calc(var(--spacing-80) * 6)',
  maxInlineSize: '100%',
  fontFamily: 'var(--typography-body-default-font-family)',
  fontSize: 'var(--typography-font-size-16)',
  lineHeight: 'var(--typography-line-height-px-24)',
  color: 'var(--color-content-default)',
};

/** The part alone, as Figma draws it: the phrase at 600 over a 10 band, 2 above the line's bottom. */
export const Default: Story = {
  render: (args) => (
    <p style={LINE}>
      <Marker {...args} />
    </p>
  ),
  play: async ({ canvasElement, step }) => {
    const mark = canvasElement.querySelector('mark') as HTMLElement;
    await step('weight 600, ink inherited, a band in the lower half', async () => {
      const cs = getComputedStyle(mark);
      await expect(cs.fontWeight).toBe('600');
      await expect(cs.backgroundImage).toContain('linear-gradient');
      await expect(cs.color).toBe(getComputedStyle(mark.parentElement as HTMLElement).color);
    });
    await step('the band starts at the middle of the 24 line; in Lexend (Chip) it is 10 tall and ends 2 above the line (Figma 1600:45992)', async () => {
      const r = mark.getBoundingClientRect();
      const line = (mark.parentElement as HTMLElement).getBoundingClientRect();
      // the band is the lower half of the content box, which is centred on the line
      const bandTop = r.top + r.height / 2;
      await expect(Math.round(bandTop - line.top)).toBe(12);
      if (getComputedStyle(mark).fontFamily.startsWith('Lexend')) {
        await expect(Math.round(r.bottom - bandTop)).toBe(10);
        await expect(Math.round(line.bottom - r.bottom)).toBe(2);
      }
    });
  },
};

/** In a sentence: one key phrase per paragraph; the rest of the line stays 400. */
export const InASentence: Story = {
  render: () => (
    <p style={LINE}>
      Two parts fail because the <Marker>focus ring is missing</Marker> on the close button. Fix it in BELLA, then re-run the gate.
    </p>
  ),
};

/** Wraps with its line: every line of the phrase keeps its own band (box-decoration-break: clone). */
export const Wrapping: Story = {
  render: () => (
    <p style={{ ...LINE, inlineSize: 'calc(var(--spacing-80) * 3)' }}>
      The answer is that <Marker>tokens drive every theme and every part</Marker> in BELLA.
    </p>
  ),
  play: async ({ canvasElement, step }) => {
    await step('the phrase wraps over more than one line', async () => {
      const mark = canvasElement.querySelector('mark') as HTMLElement;
      await expect(mark.getClientRects().length).toBeGreaterThan(1);
    });
  },
};

/** On the card and the page in a dark theme (use the theme toolbar): the band is the dark wash, the ink stays 7:1. */
export const OnSurfaces: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--spacing-16)' }}>
      <p style={{ ...LINE, padding: 'var(--spacing-16)', background: 'var(--color-background-surface)', borderRadius: 'var(--border-radius-12)' }}>
        On a card: <Marker>three checks fail</Marker>.
      </p>
      <p style={{ ...LINE, padding: 'var(--spacing-16)', background: 'var(--color-background-default)', borderRadius: 'var(--border-radius-12)' }}>
        On the page: <Marker>three checks fail</Marker>.
      </p>
    </div>
  ),
};
