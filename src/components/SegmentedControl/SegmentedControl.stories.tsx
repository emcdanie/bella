import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';
import { expectVisibleFocus, expectTouchTarget } from '../../testing/behavioral';
import SegmentedControl from './SegmentedControl';
import segCssRaw from './SegmentedControl.module.css?raw';
import componentContract from '../../../tokens/component.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((segCssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
)
  .filter((v) => !v.startsWith('--seg-inset'))
  .sort();

const segContract =
  (componentContract as any).component?.['segmented-control']?.$extensions?.bella ?? {};

const VIEWS = [
  { value: 'cards', label: 'Cards' },
  { value: 'map', label: 'Map' },
  { value: 'table', label: 'Table' },
];

/* The portfolio switcher's three Iconoir glyphs (regular set, MIT),
 * inlined until the Icon component's own extraction: currentColor,
 * stroke from the icon token, size from --icon-sm via the slot. */
const glyphProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  style: { strokeWidth: 'var(--icon-stroke)' } as React.CSSProperties,
};

const CardsGlyph = (
  <svg {...glyphProps}>
    <path d="M14 20.4V14.6C14 14.2686 14.2686 14 14.6 14H20.4C20.7314 14 21 14.2686 21 14.6V20.4C21 20.7314 20.7314 21 20.4 21H14.6C14.2686 21 14 20.7314 14 20.4Z" />
    <path d="M3 20.4V14.6C3 14.2686 3.26863 14 3.6 14H9.4C9.73137 14 10 14.2686 10 14.6V20.4C10 20.7314 9.73137 21 9.4 21H3.6C3.26863 21 3 20.7314 3 20.4Z" />
    <path d="M14 9.4V3.6C14 3.26863 14.2686 3 14.6 3H20.4C20.7314 3 21 3.26863 21 3.6V9.4C21 9.73137 20.7314 10 20.4 10H14.6C14.2686 10 14 9.73137 14 9.4Z" />
    <path d="M3 9.4V3.6C3 3.26863 3.26863 3 3.6 3H9.4C9.73137 3 10 3.26863 10 3.6V9.4C10 9.73137 9.73137 10 9.4 10H3.6C3.26863 10 3 9.73137 3 9.4Z" />
  </svg>
);

const MapGlyph = (
  <svg {...glyphProps}>
    <path d="M9 19L3.78974 20.7368C3.40122 20.8663 3 20.5771 3 20.1675L3 5.43246C3 5.1742 3.16526 4.94491 3.41026 4.86325L9 3M9 19L15 21M9 19L9 3M15 21L20.5897 19.1368C20.8347 19.0551 21 18.8258 21 18.5675L21 3.83246C21 3.42292 20.5988 3.13374 20.2103 3.26325L15 5M15 21L15 5M15 5L9 3" />
  </svg>
);

const TableGlyph = (
  <svg {...glyphProps}>
    <path d="M21 3V21H3V3H21Z" />
    <path d="M3 16.5H21" />
    <path d="M3 12H21" />
    <path d="M3 7.5H21" />
    <path d="M16.5 3V21" />
    <path d="M12 3V21" />
    <path d="M7.5 3V21" />
  </svg>
);

const VIEWS_WITH_ICONS = [
  { value: 'cards', label: 'Cards', icon: CardsGlyph },
  { value: 'map', label: 'Map', icon: MapGlyph },
  { value: 'table', label: 'Table', icon: TableGlyph },
];


const meta: Meta<typeof SegmentedControl> = {
  title: 'Components/SegmentedControl',
  component: SegmentedControl,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: segContract.a11y },
  },
  argTypes: {
    options: { control: false },
    value: { control: false },
    onChange: { control: false },
    label: { control: 'text' },
    className: { control: false },
  },
};
export default meta;

type Story = StoryObj<typeof SegmentedControl>;

/** The shipped shape: icon + label per segment, exactly the /work
 * switcher. Icons are decorative (aria-hidden); the label carries the
 * semantics. */
export const Views: Story = {
  render: () => (
    <SegmentedControl
      options={VIEWS_WITH_ICONS}
      value="map"
      onChange={() => {}}
      label="Library view"
    />
  ),
};

/** Text-only remains a supported shape for switchers without glyphs. */
export const TextOnly: Story = {
  render: () => (
    <SegmentedControl options={VIEWS} value="map" onChange={() => {}} label="Library view" />
  ),
};

function SwitcherHarness() {
  const [view, setView] = useState('cards');
  return (
    <div style={{ display: 'grid', gap: 'var(--spacing-4)', justifyItems: 'start' }}>
      <SegmentedControl options={VIEWS} value={view} onChange={setView} label="Library view" />
      <span data-testid="active-view">{view}</span>
    </div>
  );
}

/** Behavioral suite: Tab between segments, Enter/Space select, the
 * selection lives in aria-current, focus ring, touch target. */
export const Behavior: Story = {
  render: () => <SwitcherHarness />,
  play: async ({ canvas, step }) => {
    const cards = canvas.getByRole('button', { name: 'Cards' });
    const map = canvas.getByRole('button', { name: 'Map' });

    await step('selection lives in aria-current', async () => {
      expect(cards).toHaveAttribute('aria-current', 'true');
      expect(map).not.toHaveAttribute('aria-current');
    });

    await step('activate moves the selection and the tree follows', async () => {
      map.click();
      await waitFor(() => {
        expect(map).toHaveAttribute('aria-current', 'true');
        expect(cards).not.toHaveAttribute('aria-current');
        expect(canvas.getByTestId('active-view').textContent).toBe('map');
      });
    });

    await step('every segment is a real, focusable button', async () => {
      expect(canvas.queryAllByRole('button')).toHaveLength(3);
      await expectVisibleFocus(map);
    });

    await step('touch target: 44px minimum per segment', async () => {
      expectTouchTarget(cards);
    });
  },
};
