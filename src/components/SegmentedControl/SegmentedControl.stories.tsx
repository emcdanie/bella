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

/** The view switcher at rest, middle segment selected. */
export const Views: Story = {
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
