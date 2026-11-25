import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import TableRow from './TableRow';
import TableCell from '../TableCell/TableCell';
import cssRaw from './TableRow.module.css?raw';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))).sort();

const meta: Meta<typeof TableRow> = {
  title: 'Components/Data/TableRow',
  component: TableRow,
  parameters: { docs: { page: ComponentDocsPage }, bellaDocs: { tokens: consumedTokens } },
};
export default meta;
type Story = StoryObj<typeof TableRow>;

/** Figma Table row 1510:348603: state default (no fill), hover (the shared hover light blue, on pointer hover) and selected (the shared selected light blue, its cells bold ink). The row has no edge of its own: each cell carries it. */
export const States: Story = {
  render: () => (
    <div style={{ padding: 'var(--spacing-24)', background: 'var(--color-background-surface)' }}>
      <table aria-label="Table row states" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
        <thead>
          <TableRow hover={false}>
            <TableCell kind="header">State</TableCell>
            <TableCell kind="header" align="end">Fill</TableCell>
          </TableRow>
        </thead>
        <tbody>
          <TableRow>
            <TableCell rowHeader>default</TableCell>
            <TableCell kind="mono" align="end">none</TableCell>
          </TableRow>
          <TableRow selected>
            <TableCell rowHeader selected>selected</TableCell>
            <TableCell kind="mono" align="end" selected>brand-subtle-hover</TableCell>
          </TableRow>
        </tbody>
      </table>
    </div>
  ),
};
