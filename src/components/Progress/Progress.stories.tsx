import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import Progress, { TargetMark } from './Progress';
import cssRaw from './Progress.module.css?raw';
import componentContract from '../../../tokens/contracts.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const contract = (componentContract as any).component?.progress?.$extensions?.bella ?? {};

/** One surface; dark comes from the token modes, never a variant. The theme
 * toolbar picks the theme (audit:visual shoots all four). */
const Themed = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      padding: 'var(--spacing-24)',
      background: 'var(--color-background-surface)',
      borderRadius: 'var(--border-radius-12)',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(16rem, 1fr))',
      gap: 'var(--spacing-24)',
      alignItems: 'start',
    }}
  >
    {children}
  </div>
);

const meta: Meta<typeof Progress> = {
  title: 'Components/Progress',
  component: Progress,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: contract.a11y },
  },
  argTypes: {
    shape: { control: 'inline-radio' },
    tone: { control: 'inline-radio' },
    fill: { control: { type: 'range', min: 0, max: 100, step: 5 } },
    target: { control: { type: 'range', min: 0, max: 100, step: 5 } },
    className: { control: false },
    style: { control: false },
  },
  args: { label: 'Coverage', value: '60%', shape: 'bar', tone: 'info', fill: 60, target: 80, showTarget: true, showLabel: true, segments: 6, done: 4 },
};
export default meta;

type Story = StoryObj<typeof Progress>;

export const Playground: Story = {};

const TONES = ['info', 'success', 'attention', 'danger'] as const;

/** Bar in every tone with the target at 80, plus 0 (reads empty), 5 and 100. */
export const Bars: Story = {
  render: () => (
    <Themed>
      {TONES.map((tone) => (
        <Progress key={tone} label={`Bar · ${tone}`} value="60%" tone={tone} fill={60} target={80} showTarget />
      ))}
      <Progress label="At 0, empty" value="0%" tone="success" fill={0} target={90} showTarget />
      <Progress label="At 5" value="5%" tone="info" fill={5} />
      <Progress label="At 100" value="100%" tone="success" fill={100} target={100} showTarget />
      <Progress label="Label off" value="50%" tone="success" fill={50} showLabel={false} />
    </Themed>
  ),
};

/** Segments in every tone, 4 of 6 done; the gate as 5 of 5. */
export const Segments: Story = {
  render: () => (
    <Themed>
      {TONES.map((tone) => (
        <Progress key={tone} shape="segments" label={`Segments · ${tone}`} value="4 of 6" tone={tone} segments={6} done={4} />
      ))}
      <Progress shape="segments" label="The gate" value="5 of 5" tone="success" segments={5} done={5} />
      <Progress shape="segments" label="None yet" value="0 of 5" tone="info" segments={5} done={0} />
    </Themed>
  ),
};

/** Ring in every tone at 60, and at 0. */
export const Rings: Story = {
  render: () => (
    <Themed>
      {TONES.map((tone) => (
        <Progress key={tone} shape="ring" label={tone} value="60%" tone={tone} fill={60} />
      ))}
      <Progress shape="ring" label="At 0" value="0%" tone="info" fill={0} />
    </Themed>
  ),
};

/** The _Target mark on its own, as a legend key: "Target 90%". */
export const TargetLegend: Story = {
  render: () => (
    <Themed>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-8)', fontFamily: 'var(--typography-subtext-font-family)', color: 'var(--color-content-subtle)' }}>
        <TargetMark /> Target 90%
      </span>
    </Themed>
  ),
};

/** A progressbar with its amount; not a control. */
export const Behavior: Story = {
  render: () => <Progress label="Coverage" value="60%" fill={60} />,
  play: async ({ canvas, step }) => {
    await step('progressbar with value and name', async () => {
      const bar = canvas.getByRole('progressbar', { name: 'Coverage' });
      expect(bar).toHaveAttribute('aria-valuenow', '60');
      expect(bar).toHaveAttribute('aria-valuetext', '60%');
      expect(canvas.queryAllByRole('button')).toHaveLength(0);
    });
  },
};
