import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';
import ActionChip from './ActionChip';
import chipCssRaw from './ActionChip.module.css?raw';
import componentContract from '../../../tokens/contracts.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((chipCssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const chipContract = (componentContract as any).component?.['action-chip']?.$extensions?.bella ?? {};

const meta: Meta<typeof ActionChip> = {
  title: 'Components/Actions/ActionChip',
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
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-8)', maxWidth: 520 }}>
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
    <div style={{ display: 'flex', gap: 'var(--spacing-12)', alignItems: 'center' }}>
      <ActionChip onClick={() => setN((x) => x + 1)}>Copy as proposal</ActionChip>
      <span data-testid="n">{n}</span>
    </div>
  );
}

/** Behavioral suite: a real button, sentence case, 44px, no toggle state. */
/** Quiet: an icon action beside content (the ⋯ menu): no border at rest. */
export const Quiet: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--spacing-12)', alignItems: 'center' }}>
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

/* Figma re-sync (19 Nov 2026): variant x state in Chip light and Chip dark;
 * corner border/radius/lg (8 in Chip), label 600. Hover and focus are live. */
export const ChipThemes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--spacing-16)' }}>
      {(['chip-light', 'chip-dark'] as const).map((theme) => (
        <div key={theme} data-theme={theme} style={{ padding: 'var(--spacing-24)', background: 'var(--color-background-surface)', display: 'flex', gap: 'var(--spacing-16)', flexWrap: 'wrap' }}>
          <ActionChip label="Run" onClick={() => {}} />
          <ActionChip onClick={() => {}}>Try in sandbox</ActionChip>
          <ActionChip variant="quiet" onClick={() => {}}>Try in sandbox</ActionChip>
          <ActionChip disabled>Unavailable</ActionChip>
        </div>
      ))}
    </div>
  ),
};

function BusyDemo() {
  const [busy, setBusy] = useState(false);
  const [asks, setAsks] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 'var(--spacing-12)', alignItems: 'center', padding: 'var(--spacing-24)' }}>
      <ActionChip
        busy={busy}
        onClick={() => {
          setAsks((n) => n + 1);
          setBusy(true);
        }}
      >
        Ask
      </ActionChip>
      <span data-testid="asks" style={{ fontFamily: 'var(--typography-number-font-family)', color: 'var(--color-content-default)' }}>
        {asks}
      </span>
    </div>
  );
}

/** busy (as Button busy, motion item 1): the question is on its way, so an icon turns before the
 * label and clicks wait. The label stays. Reduced motion: the icon holds still. */
export const Busy: Story = {
  render: () => <BusyDemo />,
  play: async ({ canvas, step }) => {
    const chip = canvas.getByRole('button', { name: /Ask/ });
    await step('a click starts it: aria-busy, the icon turns', async () => {
      await userEvent.click(chip);
      await expect(chip).toHaveAttribute('aria-busy', 'true');
      const turn = chip.querySelector('[class*="turn"]') as HTMLElement;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      await expect(getComputedStyle(turn).animationName).toMatch(reduced ? /^none$/ : /chipTurn/);
    });
    await step('while busy, clicks wait', async () => {
      await userEvent.click(chip);
      await expect(canvas.getByTestId('asks')).toHaveTextContent('1');
    });
  },
};

/** disabled (kept, 25 Nov 2026): the native attribute, so it takes no click
 * or focus; the grey word and the faint edge, and hover does not paint it. */
export const Disabled: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--spacing-8)' }}>
      <ActionChip onClick={() => {}}>Copy as proposal</ActionChip>
      <ActionChip disabled onClick={() => {}}>Nothing to copy</ActionChip>
    </div>
  ),
  play: async ({ canvas }) => {
    const chip = canvas.getByRole('button', { name: 'Nothing to copy' });
    await expect(chip).toBeDisabled();
    chip.focus();
    await expect(chip).not.toHaveFocus();
  },
};
