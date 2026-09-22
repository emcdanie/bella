import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import PatternField from '../components/PatternField/PatternField';
import Heading from '../components/Heading/Heading';
import Eyebrow from '../components/Eyebrow/Eyebrow';

const meta: Meta<typeof PatternField> = {
  title: 'Brand/Pattern',
  component: PatternField,
  args: { seed: 7 },
};
export default meta;
type Story = StoryObj<typeof PatternField>;

/** PatternField behind a page opening: greyscale at about 7%, fading out
 * from the upper right. In dark it is inverted grey at about 6%. */
export const HeroField: Story = {
  render: (args) => (
    <section
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: 'var(--spacing-20) var(--spacing-6)',
        borderBottom: '1px solid var(--color-semantic-border)',
      }}
    >
      <PatternField {...args} />
      <div style={{ position: 'relative', display: 'grid', rowGap: 'var(--spacing-4)' }}>
        <Eyebrow>Elleta McDaniel · near Barcelona</Eyebrow>
        <Heading tier="page" as="h1" accent="systems." after={undefined}>
          AI-enabled design
        </Heading>
        <p style={{ margin: 0, maxWidth: '40ch', fontSize: 'var(--typography-font-size-xl)', color: 'var(--color-semantic-text-secondary)' }}>
          Tokens, components and the governance that keeps them honest.
        </p>
      </div>
    </section>
  ),
};

/** The same seed draws the same field; a new seed a new one. */
export const AnotherSeed: Story = { ...HeroField, args: { seed: 1234 } };

export const Behavior: Story = {
  ...HeroField,
  play: async ({ canvasElement, step }) => {
    const field = canvasElement.querySelector('[data-bella-component="pattern-field"]') as SVGElement;
    await step('decorative: hidden from assistive tech and from the pointer', async () => {
      await expect(field.getAttribute('aria-hidden')).toBe('true');
      await expect(getComputedStyle(field).pointerEvents).toBe('none');
    });
    await step('quiet: opacity from the token, well under 10%', async () => {
      await expect(parseFloat(getComputedStyle(field).opacity)).toBeLessThan(0.1);
    });
  },
};
