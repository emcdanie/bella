import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import Tooltip from './Tooltip';
import Icon from '../Icon/Icon';
import cssRaw from './Tooltip.module.css?raw';
import componentContract from '../../../tokens/component.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))).sort();
const contract = (componentContract as any).component?.tooltip?.$extensions?.bella ?? {};

const meta: Meta<typeof Tooltip> = {
  title: 'Components/Tooltip',
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
    <div style={{ padding: 'var(--spacing-12)' }}>
      <Tooltip {...args}>
        <button
          type="button"
          aria-label={args.label}
          style={{ minWidth: 'var(--spacing-touch-target)', minHeight: 'var(--spacing-touch-target)', display: 'inline-grid', placeItems: 'center', border: 'var(--border-width-thin) solid var(--color-semantic-border-strong)', borderRadius: 'var(--radius-full)', background: 'var(--color-semantic-surface-card)', color: 'var(--color-semantic-text-primary)' }}
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
          style={{ minWidth: 'var(--spacing-touch-target)', minHeight: 'var(--spacing-touch-target)', display: 'inline-grid', placeItems: 'center', border: 'var(--border-width-thin) solid var(--color-semantic-border-strong)', borderRadius: 'var(--radius-full)', background: 'var(--color-semantic-surface-card)', color: 'var(--color-semantic-text-primary)' }}
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
