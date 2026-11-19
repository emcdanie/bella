import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import TableCell from './TableCell';
import TableRow from '../TableRow/TableRow';
import Link from '../Link/Link';
import cssRaw from './TableCell.module.css?raw';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))).sort();

const meta: Meta<typeof TableCell> = {
  title: 'Components/Data/TableCell',
  component: TableCell,
  parameters: { docs: { page: ComponentDocsPage }, bellaDocs: { tokens: consumedTokens } },
};
export default meta;
type Story = StoryObj<typeof TableCell>;

/** Figma "Sample · Foundations roles table" (1511:4441): every kind, sort on every header, a selected row (light blue, bold ink). The Light column's chips resolve in Chip light and the Dark column's in Chip dark, whatever the page theme. */
export const RolesTable: Story = {
  render: () => (
    <div style={{ padding: 'var(--spacing-24)', background: 'var(--color-background-surface)' }}>
      <table aria-label="Colour roles" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
        <thead>
          <TableRow hover={false}>
            <TableCell kind="header" sort="ascending">Role</TableCell>
            <TableCell kind="header" sort="none">Light</TableCell>
            <TableCell kind="header" sort="none">Dark</TableCell>
            <TableCell kind="header" align="end" sort="none">Contrast</TableCell>
            <TableCell kind="header" align="end" sort="none">Used by</TableCell>
          </TableRow>
        </thead>
        <tbody>
          <TableRow>
            <TableCell kind="mono" rowHeader>content/default</TableCell>
            <TableCell kind="swatch" swatchTheme="chip-light" swatch="var(--color-content-default)">ink</TableCell>
            <TableCell kind="swatch" swatchTheme="chip-dark" swatch="var(--color-content-default)">ink</TableCell>
            <TableCell kind="mono" align="end">15.1:1</TableCell>
            <TableCell kind="link" align="end"><Link href="#used">12 parts</Link></TableCell>
          </TableRow>
          <TableRow selected>
            <TableCell kind="mono" rowHeader selected>background/accent-1</TableCell>
            <TableCell kind="swatch" swatchTheme="chip-light" swatch="var(--color-background-accent-1)" selected>pink</TableCell>
            <TableCell kind="swatch" swatchTheme="chip-dark" swatch="var(--color-background-accent-1)" selected>pink</TableCell>
            <TableCell kind="mono" align="end" selected>7.96:1</TableCell>
            <TableCell kind="link" align="end" selected><Link href="#used2">4 parts</Link></TableCell>
          </TableRow>
          <TableRow>
            <TableCell kind="mono" rowHeader>border/default</TableCell>
            <TableCell kind="swatch" swatchTheme="chip-light" swatch="var(--color-border-default)">edge</TableCell>
            <TableCell kind="swatch" swatchTheme="chip-dark" swatch="var(--color-border-default)">edge</TableCell>
            <TableCell kind="text" align="end">n/a</TableCell>
            <TableCell kind="text" align="end">0</TableCell>
          </TableRow>
        </tbody>
      </table>
    </div>
  ),
};
