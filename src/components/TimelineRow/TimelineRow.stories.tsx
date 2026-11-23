import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent } from 'storybook/test';
import TimelineRow from './TimelineRow';
import cssRaw from './TimelineRow.module.css?raw';
import componentContract from '../../../tokens/contracts.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))).sort();
const contract = (componentContract as any).component?.['timeline-row']?.$extensions?.bella ?? {};
/** The test runner renders every story in each Chip and BELLA theme, so no theme wrapper here. */
const Themed = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'grid', gap: 'var(--spacing-12)', padding: 'var(--spacing-20)', background: 'var(--color-background-default)' }}>{children}</div>
);

const meta: Meta<typeof TimelineRow> = {
  title: 'Components/Data/TimelineRow',
  component: TimelineRow,
  parameters: { docs: { page: ComponentDocsPage }, bellaDocs: { tokens: consumedTokens, a11y: contract.a11y } },
  argTypes: { state: { control: 'inline-radio' }, onOpen: { control: false }, className: { control: false }, style: { control: false } },
  args: { title: 'Check again · Work', line: '09:23 · 2 s · nothing new', state: 'done' },
};
export default meta;
type Story = StoryObj<typeof TimelineRow>;

export const Playground: Story = {};

/** Done, running, queued and did not land. */
export const AllStates: Story = {
  render: () => (
    <Themed>
      <TimelineRow state="done" title="Check again · Work" line="09:23 · 2 s · nothing new" />
      <TimelineRow state="running" title="Fix CheckRow's drift" line="09:41 to now · step 3 of 7 · 2:41" stepDone={2} stepTotal={7} />
      <TimelineRow state="waiting" title="Run all 6 audits" line="Queued · usually 6 min" />
      <TimelineRow state="failed" title="Fix Button spec" line="09:10 · Did not land: the gate refused the commit" />
    </Themed>
  ),
};

/** A row with onOpen is one button that opens the run. */
export const Behavior: Story = {
  args: { onOpen: fn() },
  play: async ({ canvas, args, step }) => {
    await step('the state is a word as well as a ring', async () => {
      await expect(canvas.getByText('Done')).toBeInTheDocument();
    });
    await step('a click opens the run', async () => {
      await userEvent.click(canvas.getByRole('button'));
      await expect(args.onOpen).toHaveBeenCalledTimes(1);
    });
  },
};
