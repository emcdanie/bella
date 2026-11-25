import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import Slide from './Slide';
import cssRaw from './Slide.module.css?raw';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))).sort();

const meta: Meta<typeof Slide> = {
  title: 'Components/Layout/Slide',
  component: Slide,
  parameters: { docs: { page: ComponentDocsPage }, bellaDocs: { tokens: consumedTokens } },
};
export default meta;
type Story = StoryObj<typeof Slide>;
import Heading from '../Heading/Heading';
import Stat from '../Stat/Stat';
import Eyebrow from '../Eyebrow/Eyebrow';

const wrap = { padding: 'var(--spacing-24)', background: 'var(--color-background-default)', display: 'grid', gap: 'var(--spacing-24)' } as const;

/** A content slide: an eyebrow, a heading and one big figure. Drawn at 1280 by 720 and scaled to the width it is given. */
export const Content: Story = {
  render: () => (
    <div style={wrap}>
      <Slide label="Slide 3: Health and drift">
        <Eyebrow tone="ink">Health and drift</Eyebrow>
        <Heading tier="page" as="h2">Parts that differ from Figma</Heading>
        <Stat size="display" label="Parts that differ" value="89 of 98" />
      </Slide>
    </div>
  ),
};

/** The same slide at three widths: it reads the same at the stage, the grid and a thumbnail. */
export const Scales: Story = {
  render: () => (
    <div style={wrap}>
      {['100%', '50%', '25%'].map((w) => (
        <div key={w} style={{ inlineSize: w }}>
          <Slide label={`Slide at ${w}`}>
            <Eyebrow tone="ink">Same slide</Eyebrow>
            <Heading tier="page" as="h2">{w} of the width</Heading>
          </Slide>
        </div>
      ))}
    </div>
  ),
};

/** Centred content, for an ask or a single line. */
export const Centered: Story = {
  render: () => (
    <div style={wrap}>
      <Slide label="Slide 10: The ask" centered>
        <Heading tier="page" as="h2">Less context, not more</Heading>
      </Slide>
    </div>
  ),
};
