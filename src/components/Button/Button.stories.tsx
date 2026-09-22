import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';
import {
  expectKeyboardOperable,
  expectVisibleFocus,
  expectTouchTarget,
} from '../../testing/behavioral';
import Button from './Button';
import buttonCssRaw from './Button.module.css?raw';
import componentContract from '../../../tokens/component.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

/* Tokens consumed: extracted live from the committed stylesheet, so the
 * docs list cannot drift from the code. Buttons carry no trace ring (Card
 * only), so the trace recipe is no longer part of this list. */
const consumedTokens = Array.from(
  new Set(
    (buttonCssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) =>
      m.slice('var('.length)
    )
  )
)
  .sort();

const buttonContract = (componentContract as any).component?.button?.$extensions?.bella ?? {};

/* The autodocs page follows the Card template: description verbatim from
 * the committed TSDoc via docgen, curated controls, tokens consumed and
 * a11y notes from the contract. */
const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: {
      tokens: consumedTokens,
      a11y: buttonContract.a11y,
    },
  },
  argTypes: {
    variant: { control: 'inline-radio' },
    shape: { control: 'inline-radio' },
    href: { control: 'text' },
    ariaLabel: { control: 'text' },
    disabled: { control: 'boolean' },
    type: { control: false },
    onClick: { control: false },
    linkComponent: { control: false },
    className: { control: false },
    children: { control: false },
  },
  args: {
    variant: 'secondary',
    shape: 'default',
    disabled: false,
  },
};
export default meta;

type Story = StoryObj<typeof Button>;

/** The three tiers, one row: primary keycap, secondary outline, tertiary text. */
export const Tiers: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--spacing-5)', alignItems: 'center', flexWrap: 'wrap' }}>
      <Button variant="primary" onClick={() => {}}>
        Read the case
      </Button>
      <Button variant="secondary" onClick={() => {}}>
        See the system
      </Button>
      <Button variant="tertiary" onClick={() => {}}>
        All work
      </Button>
    </div>
  ),
};

/** Every tier in default and disabled. Hover and focus-visible roll the
 * label (never lift); active presses the primary keycap; reduced motion is
 * colour only. Live states, exercised by the Behavior story and the
 * rest-state assertions. */
export const States: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--spacing-5)' }}>
      {(['primary', 'secondary', 'tertiary'] as const).map((tier) => (
        <div
          key={tier}
          style={{ display: 'flex', gap: 'var(--spacing-5)', alignItems: 'center', flexWrap: 'wrap' }}
        >
          <Button variant={tier} onClick={() => {}}>
            {tier}
          </Button>
          <Button variant={tier} onClick={() => {}} disabled>
            {tier} disabled
          </Button>
        </div>
      ))}
    </div>
  ),
};

/** Shape: every tier shares the keycap radius by default; `shape="pill"`
 * rounds the ends fully. The label still reads once: the rolling copy is
 * aria-hidden. */
export const Shape: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--spacing-5)' }}>
      {(['default', 'pill'] as const).map((shape) => (
        <div
          key={shape}
          style={{ display: 'flex', gap: 'var(--spacing-5)', alignItems: 'center', flexWrap: 'wrap' }}
        >
          <Button variant="primary" shape={shape} onClick={() => {}}>
            Get in touch
          </Button>
          <Button variant="secondary" shape={shape} onClick={() => {}}>
            See the system
          </Button>
          <Button variant="tertiary" shape={shape} onClick={() => {}}>
            All work
          </Button>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvas, step }) => {
    await step('pill: fully rounded, name read once', async () => {
      const [square, pill] = canvas.getAllByRole('button', { name: 'Get in touch' });
      expect(pill).toHaveAccessibleName('Get in touch');
      expect(getComputedStyle(pill).borderTopLeftRadius).not.toBe(
        getComputedStyle(square).borderTopLeftRadius
      );
    });
  },
};

/** Anchor rendering: one link, external opens a new tab. */
export const AsLink: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--spacing-5)', alignItems: 'center' }}>
      <Button variant="primary" href="#work">
        Internal link
      </Button>
      <Button variant="secondary" href="https://elleta.design">
        External link
      </Button>
    </div>
  ),
};

function BehaviorHarness() {
  const [count, setCount] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 'var(--spacing-5)', alignItems: 'center' }}>
      <Button variant="primary" onClick={() => setCount((c) => c + 1)} ariaLabel="Send message">
        Send
      </Button>
      <span data-testid="activation-count">{String(count)}</span>
    </div>
  );
}

/** Behavioral suite from src/testing/behavioral.ts: keyboard, focus,
 * touch target, states. */
export const Behavior: Story = {
  render: () => <BehaviorHarness />,
  play: async ({ canvas, step }) => {
    const button = canvas.getByRole('button', { name: 'Send message' });

    await step('keyboard: Tab reaches, Enter/Space activate', async () => {
      await expectKeyboardOperable(button, () =>
        Number(canvas.getByTestId('activation-count').textContent ?? 0)
      );
    });

    await step('focus: visible ring', async () => {
      await expectVisibleFocus(button);
    });

    await step('touch target: 44px minimum', async () => {
      expectTouchTarget(button);
    });

    await step('roll: the label copy is aria-hidden, never read twice', async () => {
      const copies = button.querySelectorAll('[aria-hidden="true"]');
      expect(copies).toHaveLength(1);
      expect(copies[0].textContent).toBe('Send');
    });

    await step('states: accessible name, single interactive element', async () => {
      expect(button).toHaveAccessibleName('Send message');
      expect(canvas.queryAllByRole('button')).toHaveLength(1);
      expect(canvas.queryAllByRole('link')).toHaveLength(0);
    });
  },
};

/** Brand refresh (2026-09-22): the ring means focus only, hover is a
 * small shift per tier, and there is no accent colour at rest. */
export const RingAndHover: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--spacing-5)', alignItems: 'center', flexWrap: 'wrap' }}>
      <Button variant="primary" onClick={() => {}}>Let's talk</Button>
      <Button variant="secondary" onClick={() => {}}>See the work</Button>
      <Button variant="tertiary" onClick={() => {}}>Read the case</Button>
    </div>
  ),
  play: async ({ canvas, step }) => {
    const [primary, secondary, tertiary] = canvas.getAllByRole('button');
    await step('no ring at rest on any tier', async () => {
      for (const b of [primary, secondary, tertiary]) {
        await expect(getComputedStyle(b).outlineStyle).toBe('none');
      }
    });
    await step('keyboard focus: 3px ring, 3px offset', async () => {
      await userEvent.tab();
      const cs = getComputedStyle(primary);
      await expect(cs.outlineStyle).toBe('solid');
      await expect(parseFloat(cs.outlineWidth)).toBe(3);
      await expect(parseFloat(cs.outlineOffset)).toBe(3);
      primary.blur();
    });
    await step('secondary hover: the outline goes ink', async () => {
      const rest = getComputedStyle(secondary).borderTopColor;
      await userEvent.hover(secondary);
      await expect(getComputedStyle(secondary).borderTopColor).not.toBe(rest);
      await userEvent.unhover(secondary);
    });
    await step('tertiary hover: the underline thickens to 2px', async () => {
      const line = tertiary.querySelector('[data-bella-roll="window"]') as HTMLElement;
      await expect(parseFloat(getComputedStyle(line, '::after').height)).toBe(1);
      await userEvent.hover(tertiary);
      await expect(parseFloat(getComputedStyle(line, '::after').height)).toBe(2);
      await userEvent.unhover(tertiary);
    });
  },
};
