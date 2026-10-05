import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor } from 'storybook/test';
import Combobox, { type ComboboxGroup } from './Combobox';
import Kbd from '../Kbd/Kbd';
import comboCssRaw from './Combobox.module.css?raw';
import componentContract from '../../../tokens/component.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((comboCssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const comboContract = (componentContract as any).component?.combobox?.$extensions?.bella ?? {};

const meta: Meta<typeof Combobox> = {
  title: 'Components/Combobox',
  component: Combobox,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: comboContract.a11y },
  },
};
export default meta;

type Story = StoryObj<typeof Combobox>;

const COMPONENTS = ['Button', 'Card', 'Combobox', 'DataTable', 'Input', 'ResourceCard', 'Stat', 'Tabs'];

function groupsFor(q: string): ComboboxGroup[] {
  const t = q.trim().toLowerCase();
  if (!t) return [];
  return [
    {
      id: 'jump',
      label: 'Jump to',
      options: COMPONENTS.filter((c) => c.toLowerCase().includes(t)).map((c) => ({ id: c, label: c, meta: 'Component' })),
    },
    { id: 'ask', label: 'Ask OBI', options: [{ id: 'ask', label: `Ask OBI: ${q.trim()}`, meta: 'Looking at Atlas · Card' }] },
  ];
}

function Harness({ start = '' }: { start?: string }) {
  const [q, setQ] = useState(start);
  const [picked, setPicked] = useState('none');
  const groups = groupsFor(q);
  const exact = COMPONENTS.find((c) => c.toLowerCase() === q.trim().toLowerCase());
  return (
    <div style={{ display: 'grid', gap: 'var(--spacing-3)', maxWidth: 560, minHeight: 'calc(var(--spacing-20) * 4)' }}>
      <Combobox
        label="Ask OBI or jump to"
        hideLabel
        value={q}
        onChange={setQ}
        groups={groups}
        defaultOptionId={exact ?? 'ask'}
        onSelect={(o) => setPicked(o.id)}
        placeholder="Ask OBI or jump to…"
        hint={<Kbd keys={['⌘', 'K']} label="Command K" />}
      />
      <span data-testid="picked">{picked}</span>
    </div>
  );
}

/** Closed: one field, the shortcut at its end. */
export const Default: Story = {
  render: () => <Harness />,
};

/** Open: "Jump to" then "Ask OBI". The active option is the ochre fill. */
export const Open: Story = {
  render: () => <Harness start="card" />,
  play: async ({ canvas }) => {
    canvas.getByRole('combobox').focus();
  },
};

/** Behavioral suite: the ARIA combobox pattern. */
export const Behavior: Story = {
  render: () => <Harness />,
  play: async ({ canvas, step }) => {
    const box = canvas.getByRole('combobox', { name: 'Ask OBI or jump to' });
    const list = canvas.getByRole('listbox', { hidden: true });

    await step('the field is a 44 box: the border sits inside', async () => {
      expect(box.parentElement!.getBoundingClientRect().height).toBe(44);
    });

    await step('typing opens a named, grouped list; focus stays in the field', async () => {
      await userEvent.click(box);
      await userEvent.type(box, 'car');
      await waitFor(() => expect(box).toHaveAttribute('aria-expanded', 'true'));
      expect(box).toHaveAttribute('aria-controls', list.id);
      expect(canvas.getAllByRole('group').map((g) => g.getAttribute('aria-labelledby') && document.getElementById(g.getAttribute('aria-labelledby')!)?.textContent)).toEqual(['Jump to', 'Ask OBI']);
      expect(document.activeElement).toBe(box);
    });

    await step('no exact name: Ask is the preferred option, by aria-activedescendant', async () => {
      const active = document.getElementById(box.getAttribute('aria-activedescendant')!)!;
      expect(active).toHaveAttribute('aria-selected', 'true');
      expect(active.textContent).toContain('Ask OBI: car');
    });

    await step('Down moves the active option and wraps', async () => {
      await userEvent.keyboard('{ArrowDown}');
      expect(document.getElementById(box.getAttribute('aria-activedescendant')!)!.textContent).toContain('Card');
    });

    await step('Enter chooses the active option', async () => {
      await userEvent.keyboard('{Enter}');
      await waitFor(() => expect(canvas.getByTestId('picked').textContent).toBe('Card'));
      expect(box).toHaveAttribute('aria-expanded', 'false');
    });

    await step('an exact name prefers the component', async () => {
      await userEvent.clear(box);
      await userEvent.type(box, 'stat');
      await waitFor(() => expect(document.getElementById(box.getAttribute('aria-activedescendant')!)!.textContent).toContain('Stat'));
    });

    await step('Esc closes the list and stays in the field', async () => {
      await userEvent.type(box, 'x');
      await waitFor(() => expect(box).toHaveAttribute('aria-expanded', 'true'));
      await userEvent.keyboard('{Escape}');
      expect(box).toHaveAttribute('aria-expanded', 'false');
      expect(document.activeElement).toBe(box);
    });

    await step('highlight, never dim: other options keep full opacity', async () => {
      await userEvent.keyboard('{ArrowDown}');
      for (const o of canvas.getAllByRole('option')) expect(getComputedStyle(o).opacity).toBe('1');
    });
  },
};
