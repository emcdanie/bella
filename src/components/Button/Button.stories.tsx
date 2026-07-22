import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import {
  expectKeyboardOperable,
  expectVisibleFocus,
  expectTouchTarget,
} from '../../testing/behavioral';
import Button from './Button';
import buttonCssRaw from './Button.module.css?raw';
import traceCssRaw from '../shared/Trace.module.css?raw';
import componentContract from '../../../tokens/component.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

/* Tokens consumed: extracted live from the committed stylesheets (the
 * button module plus the shared trace recipe), so the docs list cannot
 * drift from the code. Component-local custom properties are detail. */
const consumedTokens = Array.from(
  new Set(
    ((buttonCssRaw + traceCssRaw).match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) =>
      m.slice('var('.length)
    )
  )
)
  .filter((v) => !v.startsWith('--cc') && !v.startsWith('--trace'))
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

/** Every tier in default and disabled; hover/active/focus are live states,
 * exercised by the Behavior story and the trace/rest assertions. */
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

    await step('states: accessible name, single interactive element', async () => {
      expect(button).toHaveAccessibleName('Send message');
      expect(canvas.queryAllByRole('button')).toHaveLength(1);
      expect(canvas.queryAllByRole('link')).toHaveLength(0);
    });
  },
};
