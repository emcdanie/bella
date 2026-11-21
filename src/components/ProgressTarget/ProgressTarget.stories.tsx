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

/** Figma Progress target 1168:72541 (22 Nov publish, her pick "B · dashed marker and label"):
 * a 1.5 dashed line in border/brand at target %, from the label down to 4 below
 * the 8 bar, and a "Target n%" Tag in the number face above the bar. Shown on every tone. */
export const OnEveryTone: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--spacing-16)', inlineSize: 'calc(var(--spacing-80) * 4)' }}>
      {(['info', 'success', 'attention', 'danger'] as const).map((tone) => (
        <Progress key={tone} label={`Target · ${tone}`} value="95%" tone={tone} fill={95} target={90} showTarget showLabel={false} />
      ))}
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const target = canvasElement.querySelector('[data-bella-component="progress-target"]') as HTMLElement;
    const track = target.parentElement as HTMLElement;
    const dash = target.firstElementChild as HTMLElement;
    const label = target.querySelector('[data-bella-component="tag"]') as HTMLElement;
    await step('the dash is centred on 90% of the track and runs from the label to 4 below the bar', async () => {
      const d = dash.getBoundingClientRect();
      const t = track.getBoundingClientRect();
      const l = label.getBoundingClientRect();
      await expect(Math.abs(d.left + d.width / 2 - (t.left + t.width * 0.9))).toBeLessThanOrEqual(1);
      await expect(d.width).toBe(1.5);
      await expect(Math.round(d.top)).toBe(Math.round(l.bottom));
      await expect(Math.round(d.bottom - t.bottom)).toBe(4);
    });
    await step('the label reads "Target 90%" in the number face, 8 above the bar, and ends at the line (target over 50)', async () => {
      await expect(label.textContent).toBe('Target 90%');
      const face = getComputedStyle(document.documentElement).getPropertyValue('--typography-number-font-family').split(',')[0].trim().replace(/['"]/g, '');
      const text = label.querySelector('span') as HTMLElement;
      await expect(getComputedStyle(text).fontFamily.split(',')[0].trim().replace(/['"]/g, '')).toBe(face);
      await expect(Math.round(track.getBoundingClientRect().top - label.getBoundingClientRect().bottom)).toBe(8);
      await expect(Math.abs(label.getBoundingClientRect().right - (dash.getBoundingClientRect().left + 0.75))).toBeLessThanOrEqual(1);
    });
  },
};

/** Up to 50 the label starts at the line and runs right; above 50 it ends at the line, so it never sticks out of the bar. */
export const LabelSide: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--spacing-16)', inlineSize: 'calc(var(--spacing-80) * 4)' }}>
      {[0, 25, 50, 75, 100].map((t) => (
        <Progress key={t} label={`Target ${t}`} value="60%" fill={60} target={t} showTarget showLabel={false} />
      ))}
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    await step('every label stays inside its bar', async () => {
      for (const target of canvasElement.querySelectorAll<HTMLElement>('[data-bella-component="progress-target"]')) {
        const t = (target.parentElement as HTMLElement).getBoundingClientRect();
        const l = (target.querySelector('[data-bella-component="tag"]') as HTMLElement).getBoundingClientRect();
        await expect(l.left).toBeGreaterThanOrEqual(t.left - 1);
        await expect(l.right).toBeLessThanOrEqual(t.right + 1);
      }
    });
  },
};
