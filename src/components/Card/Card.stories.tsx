import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import {
  expectKeyboardOperable,
  expectVisibleFocus,
} from '../../testing/behavioral';
import Card from './Card';

/* A self-contained SVG cover (data URI) so the media stories need no network
 * and no binary fixtures — iris-to-navy, the brand's own gradient. */
const cover =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 100">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#7A6BE8"/><stop offset="1" stop-color="#1B1B40"/>
      </linearGradient></defs>
      <rect width="160" height="100" fill="url(#g)"/>
      <circle cx="122" cy="30" r="34" fill="#A79CE2" opacity="0.55"/>
    </svg>`
  );

function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: 'block',
        fontSize: 'var(--typography-font-size-sm)',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: 'var(--typography-letter-spacing-wider)',
        color: 'var(--color-semantic-text-secondary)',
      }}
    >
      {children}
    </span>
  );
}

function Title({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: 'block',
        fontSize: 'var(--typography-font-size-xl)',
        fontWeight: 700,
        color: 'var(--color-semantic-text-primary)',
        lineHeight: 'var(--typography-line-height-snug)',
      }}
    >
      {children}
    </span>
  );
}

function Body({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: 'block',
        fontSize: 'var(--typography-font-size-base)',
        color: 'var(--color-semantic-text-secondary)',
        lineHeight: 'var(--typography-line-height-normal)',
      }}
    >
      {children}
    </span>
  );
}

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    docs: {
      description: {
        // TODO(elleta): the component description — one line, her voice.
        // Autodocs renders prop docs from Card.tsx TSDoc in the meantime.
        component: 'TODO(elleta): component description.',
      },
    },
  },
  args: {
    accent: 'var(--color-iris-bright)',
    variant: 'default',
  },
};
export default meta;

type Story = StoryObj<typeof Card>;

const sampleContent = (
  <>
    <Kicker>Design systems</Kicker>
    <Title>From drift to foundation</Title>
    <Body>
      Theme-aware by construction: this surface is the semantic card, so it
      flips to navy with light inks in dark mode on its own.
    </Body>
  </>
);

/** Static content card — the resting state, both themes. */
export const Default: Story = {
  render: (args) => (
    <div style={{ maxWidth: 420 }}>
      <Card {...args}>{sampleContent}</Card>
    </div>
  ),
};

/** Whole card is one link: hover lift + trace, visible focus ring. */
export const InteractiveLink: Story = {
  render: (args) => (
    <div style={{ maxWidth: 420 }}>
      <Card {...args} href="#card-link" ariaLabel="From drift to foundation">
        {sampleContent}
      </Card>
    </div>
  ),
};

/** Cover media above the body, with the ink-mix scrim. */
export const WithMedia: Story = {
  render: (args) => (
    <div style={{ maxWidth: 420 }}>
      <Card {...args} href="#card-media" ariaLabel="Case study: BELLA">
        {sampleContent}
      </Card>
    </div>
  ),
  args: {
    media: <img src={cover} alt="" />,
  },
};

/** Per-card identity accent (border tint + trace colour ride the prop). */
export const AccentOverride: Story = {
  render: (args) => (
    <div style={{ maxWidth: 420 }}>
      <Card {...args} accent="var(--color-brand-periwinkle)">
        {sampleContent}
      </Card>
    </div>
  ),
};

/** The fixed always-light reveal panel: floats light on navy, never flips.
 * The one recorded exception to theme-aware surfaces — light-on-dark is
 * legitimate; a fixed-dark variant does not exist. */
export const Peek: Story = {
  render: (args) => (
    <div style={{ maxWidth: 420 }}>
      <Card {...args} variant="peek">
        <Kicker>Fixed context</Kicker>
        <Title>Always-light panel</Title>
        <Body>
          Inks are re-scoped to the paper context, so dark mode cannot render
          light text on this light ground.
        </Body>
      </Card>
    </div>
  ),
};

/** Equal-height grid per RULES.md rule 2 — stretch + flex, no pixel floors. */
export const Grid: Story = {
  render: (args) => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 'var(--spacing-6)',
        alignItems: 'stretch',
      }}
    >
      <Card {...args}>{sampleContent}</Card>
      <Card {...args}>
        <Kicker>Short card</Kicker>
        <Title>Grows to match</Title>
      </Card>
      <Card {...args} accent="var(--color-brand-periwinkle)">
        <Kicker>Identity accent</Kicker>
        <Title>Sibling with its own colour</Title>
        <Body>Three siblings, one height, from the grid — never min-height.</Body>
      </Card>
    </div>
  ),
};

function BehaviorHarness() {
  const [count, setCount] = useState(0);
  return (
    <div style={{ maxWidth: 420 }}>
      <Card onClick={() => setCount((c) => c + 1)} ariaLabel="Activatable card">
        <Kicker>Behavioral template</Kicker>
        <Title>Activations: {count}</Title>
        <span
          data-testid="activation-count"
          style={{ color: 'var(--color-semantic-text-secondary)' }}
        >
          {String(count)}
        </span>
      </Card>
    </div>
  );
}

/** Behavioral suite from src/testing/behavioral.ts: keyboard, focus, states. */
export const Behavior: Story = {
  render: () => <BehaviorHarness />,
  play: async ({ canvas, step }) => {
    const card = canvas.getByRole('button', { name: 'Activatable card' });

    await step('keyboard: Tab reaches, Enter/Space activate', async () => {
      await expectKeyboardOperable(card, () =>
        Number(canvas.getByTestId('activation-count').textContent ?? 0)
      );
    });

    await step('focus: visible ring', async () => {
      await expectVisibleFocus(card);
    });

    await step('states: accessible name, single interactive element', async () => {
      expect(card).toHaveAccessibleName('Activatable card');
      expect(canvas.queryAllByRole('button')).toHaveLength(1);
      expect(canvas.queryAllByRole('link')).toHaveLength(0);
    });
  },
};
