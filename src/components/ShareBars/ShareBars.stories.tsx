import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import ShareBars, { type ShareBarsRow } from './ShareBars';
import cssRaw from './ShareBars.module.css?raw';
import componentContract from '../../../tokens/contracts.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))).sort();
const contract = (componentContract as any).component?.['share-bars']?.$extensions?.bella ?? {};

const checks: ShareBarsRow[] = [
  { id: 'parts', name: 'Real parts', detail: '100 to 80, 25% of the score', share: -5, tone: 'danger' },
  { id: 'quality', name: 'Quality of the result', detail: '63.6 to 53.4, 30% of the score', share: -3.1, tone: 'danger' },
  { id: 'compiles', name: 'Compiles', detail: '100 to 90, 10% of the score', share: -1, tone: 'danger' },
  { id: 'imports', name: 'Imports', detail: '100 to 100, 10% of the score', share: 0, tone: 'neutral' },
  { id: 'tokens', name: 'Tokens', detail: '76 to 95, 15% of the score', share: 2.9, tone: 'success' },
];

const Frame = ({ children, w = '56rem' }: { children: React.ReactNode; w?: string }) => (
  <div style={{ inlineSize: w, maxInlineSize: '100%', padding: 'var(--spacing-24)', background: 'var(--color-background-surface)', borderRadius: 'var(--border-radius-20)' }}>{children}</div>
);


const meta: Meta<typeof ShareBars> = {
  title: 'Components/Data/ShareBars',
  component: ShareBars,
  parameters: { docs: { page: ComponentDocsPage }, bellaDocs: { tokens: consumedTokens, a11y: contract.a11y } },
  argTypes: { rows: { control: false }, className: { control: false }, style: { control: false } },
  args: { rows: checks, label: 'Share of the gap, by check' },
  render: (args) => (
    <Frame>
      <ShareBars {...args} />
    </Frame>
  ),
};
export default meta;
type Story = StoryObj<typeof ShareBars>;

export const Playground: Story = {};

/** Takes, adds, zero, no detail line; one line wide, stacked narrow. */
export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--spacing-16)', padding: 'var(--spacing-16)' }}>
      <Frame>
        <ShareBars rows={checks} label="Share of the gap, wide" />
      </Frame>
      <Frame w="22rem">
        <ShareBars rows={[checks[0], { id: 'plain', name: 'Accessibility', share: 0.4, tone: 'neutral' }, checks[4]]} label="Share of the gap, narrow" />
      </Frame>
    </div>
  ),
};

/** A negative share grows left of the zero line, a positive one right, zero draws no bar; the sign is the real minus. */
export const Behavior: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tracks = Array.from(canvasElement.querySelectorAll<HTMLElement>('[data-testid="share-bars-track"]'));
    await expect(tracks[0]).toHaveAttribute('aria-label', 'Real parts: −5.0, 100 to 80, 25% of the score');
    const left = tracks[0].firstElementChild as HTMLElement;
    const right = tracks[4].firstElementChild as HTMLElement;
    const mid = (el: HTMLElement) => el.getBoundingClientRect().left + el.getBoundingClientRect().width / 2;
    await expect(left.getBoundingClientRect().right).toBeLessThanOrEqual(mid(tracks[0]) + 1);
    await expect(right.getBoundingClientRect().left).toBeGreaterThanOrEqual(mid(tracks[4]) - 1);
    await expect(tracks[3].firstElementChild).toBeNull();
    const values = Array.from(canvasElement.querySelectorAll('[data-testid="share-bars-value"]')).map((v) => v.textContent);
    await expect(values).toEqual(['−5.0', '−3.1', '−1.0', '0.0', '+2.9']);
    await userEvent.click(canvas.getByText('Table behind this chart'));
    await waitFor(() => expect(canvasElement.querySelectorAll('table tbody tr')).toHaveLength(5));
    (document.activeElement as HTMLElement | null)?.blur();
  },
};
