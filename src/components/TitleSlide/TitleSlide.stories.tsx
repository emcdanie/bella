import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import TitleSlide from './TitleSlide';
import cssRaw from './TitleSlide.module.css?raw';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))).sort();

const meta: Meta<typeof TitleSlide> = {
  title: 'Components/Layout/TitleSlide',
  component: TitleSlide,
  parameters: { docs: { page: ComponentDocsPage }, bellaDocs: { tokens: consumedTokens } },
};
export default meta;
type Story = StoryObj<typeof TitleSlide>;

const wrap = { padding: 'var(--spacing-24)', background: 'var(--color-background-default)' } as const;

/** The opening or closing slide: eyebrow, hero title, one lead sentence and a foot line. */
export const Default: Story = {
  render: () => (
    <div style={wrap}>
      <TitleSlide
        eyebrow="CHIP for BELLA"
        title="Less context, not more"
        lead="CHIP checks Figma, the specs and the code against each other, and says which parts have drifted."
        footer="Tuesday 24 November"
      />
    </div>
  ),
};

/** Only a title: the lead and the foot line leave no gap. */
export const TitleOnly: Story = {
  render: () => (
    <div style={wrap}>
      <TitleSlide title="Thank you" />
    </div>
  ),
};
