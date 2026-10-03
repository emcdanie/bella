import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';
import ActionChip from './ActionChip';
import chipCssRaw from './ActionChip.module.css?raw';
import componentContract from '../../../tokens/component.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((chipCssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const chipContract = (componentContract as any).component?.['action-chip']?.$extensions?.bella ?? {};

const meta: Meta<typeof ActionChip> = {
  title: 'Components/ActionChip',
  component: ActionChip,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: chipContract.a11y },
  },
  args: { children: 'Try in sandbox' },
};
export default meta;

type Story = StoryObj<typeof ActionChip>;

/** One quiet action, sentence case. */
export const Default: Story = {};

/** The row under an OBI answer, and suggestions that wrap. */
export const Row: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-2)', maxWidth: 520 }}>
      <ActionChip onClick={() => {}}>Try in sandbox</ActionChip>
      <ActionChip onClick={() => {}}>Copy as proposal</ActionChip>
      <ActionChip onClick={() => {}}>Save to Card notes</ActionChip>
      <ActionChip onClick={() => {}}>Which components have no story?</ActionChip>
      <ActionChip href="#atlas">Open Atlas</ActionChip>
      <ActionChip disabled>Nothing to copy</ActionChip>
    </div>
  ),
};

function Counter() {
  const [n, setN] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 'var(--spacing-3)', alignItems: 'center' }}>
      <ActionChip onClick={() => setN((x) => x + 1)}>Copy as proposal</ActionChip>
      <span data-testid="n">{n}</span>
    </div>
  );
}

/** Behavioral suite: a real button, sentence case, 44px, no toggle state. */
/** Quiet: an icon action beside content (the ⋯ menu): no border at rest. */
export const Quiet: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--spacing-3)', alignItems: 'center' }}>
      <span>Checks</span>
      <ActionChip variant="quiet" ariaLabel="Checks: visibility and status" onClick={() => {}}>
        ⋯
      </ActionChip>
    </div>
  ),
};

export const Behavior: Story = {
  render: () => <Counter />,
  play: async ({ canvas, step }) => {
    const chip = canvas.getByRole('button', { name: 'Copy as proposal' });
    await step('a button without aria-pressed: an action, not a toggle', async () => {
      expect(chip.tagName).toBe('BUTTON');
      expect(chip).not.toHaveAttribute('aria-pressed');
    });
    await step('sentence case and at least 44px tall', async () => {
      expect(getComputedStyle(chip).textTransform).toBe('none');
      expect(chip.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
    });
    await step('keyboard: Enter runs it', async () => {
      chip.focus();
      await userEvent.keyboard('{Enter}');
      expect(canvas.getByTestId('n').textContent).toBe('1');
    });
  },
};
