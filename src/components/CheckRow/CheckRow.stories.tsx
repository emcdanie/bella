import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import CheckRow, { CheckListHeader } from './CheckRow';
import { ListRowGroup } from '../ListRow/ListRow';
import cssRaw from './CheckRow.module.css?raw';
import componentContract from '../../../tokens/contracts.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const contract = (componentContract as any).component?.['check-row']?.$extensions?.bella ?? {};

/** Checks sit in a card on the page. */
const Card = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      padding: 'var(--spacing-24)',
      background: 'var(--color-background-surface)',
      borderRadius: 'var(--border-radius-card)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--spacing-12)',
    }}
  >
    {children}
  </div>
);

const meta: Meta<typeof CheckRow> = {
  title: 'Components/Data/CheckRow',
  component: CheckRow,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: contract.a11y },
  },
  argTypes: {
    status: { control: 'inline-radio' },
    className: { control: false },
    style: { control: false },
    onAction: { control: false },
  },
  args: { status: 'pass', title: 'Story', subtitle: 'Missing: BrandWordmark, PatternField', value: '42/44', fill: 95, target: 90, as: 'div' },
  render: (args) => (
    <Card>
      <CheckRow {...args} onAction={() => {}} />
    </Card>
  ),
};
export default meta;

type Story = StoryObj<typeof CheckRow>;

export const Playground: Story = {};

/** Figma's set: pass, then fail with the text button underneath. Counts say what they count. */
export const ComponentChecks: Story = {
  render: () => (
    <Card>
      <CheckListHeader title="Component checks" count={3} legend="Target 90%" />
      <ListRowGroup ariaLabel="Component checks">
        <CheckRow status="pass" title="Story" subtitle="Every component has one" value="44/44" fill={100} target={90} />
        <CheckRow status="fail" title="Contrast pairs" subtitle="Missing: BrandWordmark, PatternField" value="35/44" fill={80} target={90} onAction={() => {}} actionLabel="Add pairs" />
        <CheckRow status="fail" title="Docs" subtitle="Missing: Menu, TaskCard" value="40/44" fill={91} target={95} onAction={() => {}} actionLabel="Add docs" />
      </ListRowGroup>
    </Card>
  ),
};

/** The bar is named by the check and reads its amount; the action is a real button. */
export const Behavior: Story = {
  render: () => (
    <Card>
      <ListRowGroup ariaLabel="Checks">
        <CheckRow status="fail" title="Story" subtitle="Missing: BrandWordmark" value="42/44" fill={95} target={90} onAction={() => {}} />
      </ListRowGroup>
    </Card>
  ),
  play: async ({ canvas, step }) => {
    await step('progress named by the check, with its amount', async () => {
      const bar = canvas.getByRole('progressbar', { name: 'Story' });
      await expect(bar).toHaveAttribute('aria-valuetext', '42/44');
    });
    await step('the action is a button with a 44 target', async () => {
      const b = canvas.getByRole('button', { name: 'Add stories' });
      await expect(b).toBeVisible();
    });
  },
};
