import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import Tooltip from './Tooltip';
import Icon from '../Icon/Icon';
import cssRaw from './Tooltip.module.css?raw';
import componentContract from '../../../tokens/contracts.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))).sort();
const contract = (componentContract as any).component?.tooltip?.$extensions?.bella ?? {};

const meta: Meta<typeof Tooltip> = {
  title: 'Components/Actions/Tooltip',
  component: Tooltip,
  parameters: { docs: { page: ComponentDocsPage }, bellaDocs: { tokens: consumedTokens, a11y: contract.a11y } },
  argTypes: { children: { control: false }, className: { control: false } },
  args: { label: 'Read everything again', placement: 'bottom' },
};
export default meta;

type Story = StoryObj<typeof Tooltip>;

/** On an icon button: the button's aria-label and the bubble say the same words. Esc hides it. */
export const OnAnIconButton: Story = {
  render: (args) => (
    <div style={{ padding: 'var(--spacing-48)' }}>
      <Tooltip {...args}>
        <button
          type="button"
          aria-label={args.label}
          style={{ minWidth: 'var(--spacing-44)', minHeight: 'var(--spacing-44)', display: 'inline-grid', placeItems: 'center', border: 'var(--border-width-1) solid var(--color-border-strong)', borderRadius: 'var(--border-radius-round)', background: 'var(--color-background-surface)', color: 'var(--color-content-default)' }}
        >
          <Icon name="RefreshDouble" size="sm" />
        </button>
      </Tooltip>
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    const b = c.getByRole('button', { name: args.label });
    await expect(b.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
    b.focus();
    const tip = canvasElement.querySelector('[data-bella-component="tooltip"] [aria-hidden="true"]:not(svg)') as HTMLElement;
    await waitFor(() => expect(tip.hidden).toBe(false));
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(tip.hidden).toBe(true));
  },
};

/** kind="rich" (BellaComponents, 11 Nov 2026): a small hover card, the label
 * as its title plus rows. It describes the trigger (aria-describedby). */
export const Rich: Story = {
  args: { kind: 'rich', label: 'Saoirse · Figma librarian', rows: ['Doing: quiet since 14 Oct', 'Trust: Not measured'] },
  render: (args) => (
    <div style={{ padding: 'var(--spacing-12)', minHeight: 'calc(var(--spacing-20) * 2)' }}>
      <Tooltip {...args}>
        <button
          type="button"
          aria-label="Saoirse"
          style={{ minWidth: 'var(--spacing-44)', minHeight: 'var(--spacing-44)', display: 'inline-grid', placeItems: 'center', border: 'var(--border-width-1) solid var(--color-border-strong)', borderRadius: 'var(--border-radius-round)', background: 'var(--color-background-surface)', color: 'var(--color-content-default)' }}
        >
          <Icon name="Group" size="sm" />
        </button>
      </Tooltip>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const b = c.getByRole('button', { name: 'Saoirse' });
    b.focus();
    await expect(b).toHaveAccessibleDescription(/^Saoirse · Figma librarian\s+Doing: quiet since 14 Oct\s+Trust: Not measured$/);
    const card = document.getElementById(b.getAttribute('aria-describedby') as string) as HTMLElement;
    await waitFor(() => expect(card.hidden).toBe(false));
  },
};

/** Side placements: the bubble sits 8 to the left or right of a short label's trigger and its pointer is centred on the box, aimed at the trigger. */
export const SidePlacements: Story = {
  render: () => (
    <div style={{ padding: 'var(--spacing-48)', display: 'flex', gap: 'calc(var(--spacing-80) * 2)', justifyContent: 'center' }}>
      {(['left', 'right'] as const).map((p) => (
        <Tooltip key={p} label="Fit" placement={p}>
          <button type="button" aria-label="Fit" style={{ minWidth: 'var(--spacing-44)', minHeight: 'var(--spacing-44)', display: 'inline-grid', placeItems: 'center', border: 'var(--border-width-1) solid var(--color-border-strong)', borderRadius: 'var(--border-radius-8)', background: 'var(--color-background-surface)', color: 'var(--color-content-default)' }}>
            <Icon name="Expand" size="sm" />
          </button>
        </Tooltip>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const wraps = Array.from(canvasElement.querySelectorAll<HTMLElement>('[data-bella-component="tooltip"]'));
    for (const [i, w] of wraps.entries()) {
      (w.querySelector('button') as HTMLElement).focus();
      const tip = w.querySelector('[aria-hidden="true"]:not(svg)') as HTMLElement;
      await waitFor(() => expect(tip.hidden).toBe(false));
      const b = w.querySelector('button')!.getBoundingClientRect();
      const t = tip.getBoundingClientRect();
      await expect(Math.round(Math.abs(t.top + t.height / 2 - (b.top + b.height / 2)))).toBe(0);
      const gap = i === 0 ? b.left - t.right : t.left - b.right;
      await expect(Math.round(gap)).toBe(8);
      const pointer = getComputedStyle(tip, '::before');
      await expect(pointer.width).toBe('8px');
      await expect(pointer.height).toBe('16px');
    }
  },
};
