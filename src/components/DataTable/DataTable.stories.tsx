import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor } from 'storybook/test';
import DataTable, { type DataTableColumn } from './DataTable';
import StatusPill from '../StatusPill/StatusPill';
import tableCssRaw from './DataTable.module.css?raw';
import componentContract from '../../../tokens/component.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((tableCssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const tableContract =
  (componentContract as any).component?.['data-table']?.$extensions?.bella ?? {};

const meta: Meta<typeof DataTable> = {
  title: 'Components/DataTable',
  component: DataTable,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: tableContract.a11y },
  },
};
export default meta;

type Story = StoryObj<typeof DataTable>;

type Row = { name: string; story: boolean; contract: string; tokens: number };

const ROWS: Row[] = [
  { name: 'Button', story: true, contract: 'pass', tokens: 31 },
  { name: 'Card', story: true, contract: 'pass', tokens: 24 },
  { name: 'BrandWordmark', story: false, contract: 'pass', tokens: 6 },
  { name: 'Tabs', story: true, contract: 'pass', tokens: 17 },
  { name: 'PatternField', story: false, contract: 'pass', tokens: 3 },
  { name: 'Stat', story: true, contract: 'pass', tokens: 14 },
];

const COLUMNS: DataTableColumn<Row>[] = [
  { key: 'name', label: 'Component', sortable: true },
  {
    key: 'story',
    label: 'Story',
    sortable: true,
    sortValue: (r) => (r.story ? 1 : 0),
    render: (r) => <StatusPill variant={r.story ? 'success' : 'accent'}>{r.story ? 'present' : 'missing'}</StatusPill>,
  },
  { key: 'contract', label: 'Contract', sortable: true },
  { key: 'tokens', label: 'Tokens', numeric: true, sortable: true },
];

/** Sortable columns, figures right-aligned in tabular numerals. */
export const Default: Story = {
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <DataTable columns={COLUMNS} rows={ROWS} rowKey="name" caption="Component health" defaultSort={{ key: 'name', direction: 'ascending' }} />
    </div>
  ),
};

function SelectHarness() {
  const [selected, setSelected] = useState<string | null>('Tabs');
  return (
    <div style={{ maxWidth: 640, display: 'grid', gap: 'var(--spacing-3)' }}>
      <DataTable
        columns={COLUMNS}
        rows={ROWS}
        rowKey="name"
        caption="Component health"
        selectedKey={selected}
        onSelect={setSelected}
        maxHeight="calc(var(--spacing-20) * 4)"
      />
      <span data-testid="selected">{selected ?? 'none'}</span>
    </div>
  );
}

/** Single selection fills the row ochre; nothing else dims. The header sticks inside a capped height. */
export const Selectable: Story = {
  render: () => <SelectHarness />,
};

/** Behavioral suite: aria-sort follows the sort, headers are keyboard
 * buttons, numbers sort as numbers, selection is aria-pressed. */
export const Behavior: Story = {
  render: () => <SelectHarness />,
  play: async ({ canvas, step }) => {
    const table = canvas.getByRole('table', { name: 'Component health' });
    const tokensHeader = canvas.getByRole('columnheader', { name: /Tokens/ });
    const sortTokens = canvas.getByRole('button', { name: 'Tokens' });
    const firstRowName = () => table.querySelectorAll('tbody th')[0].textContent;

    await step('a named table; sortable headers start unsorted', async () => {
      expect(tokensHeader).toHaveAttribute('aria-sort', 'none');
    });

    await step('keyboard: Tab reaches the sort button, Enter sorts ascending as numbers', async () => {
      sortTokens.focus();
      await userEvent.keyboard('{Enter}');
      await waitFor(() => expect(tokensHeader).toHaveAttribute('aria-sort', 'ascending'));
      expect(firstRowName()).toBe('PatternField');
    });

    await step('a second press sorts descending', async () => {
      await userEvent.click(sortTokens);
      await waitFor(() => expect(tokensHeader).toHaveAttribute('aria-sort', 'descending'));
      expect(firstRowName()).toBe('Button');
    });

    await step('selection is aria-pressed on the row button, and toggles', async () => {
      const tabs = canvas.getByRole('button', { name: 'Tabs' });
      expect(tabs).toHaveAttribute('aria-pressed', 'true');
      await userEvent.click(canvas.getByRole('button', { name: 'Card' }));
      await waitFor(() => {
        expect(canvas.getByRole('button', { name: 'Card' })).toHaveAttribute('aria-pressed', 'true');
        expect(tabs).toHaveAttribute('aria-pressed', 'false');
        expect(canvas.getByTestId('selected').textContent).toBe('Card');
      });
    });

    await step('highlight, never dim: unselected rows keep full opacity', async () => {
      for (const tr of table.querySelectorAll('tbody tr')) {
        expect(getComputedStyle(tr).opacity).toBe('1');
      }
    });

    await step('the header sticks', async () => {
      expect(getComputedStyle(table.querySelector('thead th')!).position).toBe('sticky');
    });
  },
};
