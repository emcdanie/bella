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
import componentContract from '../../../tokens/contracts.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((chipCssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const chipContract =
  (componentContract as any).component?.['filter-chip']?.$extensions?.bella ?? {};

const meta: Meta<typeof FilterChip> = {
  title: 'Components/Actions/FilterChip',
  component: FilterChip,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: chipContract.a11y },
  },
  argTypes: {
    selected: { control: 'boolean' },
    size: { control: 'inline-radio', options: ['md', 'sm'] },
    disabled: { control: 'boolean' },
    ariaLabel: { control: 'text' },
    onClick: { control: false },
    className: { control: false },
    children: { control: false },
  },
  args: { selected: false },
};
export default meta;

type Story = StoryObj<typeof FilterChip>;

/** Rest, selected and disabled side by side: the light-blue fill and the bold label are the selected state's paint. */
export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--spacing-8)', flexWrap: 'wrap' }}>
      <FilterChip selected={false} onClick={() => {}}>
        Design systems
      </FilterChip>
      <FilterChip selected onClick={() => {}}>
        AI enablement
      </FilterChip>
      <FilterChip selected={false} onClick={() => {}}>
        Research
      </FilterChip>
      <FilterChip selected={false} disabled onClick={() => {}}>
        Not measured
      </FilterChip>
    </div>
  ),
};

/** sm: a long wrapping row of tag filters; the 44px target stays. */
export const Small: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--spacing-4) var(--spacing-8)', flexWrap: 'wrap', maxWidth: 320 }}>
      {['answer', 'decision', 'handoff', 'loop', 'note', 'plan'].map((t, i) => (
        <FilterChip key={t} size="sm" selected={i === 1} onClick={() => {}}>
          {t}
        </FilterChip>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const chip of canvasElement.querySelectorAll('button')) {
      expect(chip.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
      expect(getComputedStyle(chip).fontSize).toBe('16px');
    }
  },
};

function FilterRowHarness() {
  const [on, setOn] = useState(false);
  const [activations, setActivations] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 'var(--spacing-8)', alignItems: 'center' }}>
      <FilterChip
        selected={on}
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

    await step('aria: selected is a real state (aria-pressed) and it flips', async () => {
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

/** disabled (25 Nov 2026): the native attribute, so it takes no click or
 * focus; the grey word and the faint edge. */
export const Disabled: Story = {
  render: () => (
    <FilterChip selected={false} disabled onClick={() => {}}>
      Not measured
    </FilterChip>
  ),
  play: async ({ canvas }) => {
    const chip = canvas.getByRole('button', { name: 'Not measured' });
    await expect(chip).toBeDisabled();
    chip.focus();
    await expect(chip).not.toHaveFocus();
  },
};
