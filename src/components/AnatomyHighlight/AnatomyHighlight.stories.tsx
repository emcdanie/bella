import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import AnatomyHighlight, { AnatomyTag } from './AnatomyHighlight';
import Button from '../Button/Button';
import Tag from '../Tag/Tag';
import cssRaw from './AnatomyHighlight.module.css?raw';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))).sort();

const meta: Meta<typeof AnatomyHighlight> = {
  title: 'Components/Layout/AnatomyHighlight',
  component: AnatomyHighlight,
  parameters: { docs: { page: ComponentDocsPage }, bellaDocs: { tokens: consumedTokens } },
};
export default meta;
type Story = StoryObj<typeof AnatomyHighlight>;

const Spot = ({ children }: { children: React.ReactNode }) => (
  <span style={{ position: 'relative', display: 'inline-flex' }}>{children}</span>
);

/** Her doc-page anatomy: an outline round the piece and its name on the edge. Square for a box, round for a pill; the tag moves under when something above would cover it. */
export const Shapes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--spacing-80)', padding: 'var(--spacing-64) var(--spacing-48)', background: 'var(--color-background-default)' }}>
      <Spot>
        <Button variant="secondary">Open the story</Button>
        <AnatomyHighlight label="Box" style={{ inset: 0 }} />
      </Spot>
      <Spot>
        <Tag>Live</Tag>
        <AnatomyHighlight label="Pill" shape="round" tag="bottom" style={{ inset: 0 }} />
      </Spot>
      <AnatomyTag>Label</AnatomyTag>
    </div>
  ),
};
