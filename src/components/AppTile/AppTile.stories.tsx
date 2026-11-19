import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import AppTile from './AppTile';
import cssRaw from './AppTile.module.css?raw';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))).sort();

const meta: Meta<typeof AppTile> = {
  title: 'Components/Data/AppTile',
  component: AppTile,
  parameters: { docs: { page: ComponentDocsPage }, bellaDocs: { tokens: consumedTokens } },
};
export default meta;
type Story = StoryObj<typeof AppTile>;

/** The Figma set: five tones in three sizes, the GitHub mark on each (as Figma draws it). */
export const Tones: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, max-content)', gap: 'var(--spacing-24)', alignItems: 'center', padding: 'var(--spacing-24)', background: 'var(--color-background-surface)' }}>
      {(['inverse', 'outline', 'git', 'claude', 'info'] as const).flatMap((t) =>
        (['md', 'sm', 'lg'] as const).map((s) => <AppTile key={t + s} tone={t} size={s} brand="github" />)
      )}
    </div>
  ),
};

/** On Connectors: GitHub, git, the agent and the local model, one with a badge. */
export const Connectors: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-24)', padding: 'var(--spacing-24)', background: 'var(--color-background-surface)' }}>
      <AppTile tone="inverse" brand="github" badge="2 failing" />
      <AppTile tone="git" icon="GitBranch" />
      <AppTile tone="claude" icon="Brain" />
      <AppTile tone="info" icon="Key" />
      <AppTile tone="outline" brand="figma" />
    </div>
  ),
};
