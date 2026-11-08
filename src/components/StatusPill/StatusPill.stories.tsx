import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import StatusPill from './StatusPill';
import pillCssRaw from './StatusPill.module.css?raw';
import componentContract from '../../../tokens/component.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((pillCssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const pillContract =
  (componentContract as any).component?.['status-pill']?.$extensions?.bella ?? {};

const meta: Meta<typeof StatusPill> = {
  title: 'Components/StatusPill',
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
        padding: 'var(--spacing-5)',
        background: 'var(--color-semantic-surface)',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        gap: 'var(--spacing-3)',
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
      data-theme="chip"
      style={{
        maxWidth: 420,
        padding: 'var(--spacing-5)',
        background: 'var(--color-semantic-surface-card)',
        display: 'flex',
        gap: 'var(--spacing-3)',
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
    <div data-theme="chip" style={{ display: 'flex', gap: 'var(--spacing-3)', alignItems: 'center' }}>
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
    <div style={{ display: 'grid', gap: 'var(--spacing-5)' }}>
      {(['light', 'dark', 'warm'] as const).map((theme) => (
        <div
          key={theme}
          data-theme={theme}
          style={{
            padding: 'var(--spacing-4)',
            background: 'var(--color-semantic-surface)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            gap: 'var(--spacing-3)',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <span style={{ fontFamily: 'var(--typography-font-family-body)', fontSize: 'var(--typography-font-size-label)', color: 'var(--color-semantic-text-secondary)', minWidth: '5rem' }}>{theme}</span>
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
