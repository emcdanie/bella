import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';
import { expectVisibleFocus, expectTouchTarget } from '../../testing/behavioral';
import Select from './Select';
import selectCssRaw from './Select.module.css?raw';
import componentContract from '../../../tokens/component.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((selectCssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const selectContract =
  (componentContract as any).component?.select?.$extensions?.bella ?? {};

const SORTS = [
  { value: 'recent', label: 'Most recent' },
  { value: 'impact', label: 'Impact' },
  { value: 'alpha', label: 'A to Z' },
];

const meta: Meta<typeof Select> = {
  title: 'Components/Select',
  component: Select,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: selectContract.a11y },
  },
  argTypes: {
    label: { control: 'text' },
    options: { control: false },
    value: { control: false },
    onChange: { control: false },
    className: { control: false },
  },
};
export default meta;

type Story = StoryObj<typeof Select>;

/** The closed control: native select under BELLA skin, label always visible. */
export const Default: Story = {
  render: () => <Select label="Sort" value="recent" onChange={() => {}} options={SORTS} />,
};

function SortHarness() {
  const [sort, setSort] = useState('recent');
  return (
    <div style={{ display: 'grid', gap: 'var(--spacing-4)', justifyItems: 'start' }}>
      <Select label="Sort" value={sort} onChange={setSort} options={SORTS} />
      <span data-testid="active-sort">{sort}</span>
    </div>
  );
}

/** Behavioral suite: it IS a native select (labelled by containment, the
 * platform owns the popup), change flows through, focus ring, target. */
export const Behavior: Story = {
  render: () => <SortHarness />,
  play: async ({ canvas, step }) => {
    const select = canvas.getByLabelText(/sort/i) as HTMLSelectElement;

    await step('native combobox, labelled by containment', async () => {
      expect(select.tagName).toBe('SELECT');
      expect(canvas.getByRole('combobox')).toBe(select);
    });

    await step('change flows through the native event', async () => {
      select.value = 'impact';
      select.dispatchEvent(new Event('change', { bubbles: true }));
      await waitFor(() =>
        expect(canvas.getByTestId('active-sort').textContent).toBe('impact')
      );
    });

    await step('focus: visible ring on the field', async () => {
      await expectVisibleFocus(select);
    });

    await step('touch target: 44px minimum', async () => {
      expectTouchTarget(select);
    });
  },
};
