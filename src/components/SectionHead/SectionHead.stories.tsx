import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import SectionHead from './SectionHead';
import Button from '../Button/Button';
import cssRaw from './SectionHead.module.css?raw';
import componentContract from '../../../tokens/contracts.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const contract = (componentContract as any).component?.['section-head']?.$extensions?.bella ?? {};

/** Each section is one card (18 Nov, B): the head sits top left inside it.
 * The theme toolbar picks the theme (audit:visual shoots all four). */
const Cards = ({ children, width = 720 }: { children: React.ReactNode; width?: number }) => (
  <div style={{ padding: 'var(--spacing-24)', background: 'var(--color-background-default)', display: 'grid', gap: 'var(--spacing-24)' }}>
    {React.Children.map(children, (c) => (
      <div style={{ padding: 'var(--spacing-24)', background: 'var(--color-background-surface)', borderRadius: 'var(--border-radius-card)', maxWidth: width }}>{c}</div>
    ))}
  </div>
);

const meta: Meta<typeof SectionHead> = {
  title: 'Components/Layout/SectionHead',
  component: SectionHead,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: contract.a11y },
  },
  argTypes: {
    iconTone: { control: 'inline-radio' },
    action: { control: false },
    className: { control: false },
    style: { control: false },
  },
  args: {
    title: 'Needs your answer',
    number: '4',
    words: 'waiting on you',
    description: 'Decisions only you can make, oldest first.',
    icon: 'WarningCircle',
    iconTone: 'warning',
  },
};
export default meta;

type Story = StoryObj<typeof SectionHead>;

export const Playground: Story = {};

/** size="card": 16, the Stat card title, for a head inside a card that sits in a row of Stat cards (Health). */
export const CardSize: Story = {
  render: () => (
    <Cards>
      <SectionHead icon="WarningCircle" iconTone="warning" title="Drift from BELLA" number="3" words="tokens" size="card" />
      <SectionHead icon="WarningCircle" iconTone="warning" title="Drift from BELLA" number="3" words="tokens" />
    </Cards>
  ),
};

/** The Not again page: suggested (action), your call (no action), library (info). */
export const OnTheNotAgainPage: Story = {
  render: () => (
    <Cards>
      <SectionHead
        icon="WarningCircle"
        iconTone="warning"
        title="Suggested: Add contrast pair"
        description="9 components have no declared pair"
        action={<Button variant="primary" size="sm">Run on 9</Button>}
      />
      <SectionHead icon="Activity" iconTone="info" title="Running: Add contrast pair" description="9 components have no declared pair" action={<Button variant="secondary" size="sm">Stop</Button>} />
      <SectionHead icon="CheckCircle" iconTone="success" title="Kept: Add contrast pair" description="9 pairs added. Logged in History" />
      <SectionHead icon="Book" iconTone="neutral" title="Library" number="8" words="playbooks" description="Fixes saved as steps" />
    </Cards>
  ),
};

/** Every zone on and off: info only, number off, no icon, no description. */
export const Zones: Story = {
  render: () => (
    <Cards>
      <SectionHead title="Needs your answer" number="4" words="waiting on you" />
      <SectionHead title="Needs your answer" number="4" words="waiting on you" showNumber={false} />
      <SectionHead title="Needs your answer" description="Decisions only you can make, oldest first." />
      <SectionHead icon="WarningCircle" title="Needs your answer" number="4" words="waiting on you" description="Decisions only you can make, oldest first." action={<Button variant="secondary" size="sm">See all</Button>} />
    </Cards>
  ),
};

/** 320 wide: the info wraps under the title, the action keeps its width. */
export const Narrow: Story = {
  render: () => (
    <Cards width={320}>
      <SectionHead icon="WarningCircle" title="Needs your answer" number="4" words="waiting on you" description="Decisions only you can make." action={<Button variant="secondary" size="sm">Run</Button>} />
    </Cards>
  ),
};

export const Behavior: Story = {
  render: () => <SectionHead title="Library" number="8" words="playbooks" />,
  play: async ({ canvas }) => {
    expect(canvas.getByRole('heading', { level: 2, name: 'Library' })).toBeInTheDocument();
  },
};
