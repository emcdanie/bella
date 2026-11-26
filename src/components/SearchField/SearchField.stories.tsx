import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';
import { expectTouchTarget } from '../../testing/behavioral';
import SearchField from './SearchField';
import cssRaw from './SearchField.module.css?raw';
import componentContract from '../../../tokens/contracts.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const contract = (componentContract as any).component?.['search-field']?.$extensions?.bella ?? {};

const THEMES = ['chip-light', 'chip-dark'] as const;

const meta: Meta<typeof SearchField> = {
  title: 'Components/Inputs/SearchField',
  component: SearchField,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: contract.a11y },
  },
  argTypes: { className: { control: false }, style: { control: false } },
  args: { placeholder: 'Search', showShortcut: true },
};
export default meta;

type Story = StoryObj<typeof SearchField>;

export const Playground: Story = {};

/** With and without the shortcut, empty and typed, on the top bar's surface, Chip light and Chip dark. Focus is CSS. */
export const States: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--spacing-16)' }}>
      {THEMES.map((theme) => (
        <div
          key={theme}
          data-theme={theme}
          style={{ padding: 'var(--spacing-24)', background: 'var(--color-background-surface)', display: 'grid', gap: 'var(--spacing-16)', maxInlineSize: 480 }}
        >
          <SearchField />
          <SearchField defaultValue="chip/theme" />
          <SearchField showShortcut={false} placeholder="Search projects" />
        </div>
      ))}
    </div>
  ),
};

/** Fill: in a menu's Find row the field takes the row beside its filter button, edge to edge with the menu rows
 * (CHIP's phone menu sheet, 26 Nov 2026). Without fill it stops at 420. */
export const Fill: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--spacing-16)', maxInlineSize: 680, padding: 'var(--spacing-8)', background: 'var(--color-background-surface)' }}>
      <SearchField fill showShortcut={false} placeholder="Find" />
      <SearchField showShortcut={false} placeholder="Find" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const [filled, capped] = Array.from(canvasElement.querySelectorAll('[data-bella-component="search-field"]')) as HTMLElement[];
    expect(filled.getBoundingClientRect().width).toBeGreaterThan(capped.getBoundingClientRect().width);
  },
};

/** Behavior: a searchbox named by its placeholder, ⌘K focuses it, 44 tall. */
export const Behavior: Story = {
  render: () => <SearchField />,
  play: async ({ canvas, step }) => {
    const box = canvas.getByRole('searchbox', { name: 'Search' });
    await step('Ctrl K focuses the field', async () => {
      await userEvent.keyboard('{Control>}k{/Control}');
      expect(document.activeElement).toBe(box);
    });
    await step('the field is 44 tall', async () => {
      expectTouchTarget(box.closest('label') as HTMLElement);
    });
  },
};
