import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';
import {
  expectKeyboardOperable,
  expectVisibleFocus,
  expectAriaStates,
  expectTouchTarget,
} from '../../testing/behavioral';
import FilterChip from './FilterChip';
import chipCssRaw from './FilterChip.module.css?raw';
import componentContract from '../../../tokens/component.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((chipCssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const chipContract =
  (componentContract as any).component?.['filter-chip']?.$extensions?.bella ?? {};

const meta: Meta<typeof FilterChip> = {
  title: 'Components/FilterChip',
  component: FilterChip,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: chipContract.a11y },
  },
  argTypes: {
    pressed: { control: 'boolean' },
    ariaLabel: { control: 'text' },
    onClick: { control: false },
    className: { control: false },
    children: { control: false },
  },
  args: { pressed: false },
};
export default meta;

type Story = StoryObj<typeof FilterChip>;

/** Rest and pressed side by side: the pressed fill is the state's paint. */
export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--spacing-2)', flexWrap: 'wrap' }}>
      <FilterChip pressed={false} onClick={() => {}}>
        Design systems
      </FilterChip>
      <FilterChip pressed onClick={() => {}}>
        AI enablement
      </FilterChip>
      <FilterChip pressed={false} onClick={() => {}}>
        Research
      </FilterChip>
    </div>
  ),
};

function FilterRowHarness() {
  const [on, setOn] = useState(false);
  const [activations, setActivations] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 'var(--spacing-2)', alignItems: 'center' }}>
      <FilterChip
        pressed={on}
        onClick={() => {
          setOn((v) => !v);
          setActivations((n) => n + 1);
        }}
      >
        Systems
      </FilterChip>
      <span data-testid="activation-count">{String(activations)}</span>
    </div>
  );
}

/** Behavioral suite: keyboard, focus, aria-pressed flips, touch target. */
export const Behavior: Story = {
  render: () => <FilterRowHarness />,
  play: async ({ canvas, step }) => {
    const chip = canvas.getByRole('button', { name: 'Systems' });

    await step('keyboard: Tab reaches, Enter/Space toggle', async () => {
      await expectKeyboardOperable(chip, () =>
        Number(canvas.getByTestId('activation-count').textContent ?? 0)
      );
    });

    await step('aria: pressed is a real state and it flips', async () => {
      const before = chip.getAttribute('aria-pressed') === 'true';
      expectAriaStates(chip, { pressed: before });
      chip.click();
      await waitFor(() => expectAriaStates(chip, { pressed: !before }));
    });

    await step('focus: visible ring', async () => {
      await expectVisibleFocus(chip);
    });

    await step('touch target: 44px minimum', async () => {
      expectTouchTarget(chip);
    });
  },
};
