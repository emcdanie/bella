import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor } from 'storybook/test';
import DataTable, { type DataTableColumn, type DataTableSort } from './DataTable';
import StatusPill from '../StatusPill/StatusPill';
import tableCssRaw from './DataTable.module.css?raw';
import componentContract from '../../../tokens/contracts.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((tableCssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const tableContract =
  (componentContract as any).component?.['data-table']?.$extensions?.bella ?? {};

const meta: Meta<typeof DataTable> = {
  title: 'Components/Data/DataTable',
  component: DataTable,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: tableContract.a11y },
  },
};
export default meta;

type Story = StoryObj<typeof DataTable>;

/* every number in Geist Mono: the element's face is the number token's first family */
const numberFace = (el: Element) => getComputedStyle(document.documentElement).getPropertyValue('--typography-number-font-family').split(',')[0].trim().replace(/['"]/g, '');
const faceOf = (el: Element) => getComputedStyle(el).fontFamily.split(',')[0].trim().replace(/['"]/g, '');

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
    render: (r) => <StatusPill variant={r.story ? 'success' : 'info'}>{r.story ? 'present' : 'missing'}</StatusPill>,
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
  play: async ({ canvasElement }) => {
    const numeric = canvasElement.querySelector('tbody tr td:last-child') as HTMLElement;
    await expect(faceOf(numeric.querySelector('span') ?? numeric)).toBe(numberFace(numeric));
  },
};

/* `testHook` shows the selected key for the play test only; `capped` caps the
   height so the sticky header has something to stick in. */
function SelectHarness({ testHook = false, capped = false }: { testHook?: boolean; capped?: boolean }) {
  const [selected, setSelected] = useState<string | null>('Tabs');
  return (
    <div style={{ maxWidth: 640, display: 'grid', gap: 'var(--spacing-12)' }}>
      <DataTable
        columns={COLUMNS}
        rows={ROWS}
        rowKey="name"
        caption="Component health"
        selectedKey={selected}
        onSelect={setSelected}
        maxHeight={capped ? 'calc(var(--spacing-80) * 4)' : undefined}
      />
      {testHook ? <span data-testid="selected">{selected ?? 'none'}</span> : null}
    </div>
  );
}

/** density="compact": a display-only table (an answer, a read-only list), rows under 44px. */
export const Compact: Story = {
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <DataTable
        columns={[
          { key: 'name', label: 'Component' },
          { key: 'contract', label: 'Contract' },
          { key: 'tokens', label: 'Tokens', numeric: true },
        ]}
        rows={ROWS}
        rowKey="name"
        caption="Component health, read only"
        density="compact"
      />
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const wrap = canvasElement.querySelector('[data-bella-component="data-table"]') as HTMLElement;
    await step('compact rows sit under the 44px target', async () => {
      expect(wrap).toHaveAttribute('data-density', 'compact');
      expect(wrap.querySelector('tbody td')!.getBoundingClientRect().height).toBeLessThan(44);
    });
  },
};

/** Compact is ignored where rows are interactive: a sortable table keeps 44px. */
export const CompactIgnoredWhenSortable: Story = {
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <DataTable columns={COLUMNS} rows={ROWS} rowKey="name" caption="Component health" density="compact" />
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const wrap = canvasElement.querySelector('[data-bella-component="data-table"]') as HTMLElement;
    await step('no compact rows on a sortable table', async () => {
      expect(wrap).not.toHaveAttribute('data-density');
      expect(wrap.querySelector('tbody td')!.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
    });
  },
};

/** Single selection marks the row light blue with bold ink text; nothing else dims. */
export const Selectable: Story = {
  render: () => <SelectHarness />,
};

/** Behavioral suite: aria-sort follows the sort, headers are keyboard
 * buttons, numbers sort as numbers, selection is aria-pressed. */
export const Behavior: Story = {
  render: () => <SelectHarness testHook capped />,
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

type StatusRow = { name: string; status: 'Ready' | 'Needs you' };
const statusRows: StatusRow[] = [
  { name: 'Button', status: 'Ready' },
  { name: 'Switch', status: 'Needs you' },
  { name: 'Tabs', status: 'Ready' },
];

/** A tag column (coordinator, 21 Nov): kind="tag" makes each cell a TableCell kind=tag, the line Tag
 * as published; tagTone picks the tone per row. */
export const TagColumn: Story = {
  render: () => (
    <DataTable<StatusRow>
      caption="Component status"
      rowKey="name"
      rows={statusRows}
      columns={[
        { key: 'name', label: 'Component' },
        { key: 'status', label: 'Status', kind: 'tag', tagTone: (r) => (r.status === 'Ready' ? 'success' : 'attention') },
      ]}
    />
  ),
  play: async ({ canvasElement, step }) => {
    const tags = [...canvasElement.querySelectorAll<HTMLElement>('tbody [data-bella-component="tag"]')];
    await step('one Tag per row, carrying the value', async () => {
      await expect(tags.map((t) => t.textContent)).toEqual(['Ready', 'Needs you', 'Ready']);
    });
    await step('the tone follows the row', async () => {
      const look = (t: HTMLElement) => { const cs = getComputedStyle(t); return `${cs.color} ${cs.borderTopColor} ${cs.backgroundColor}`; };
      await expect(look(tags[0])).toBe(look(tags[2]));
      await expect(look(tags[0])).not.toBe(look(tags[1]));
    });
  },
};

type RoleRow = { role: string; token: string; light: string; dark: string };
const roleRows: RoleRow[] = [
  { role: 'content/default', token: 'var(--color-content-default)', light: '#1D2030', dark: '#ECEEF3' },
  { role: 'background/surface', token: 'var(--color-background-surface)', light: '#FFFFFF', dark: '#2E3240' },
  { role: 'background/brand', token: 'var(--color-background-brand)', light: '#63B4E8', dark: '#63B4E8' },
  { role: 'border/utility/warning', token: 'var(--color-border-utility-warning)', light: '#A17E0D', dark: '#E8A83E' },
];

/** A swatch column (Foundations › Colour roles; coordinator, 22 Nov): kind="swatch" makes each cell a TableCell
 * kind=swatch, one square of one colour (rule "Colour swatch is one square of one colour") with its hex in the
 * number face. swatch picks the row's colour; swatchTheme resolves it in one theme, so the Light and Dark columns
 * each show their own mode whatever the page's theme. */
export const SwatchColumn: Story = {
  render: () => (
    <DataTable<RoleRow>
      caption="Colour roles"
      rowKey="role"
      rows={roleRows}
      columns={[
        { key: 'role', label: 'Role' },
        { key: 'light', label: 'Chip light', kind: 'swatch', swatch: (r) => r.token, swatchTheme: 'chip-light' },
        { key: 'dark', label: 'Chip dark', kind: 'swatch', swatch: (r) => r.token, swatchTheme: 'chip-dark' },
      ]}
    />
  ),
  play: async ({ canvasElement, step }) => {
    const rows = [...canvasElement.querySelectorAll<HTMLElement>('tbody tr')];
    const squares = (row: HTMLElement) => [...row.querySelectorAll<HTMLElement>('td [aria-hidden="true"]')];
    const hex = (rgb: string) => '#' + (rgb.match(/\d+/g) ?? []).slice(0, 3).map((n) => Number(n).toString(16).padStart(2, '0')).join('').toUpperCase();
    await step('one square per swatch cell, 20 by 20, with the hex beside it in the number face', async () => {
      for (const row of rows) {
        const chips = squares(row);
        await expect(chips).toHaveLength(2);
        for (const chip of chips) {
          const box = chip.getBoundingClientRect();
          await expect([Math.round(box.width), Math.round(box.height)]).toEqual([20, 20]);
          // one colour: the chip holds a single coloured block, nothing else
          await expect(chip.children).toHaveLength(1);
        }
      }
      const text = rows[0].querySelector('td > span > span:last-child') as HTMLElement;
      await expect(faceOf(text)).toBe(numberFace(text));
    });
    await step('each column shows its own theme\'s colour, matching the hex', async () => {
      for (const [i, row] of rows.entries()) {
        const [light, dark] = squares(row).map((c) => hex(getComputedStyle(c.firstElementChild as HTMLElement).backgroundColor));
        await expect([light, dark]).toEqual([roleRows[i].light, roleRows[i].dark]);
      }
    });
  },
};

/** Scroll edge (Figma 22 Nov, "Edge left" / "Edge right"): a table wider than
 * its frame shows a 24 fade on the side that has more to scroll: right at the
 * start, both in the middle, left at the end. One that fits shows none. */
export const ScrollEdge: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--spacing-24)' }}>
      <div style={{ maxWidth: 'calc(var(--spacing-80) * 4)' }} data-testid="narrow">
        <DataTable columns={COLUMNS} rows={ROWS} rowKey="name" caption="Scrolls sideways" />
      </div>
      <div style={{ maxWidth: 640 }} data-testid="fits">
        <DataTable columns={COLUMNS} rows={ROWS} rowKey="name" caption="Fits" />
      </div>
    </div>
  ),
  play: async ({ canvas, step }) => {
    const edges = (id: string) => {
      const frame = canvas.getByTestId(id).querySelector('[data-bella-scroll-edge]') as HTMLElement;
      return {
        frame,
        scroller: frame.firstElementChild as HTMLElement,
        left: () => Number(getComputedStyle(frame, '::before').opacity),
        right: () => Number(getComputedStyle(frame, '::after').opacity),
      };
    };
    const n = edges('narrow');
    await step('the narrow table scrolls sideways', async () => {
      await expect(n.scroller.scrollWidth).toBeGreaterThan(n.scroller.clientWidth);
    });
    await step('at the start: right fade only, 24 wide', async () => {
      await waitFor(() => expect(n.right()).toBe(1));
      await expect(n.left()).toBe(0);
      await expect(getComputedStyle(n.frame, '::after').width).toBe('24px');
    });
    await step('in the middle: both', async () => {
      n.scroller.scrollLeft = (n.scroller.scrollWidth - n.scroller.clientWidth) / 2;
      await waitFor(() => expect(n.left()).toBe(1));
      await expect(n.right()).toBe(1);
    });
    await step('at the end: left fade only', async () => {
      n.scroller.scrollLeft = n.scroller.scrollWidth;
      await waitFor(() => expect(n.right()).toBe(0));
      await expect(n.left()).toBe(1);
      n.scroller.scrollLeft = 0;
    });
    await step('a table that fits: no fade', async () => {
      const f = edges('fits');
      await expect(f.scroller.scrollWidth).toBeLessThanOrEqual(f.scroller.clientWidth);
      await expect(f.left()).toBe(0);
      await expect(f.right()).toBe(0);
    });
  },
};

