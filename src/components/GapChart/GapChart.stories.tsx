import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import GapChart, { type GapChartRow } from './GapChart';
import cssRaw from './GapChart.module.css?raw';
import componentContract from '../../../tokens/contracts.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))).sort();
const contract = (componentContract as any).component?.['gap-chart']?.$extensions?.bella ?? {};

const jobs: GapChartRow[] = [
  { id: 'password', name: 'Reveal a typed password', base: 84.2, value: 45, gap: -39.2, word: 'stopped and asked', tone: 'warning', why: 'BELLA Input cannot do this yet, so the agent stopped without writing any code.' },
  { id: 'paged-log', name: 'Paged activity log', base: 88.2, value: 78.8, gap: -9.4, word: 'did not compile', tone: 'danger', why: 'Section needs a heading, and the paged log left it out.' },
  { id: 'saving', name: 'Message after saving', base: 88.6, value: 89.8, gap: 1.2, word: 'no real change', tone: 'neutral' },
  { id: 'form-errors', name: 'Errors on a form field', base: 68.3, value: 88.3, gap: 20, word: 'my note ahead', tone: 'success', why: 'The no-file run wrote a raw padding with a fallback, which the token check refuses.' },
];

const runs: GapChartRow[] = [
  { id: '8-oct', name: '8 Oct, first AGENTS.md', base: 87, value: 70.8, gap: -16.2, word: 'no file ahead', tone: 'danger' },
  { id: '9-oct', name: '9 Oct, rewritten', base: null, value: 83.5, gap: null, word: 'no-file was not run', tone: 'neutral' },
  { id: '12-nov', name: '12 Nov, the 8 jobs BELLA can do', base: 86.1, value: 87.8, gap: 1.7, word: 'no real change', tone: 'neutral' },
];

const Frame = ({ children, w = '64rem' }: { children: React.ReactNode; w?: string }) => (
  <div style={{ inlineSize: w, maxInlineSize: '100%', padding: 'var(--spacing-24)', background: 'var(--color-background-surface)', borderRadius: 'var(--border-radius-20)' }}>{children}</div>
);


const meta: Meta<typeof GapChart> = {
  title: 'Components/Data/GapChart',
  component: GapChart,
  parameters: { docs: { page: ComponentDocsPage }, bellaDocs: { tokens: consumedTokens, a11y: contract.a11y } },
  argTypes: { rows: { control: false }, className: { control: false }, style: { control: false } },
  args: { rows: jobs, label: 'Benchmark jobs' },
  render: (args) => (
    <Frame>
      <GapChart {...args} />
    </Frame>
  ),
};
export default meta;
type Story = StoryObj<typeof GapChart>;

export const Playground: Story = {};

/** Every tone, a row with no base (one dot, no line), rows with and without Why; one line wide, stacked narrow. */
export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--spacing-16)', padding: 'var(--spacing-16)' }}>
      <Frame>
        <GapChart rows={jobs} label="Benchmark jobs, wide" />
      </Frame>
      <Frame>
        <GapChart rows={runs} label="Benchmark runs, wide" />
      </Frame>
      <Frame w="22rem">
        <GapChart rows={jobs.slice(0, 2)} label="Benchmark jobs, narrow" />
      </Frame>
    </div>
  ),
};

/** Why opens the reason under its row and says Hide; the track names both values and the gap; the table holds the same data. */
export const Behavior: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const track = canvasElement.querySelector('[data-testid="gap-chart-track"]') as HTMLElement;
    await expect(track).toHaveAttribute('role', 'img');
    await expect(track).toHaveAttribute('aria-label', 'Reveal a typed password: No file 84.2, AGENTS.md 45.0, gap −39.2');
    const why = canvas.getAllByRole('button', { name: 'Why' })[0];
    await expect(why).toHaveAttribute('aria-expanded', 'false');
    await expect(why.getBoundingClientRect().height >= 32).toBe(true);
    await userEvent.click(why);
    await waitFor(() => expect(canvas.getByRole('button', { name: 'Hide' })).toHaveAttribute('aria-expanded', 'true'));
    await expect(canvas.getByText(/BELLA Input cannot do this yet/)).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Hide' }));
    await waitFor(() => expect(canvas.getByText(/BELLA Input cannot do this yet/)).not.toBeVisible());
    await userEvent.click(canvas.getByText('Table behind this chart'));
    await waitFor(() => expect(canvasElement.querySelectorAll('table tbody tr')).toHaveLength(4));
    (document.activeElement as HTMLElement | null)?.blur();
  },
};
