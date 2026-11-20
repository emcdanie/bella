import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor } from 'storybook/test';
import Button from '../Button/Button';
import StatusPill from './StatusPill';
import pillCssRaw from './StatusPill.module.css?raw';
import componentContract from '../../../tokens/contracts.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((pillCssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const pillContract =
  (componentContract as any).component?.['status-pill']?.$extensions?.bella ?? {};

const meta: Meta<typeof StatusPill> = {
  title: 'Components/Data/StatusPill',
  component: StatusPill,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: pillContract.a11y },
  },
  argTypes: {
    variant: { control: 'inline-radio' },
    className: { control: false },
    children: { control: false },
  },
  args: { variant: 'accent' },
};
export default meta;

type Story = StoryObj<typeof StatusPill>;

/** Eight variants. The Bar map (TheBar.jsx b232e68):
 * working -> info · waiting on you -> attention · done -> success ·
 * serving -> serving · failed -> danger · parked -> quiet.
 * Rule: info and danger are fills only. Text beside, never on. */
export const Variants: Story = {
  render: () => (
    <div
      style={{
        maxWidth: 420,
        padding: 'var(--spacing-20)',
        background: 'var(--color-background-surface)',
        borderRadius: 'var(--border-radius-12)',
        display: 'flex',
        gap: 'var(--spacing-12)',
        flexWrap: 'wrap',
      }}
    >
      <StatusPill variant="accent">Current focus</StatusPill>
      <StatusPill variant="attention">Waiting on you</StatusPill>
      <StatusPill variant="info">Working</StatusPill>
      <StatusPill variant="success">Done</StatusPill>
      <StatusPill variant="serving">Serving</StatusPill>
      <StatusPill variant="danger">Failed</StatusPill>
      <StatusPill variant="quiet">Parked</StatusPill>
      <StatusPill variant="neutral">Neutral</StatusPill>
    </div>
  ),
};

/** The chip theme sets each variant's tokens: a soft wash, a same-hue label
 * that holds AAA on it, no border, Geist Mono at 16px (Elleta, 7 Nov 2026). */
export const ChipTheme: Story = {
  render: () => (
    <div
      data-theme="chip-light"
      style={{
        maxWidth: 420,
        padding: 'var(--spacing-20)',
        background: 'var(--color-background-surface)',
        display: 'flex',
        gap: 'var(--spacing-12)',
        flexWrap: 'wrap',
      }}
    >
      <StatusPill variant="attention">Waiting on you</StatusPill>
      <StatusPill variant="info">Do next</StatusPill>
      <StatusPill variant="success">Ready to review</StatusPill>
      <StatusPill variant="danger">Failed</StatusPill>
      <StatusPill variant="neutral">Gap</StatusPill>
    </div>
  ),
};

/** shape="dot": the state's mark only; the word is the accessible name
 * (CHIP's Today, Elleta 7 Nov 2026). */
export const Dot: Story = {
  render: () => (
    <div data-theme="chip-light" style={{ display: 'flex', gap: 'var(--spacing-12)', alignItems: 'center' }}>
      <StatusPill shape="dot" variant="attention">Waiting on you</StatusPill>
      <StatusPill shape="dot" variant="info">Do next</StatusPill>
      <StatusPill shape="dot" variant="success">Ready to review</StatusPill>
      <StatusPill shape="dot" variant="danger">Failed</StatusPill>
    </div>
  ),
};

/** Status-ladder: all eight variants across all four themes.
 * Attention = waiting on you; info = working; success = done;
 * serving = success outline; danger = failed; quiet = parked.
 * (Elleta, 14 Oct 2026) */
export const StatusLadder: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--spacing-20)' }}>
      {(['bella-light', 'bella-dark', 'chip-light', 'chip-dark'] as const).map((theme) => (
        <div
          key={theme}
          data-theme={theme}
          style={{
            padding: 'var(--spacing-16)',
            background: 'var(--color-background-surface)',
            borderRadius: 'var(--border-radius-12)',
            display: 'flex',
            gap: 'var(--spacing-12)',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <span style={{ fontFamily: 'var(--typography-font-family-dm-sans)', fontSize: 'var(--typography-label-default-font-size)', color: 'var(--color-content-subtle)', minWidth: '5rem' }}>{theme}</span>
          <StatusPill variant="attention">Waiting on you</StatusPill>
          <StatusPill variant="info">Working</StatusPill>
          <StatusPill variant="success">Done</StatusPill>
          <StatusPill variant="serving">Serving</StatusPill>
          <StatusPill variant="danger">Failed</StatusPill>
          <StatusPill variant="quiet">Parked</StatusPill>
        </div>
      ))}
    </div>
  ),
};

/** Non-interactive: no role, no tab stop; the state is readable from the
 * word alone. */
export const Behavior: Story = {
  render: () => <StatusPill variant="accent">Current focus</StatusPill>,
  play: async ({ canvas, step }) => {
    await step('non-interactive: no control roles, no tab stop', async () => {
      expect(canvas.queryAllByRole('button')).toHaveLength(0);
      expect(canvas.queryAllByRole('link')).toHaveLength(0);
      const el = canvas.getByText('Current focus');
      expect(el).not.toHaveAttribute('tabindex');
      expect(getComputedStyle(el).cursor).toBe('default');
    });
  },
};

function ChangeDemo() {
  const [merged, setMerged] = React.useState(false);
  return (
    <div style={{ display: 'flex', gap: 'var(--spacing-24)', alignItems: 'center', padding: 'var(--spacing-24)' }}>
      <StatusPill variant={merged ? 'success' : 'attention'}>{merged ? 'Merged' : 'In review'}</StatusPill>
      <Button variant="secondary" size="sm" onClick={() => setMerged((m) => !m)}>
        Change status
      </Button>
    </div>
  );
}

/** A status change (rule "Motion that shows what happened", item 7): the pill fades to its new tone,
 * once, on motion/duration/250. Reduced motion: the new tone at once. */
export const StatusChange: Story = {
  render: () => <ChangeDemo />,
  play: async ({ canvasElement, canvas, step }) => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pill = () => canvasElement.querySelector('[data-bella-component="status-pill"]') as HTMLElement;
    await step(reduced ? 'reduced motion: no fade' : 'the colour fades on the motion token', async () => {
      const ms = parseFloat(getComputedStyle(pill()).transitionDuration) * (getComputedStyle(pill()).transitionDuration.endsWith('ms') ? 1 : 1000);
      await expect(ms).toBe(reduced ? 0 : 250);
    });
    await step('a change shows the new word and tone', async () => {
      const before = getComputedStyle(pill()).borderColor;
      await userEvent.click(canvas.getByRole('button', { name: 'Change status' }));
      await expect(pill()).toHaveTextContent('Merged');
      await waitFor(() => expect(getComputedStyle(pill()).borderColor).not.toBe(before), { timeout: 2000 });
    });
  },
};
