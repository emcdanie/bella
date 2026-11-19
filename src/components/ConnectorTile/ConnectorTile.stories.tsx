import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
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
