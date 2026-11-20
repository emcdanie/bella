import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import ProgressTarget from './ProgressTarget';
import Progress from '../Progress/Progress';
import cssRaw from './ProgressTarget.module.css?raw';
import componentContract from '../../../tokens/contracts.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const contract = (componentContract as any).component?.['progress-target']?.$extensions?.bella ?? {};

const meta: Meta<typeof ProgressTarget> = {
  title: 'Components/Data/ProgressTarget',
  component: ProgressTarget,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: contract.a11y },
  },
  args: { target: 90 },
  render: (args) => (
    <div style={{ inlineSize: 'calc(var(--spacing-80) * 4)' }}>
      <Progress label="Coverage" value="60%" fill={60} target={args.target} showTarget showLabel={false} />
    </div>
  ),
};
export default meta;

type Story = StoryObj<typeof ProgressTarget>;

export const Playground: Story = {};

/** Figma Progress target 1168:72541 (21 Nov publish): the mark is the bar's own height, no overhang,
 * with a 1px surface edge outside it, centred on target %. Shown on every tone. */
export const OnEveryTone: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--spacing-16)', inlineSize: 'calc(var(--spacing-80) * 4)' }}>
      {(['info', 'success', 'attention', 'danger'] as const).map((tone) => (
        <Progress key={tone} label={`Target · ${tone}`} value="95%" tone={tone} fill={95} target={90} showTarget showLabel={false} />
      ))}
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    await step('the mark is as tall as the track and sits on it', async () => {
      const mark = canvasElement.querySelector('[data-bella-component="target-mark"]') as HTMLElement;
      const track = mark.closest('[data-bella-component="progress-target"]')!.parentElement as HTMLElement;
      const m = mark.getBoundingClientRect();
      const t = track.getBoundingClientRect();
      await expect(m.height).toBe(t.height);
      await expect(m.top).toBe(t.top);
      await expect(m.width).toBe(4);
    });
    await step('centred on 90% of the track, with the 1px surface edge', async () => {
      const mark = canvasElement.querySelector('[data-bella-component="target-mark"]') as HTMLElement;
      const track = mark.closest('[data-bella-component="progress-target"]')!.parentElement as HTMLElement;
      const m = mark.getBoundingClientRect();
      const t = track.getBoundingClientRect();
      await expect(Math.abs(m.left + m.width / 2 - (t.left + t.width * 0.9))).toBeLessThanOrEqual(1);
      await expect(getComputedStyle(mark).boxShadow).toMatch(/1px/);
    });
  },
};
