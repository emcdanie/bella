import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';
import { expectVisibleFocus, expectTouchTarget } from '../../testing/behavioral';
import Select from './Select';
import Icon from '../Icon/Icon';
import selectCssRaw from './Select.module.css?raw';
import componentContract from '../../../tokens/contracts.json';
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
  title: 'Components/Inputs/Select',
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
    <div style={{ display: 'grid', gap: 'var(--spacing-16)', justifyItems: 'start' }}>
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

/** leading (BellaComponents, 11 Nov 2026): an Icon or small logo at the
 * start of the field. Decorative; the option text names the choice. */
export const WithLeading: Story = {
  render: () => (
    <Select label="Sort" value="recent" onChange={() => {}} options={SORTS} leading={<Icon name="Folder" />} />
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('combobox', { name: 'Sort' })).toBeVisible();
  },
};

/** disabled (25 Nov 2026): the native attribute, so the field takes no
 * focus, clicks or keys; muted text on the subtle fill, as Input. */
export const Disabled: Story = {
  render: () => <Select label="Sort" value="recent" onChange={() => {}} options={SORTS} disabled />,
  play: async ({ canvas }) => {
    const select = canvas.getByRole('combobox', { name: 'Sort' }) as HTMLSelectElement;
    await expect(select).toBeDisabled();
    select.focus();
    await expect(select).not.toHaveFocus();
  },
};

/** error (25 Nov 2026): the danger edge and the message under the field,
 * wired by aria-invalid and aria-describedby, as Input. */
export const WithError: Story = {
  render: () => (
    <Select label="Sort" value="recent" onChange={() => {}} options={SORTS} error="Choose how to sort the list." />
  ),
  play: async ({ canvas }) => {
    const select = canvas.getByRole('combobox', { name: 'Sort' });
    await expect(select).toHaveAttribute('aria-invalid', 'true');
    await expect(select).toHaveAccessibleDescription('Choose how to sort the list.');
    await expect(canvas.getByRole('alert')).toHaveTextContent('Choose how to sort the list.');
  },
};
