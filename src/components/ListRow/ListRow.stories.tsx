import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import ListRow, { ListRowGroup } from './ListRow';
import Button from '../Button/Button';
import StatusPill from '../StatusPill/StatusPill';
import cssRaw from './ListRow.module.css?raw';
import componentContract from '../../../tokens/component.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const contract = (componentContract as any).component?.['list-row']?.$extensions?.bella ?? {};

const meta: Meta<typeof ListRow> = {
  title: 'Components/ListRow',
  component: ListRow,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: contract.a11y },
  },
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    status: { control: false },
    action: { control: false },
    className: { control: false },
    style: { control: false },
  },
  args: { title: 'Button has no dark story' },
};
export default meta;

type Story = StoryObj<typeof ListRow>;

const rows = (
  <>
    <ListRow
      status={<StatusPill variant="danger">Failing</StatusPill>}
      title="Button has no dark story"
      description="Every component shows both themes, so a dark regression stays hidden."
      action={<Button variant="secondary">Review</Button>}
    />
    <ListRow
      status={<StatusPill variant="success">Passing</StatusPill>}
      title="Tabs meets the 44px floor"
      description="Measured at every width. Nothing left to do."
      action={<Button variant="secondary">See check</Button>}
    />
    <ListRow title="No status on this one" description="A row can stand without a marker." />
  </>
);

/** A work list: statuses and actions line up down the list. */
export const WorkList: Story = {
  render: () => <ListRowGroup ariaLabel="What to do next">{rows}</ListRowGroup>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole('list', { name: 'What to do next' });
    await expect(within(list).getAllByRole('listitem')).toHaveLength(3);
    for (const b of canvas.getAllByRole('button')) {
      await expect(b.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
    }
  },
};

/** In a narrow frame the same rows stack, with no sideways scroll. */
export const Narrow: Story = {
  render: () => (
    <div style={{ maxWidth: 'calc(var(--spacing-20) * 4)' }}>
      <ListRowGroup ariaLabel="What to do next, narrow">{rows}</ListRowGroup>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const list = within(canvasElement).getByRole('list');
    await expect(list.scrollWidth).toBeLessThanOrEqual(list.clientWidth);
  },
};

/** The title can carry a heading level when the page needs one. */
export const WithHeadingLevel: Story = {
  render: () => (
    <ListRowGroup ariaLabel="Changes">
      <ListRow titleAs="h3" title="Tokens rebuilt" description="The theme took the new scale." />
    </ListRowGroup>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('heading', { level: 3 })).toBeTruthy();
  },
};
