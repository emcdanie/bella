import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import SystemHealth from './SystemHealth';
import cssRaw from './SystemHealth.module.css?raw';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const meta: Meta<typeof SystemHealth> = {
  title: 'Components/Data/SystemHealth',
  component: SystemHealth,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens },
  },
};
export default meta;

type Story = StoryObj<typeof SystemHealth>;

/* Cards sit on the page ground, at the width Figma draws the card (331). */
const Ground = ({ children }: { children: React.ReactNode }) => (
  <div style={{ padding: 'var(--spacing-24)', background: 'var(--color-background-default)', maxInlineSize: 'calc(331px + var(--spacing-48))', boxSizing: 'border-box' }}>
    {children}
  </div>
);

const FAILING = [
  { name: 'Contrast', count: 9, ofTotal: 'of 44 parts', href: '#contrast' },
  { name: 'Story', count: 2, ofTotal: 'of 44 parts', href: '#story' },
  { name: 'A11y', count: 2, ofTotal: 'of 44 parts', href: '#a11y' },
];

/** As the published Figma instance: 95% healthy, the blue target tick at 90%, three failing checks. */
export const Healthy: Story = {
  render: () => (
    <Ground>
      <SystemHealth
        value={95}
        status="Healthy"
        passed="251 of 264 pass"
        why="Healthy means 90% or more pass (the blue tick). 13 checks still fail:"
        failing={FAILING}
      />
    </Ground>
  ),
};

/** Under the target: fewer ticks lit, the target tick still marks 90%. */
export const BelowTarget: Story = {
  render: () => (
    <Ground>
      <SystemHealth value={72} status="Needs work" passed="190 of 264 pass" why="Healthy means 90% or more pass (the blue tick). 74 checks still fail:" failing={FAILING} />
    </Ground>
  ),
};

/** One column (a window under about 700): the card runs wide, the gauge stops at 320 and centres. */
export const OneColumn: Story = {
  render: () => (
    <div style={{ padding: 'var(--spacing-24)', background: 'var(--color-background-default)', maxInlineSize: '42rem', boxSizing: 'border-box' }}>
      <SystemHealth value={95} status="Healthy" passed="251 of 264 pass" why="Healthy means 90% or more pass (the blue tick). 13 checks still fail:" failing={FAILING} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const gauge = canvasElement.querySelector('[role="meter"]')?.parentElement?.getBoundingClientRect();
    await expect(gauge && gauge.width).toBeLessThanOrEqual(320);
  },
};

/** The gauge reads as a meter: value, range and words. */
export const Behavior: Story = {
  render: () => (
    <Ground>
      <SystemHealth value={95} status="Healthy" passed="251 of 264 pass" failing={FAILING} />
    </Ground>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const meter = c.getByRole('meter', { name: 'System health' });
    await expect(meter).toHaveAttribute('aria-valuenow', '95');
    await expect(meter).toHaveAttribute('aria-valuetext', '95%, Healthy');
    await expect(c.getAllByRole('link')).toHaveLength(3);
  },
};