type DriftRow = { name: string; differ: number; behind: number };
const DRIFT: DriftRow[] = [
  { name: 'Input', differ: 17, behind: 6 },
  { name: 'ListRow', differ: 14, behind: 29 },
  { name: 'NavList', differ: 13, behind: 0 },
  { name: 'Card', differ: 12, behind: 2 },
];
const DRIFT_COLUMNS: DataTableColumn<DriftRow>[] = [
  { key: 'name', label: 'Part', sortable: true },
  { key: 'differ', label: 'Differences', numeric: true, sortable: true },
  { key: 'behind', label: 'Spec behind', numeric: true, sortable: true },
];

/** onOpen: each row opens its detail; the whole row is the target and ↗ ends it. stack: under 480 of its container
 *  the header goes and each row stacks (the name and the main number on one line, the rest under the name). */
export const OpenRowsStacked: Story = {
  render: () => {
    const [opened, setOpened] = useState<string | null>(null);
    return (
      <div style={{ display: 'grid', gap: 24 }}>
        {[560, 288].map((w) => (
          <div key={w} style={{ maxWidth: w }}>
            <DataTable caption={`Parts that differ (${w} wide)`} columns={DRIFT_COLUMNS} rows={DRIFT} rowKey="name" stack onOpen={setOpened} defaultSort={{ key: 'differ', direction: 'descending' }} />
          </div>
        ))}
        <p>{opened ? `Opened ${opened}` : 'Nothing opened'}</p>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const buttons = canvasElement.querySelectorAll('button');
    const input = [...buttons].find((b) => b.textContent === 'Input')!;
    await userEvent.click(input);
    await waitFor(() => expect(canvasElement.textContent).toContain('Opened Input'));
    // narrow: the header row is hidden from view, the second number's label shows under the name
    const narrow = canvasElement.querySelectorAll('[data-bella-component="data-table"]')[1];
    await expect(narrow.querySelector('thead')!.getBoundingClientRect().height).toBeLessThanOrEqual(1);
  },
};

/** The page holds the sort (a toolbar can follow it) and the first column stays put while the rest scrolls. */
export const PageSortFrozenFirst: Story = {
  render: () => {
    const [sort, setSort] = useState<DataTableSort | null>({ key: 'name', direction: 'ascending' });
    return (
      <div style={{ maxInlineSize: 'calc(var(--spacing-80) * 4)' }}>
        <p>{sort ? `Sorted by ${sort.key}, ${sort.direction}` : 'Not sorted'}</p>
        <DataTable columns={COLUMNS} rows={ROWS} rowKey="name" caption="Component health" sort={sort} onSortChange={setSort} freezeFirst />
      </div>
    );
  },
};
