import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';
import ConnectorTile from './ConnectorTile';
import AppTile from '../AppTile/AppTile';
import Button from '../Button/Button';
import cssRaw from './ConnectorTile.module.css?raw';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))).sort();

const meta: Meta<typeof ConnectorTile> = {
  title: 'Components/Data/ConnectorTile',
  component: ConnectorTile,
  parameters: { docs: { page: ComponentDocsPage }, bellaDocs: { tokens: consumedTokens } },
};
export default meta;
type Story = StoryObj<typeof ConnectorTile>;

/** The Connectors row: GitHub CI, git, Claude and the local model, all one height. */
export const Row: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(15rem, 1fr))', gap: 'var(--spacing-24)', padding: 'var(--spacing-24)', background: 'var(--color-background-default)' }}>
      <ConnectorTile appTile={<AppTile tone="inverse" brand="github" />} status="Live" name="GitHub CI" value="4 to push" detail="CI hasn't run" action={<Button variant="secondary" size="sm">Push</Button>} />
      <ConnectorTile appTile={<AppTile tone="git" icon="GitBranch" />} status="Live" name="git" value="main · clean" detail="2 branches" />
      <ConnectorTile appTile={<AppTile tone="claude" icon="Brain" />} status="Waiting" statusTone="attention" name="Claude" value="1 waiting on you" action={<Button variant="secondary" size="sm">Open</Button>} />
      <ConnectorTile appTile={<AppTile tone="info" icon="Key" />} status="Off" statusTone="neutral" name="Local model" value="Not running" detail="Start it in a terminal" />
    </div>
  ),
};

function GlowDemo() {
  const [n, setN] = React.useState(4);
  return (
    <ConnectorTile
      appTile={<AppTile tone="inverse" brand="github" />}
      status="Live"
      name="GitHub CI"
      value={`${n} to push`}
      detail="CI hasn't run"
      action={<Button variant="secondary" size="sm" onClick={() => setN((x) => x - 1)}>Test</Button>}
    />
  );
}

/** A changed value glows once (rule "Motion that shows what happened", item 1): Test reads the
 * service again and its new value glows, once. Nothing glows on first paint; reduced motion: none. */
export const ValueGlow: Story = {
  render: () => <GlowDemo />,
  play: async ({ canvasElement, canvas, step }) => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    await step('first paint: no glow', async () => {
      await expect(canvasElement.querySelector('[class*="glow"]')).toBeNull();
    });
    await step(reduced ? 'a new value: no glow under reduced motion' : 'a new value glows once', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Test' }));
      const glow = canvasElement.querySelector('[class*="glow"]') as HTMLElement;
      await expect(glow).not.toBeNull();
      await expect(getComputedStyle(glow).animationName).toMatch(reduced ? /^none$/ : /valueGlow/);
      if (!reduced) await expect(getComputedStyle(glow).animationIterationCount).toBe('1');
    });
  },
};
