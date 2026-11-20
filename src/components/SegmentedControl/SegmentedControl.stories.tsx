import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';
import { expectVisibleFocus, expectTouchTarget } from '../../testing/behavioral';
import SegmentedControl from './SegmentedControl';
import segCssRaw from './SegmentedControl.module.css?raw';
import componentContract from '../../../tokens/contracts.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';
import Icon from '../Icon/Icon';

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

/* the shipped /work icons, via THE Icon component (registry glyphs) */
const VIEWS_WITH_ICONS = [
  { value: 'cards', label: 'Cards', icon: <Icon name="ViewGrid" size="sm" /> },
  { value: 'map', label: 'Map', icon: <Icon name="Map" size="sm" /> },
  { value: 'table', label: 'Table', icon: <Icon name="Table" size="sm" /> },
];


const meta: Meta<typeof SegmentedControl> = {
  title: 'Components/Actions/SegmentedControl',
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

/* every number in Geist Mono: the element's face is the number token's first family */
const numberFace = (el: Element) => getComputedStyle(document.documentElement).getPropertyValue('--typography-number-font-family').split(',')[0].trim().replace(/['"]/g, '');
const faceOf = (el: Element) => getComputedStyle(el).fontFamily.split(',')[0].trim().replace(/['"]/g, '');

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
    <div style={{ display: 'grid', gap: 'var(--spacing-16)', justifyItems: 'start' }}>
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

/** Number labels (Playground widths): the number face, as every number; word labels stay Lexend. */
export const NumberLabels: Story = {
  render: () => {
    const [v, setV] = useState('1024');
    return (
      <SegmentedControl
        label="Width"
        value={v}
        onChange={setV}
        options={['375', '768', '1024', '1440'].map((w) => ({ value: w, label: w }))}
      />
    );
  },
  play: async ({ canvasElement }) => {
    for (const b of canvasElement.querySelectorAll('button')) await expect(faceOf(b)).toBe(numberFace(b));
  },
};
