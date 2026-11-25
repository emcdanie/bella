import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import VariantTile from './VariantTile';
import Button from '../Button/Button';
import cssRaw from './VariantTile.module.css?raw';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))).sort();

const meta: Meta<typeof VariantTile> = {
  title: 'Components/Data/VariantTile',
  component: VariantTile,
  parameters: { docs: { page: ComponentDocsPage }, bellaDocs: { tokens: consumedTokens } },
};
export default meta;
type Story = StoryObj<typeof VariantTile>;

const Ground = ({ children }: { children: React.ReactNode }) => (
  <div style={{ padding: 'var(--spacing-24)', background: 'var(--color-background-surface)' }}>{children}</div>
);

/** A strip of thumbnails that picks one: here the Button's variants, Primary selected. Her states strip
 * (Default, Hover, Pressed, Focus) needs each preview drawn in that state, which Button cannot be told yet. */
export const Strip: Story = {
  render: () => {
    const [state, setState] = useState('Primary');
    const tiles: [string, React.ReactNode][] = [
      ['Primary', <Button key="p" variant="primary" size="sm">Send</Button>],
      ['Secondary', <Button key="s" variant="secondary" size="sm">Send</Button>],
      ['Tertiary', <Button key="t" variant="tertiary" size="sm">Send</Button>],
      ['Disabled', <Button key="x" variant="primary" size="sm" disabled>Send</Button>],
    ];
    return (
      <Ground>
        <div role="group" aria-label="Variants" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(8rem, 1fr))', gap: 'var(--spacing-8)' }}>
          {tiles.map(([name, preview]) => (
            <VariantTile key={name} label={name} selected={state === name} onClick={() => setState(name)}>
              {preview}
            </VariantTile>
          ))}
        </div>
      </Ground>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Primary' })).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(canvas.getByRole('button', { name: 'Secondary' }));
    await expect(canvas.getByRole('button', { name: 'Secondary' })).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(canvas.getByRole('button', { name: 'Primary' }));
    (document.activeElement as HTMLElement | null)?.blur();
  },
};

/** Figma "Show check badge": a copied or done state. Not clickable: a plain figure. */
export const Checked: Story = {
  render: () => (
    <Ground>
      <div style={{ inlineSize: '12rem' }}>
        <VariantTile label="Copied" checked>
          <Button variant="secondary" size="sm">Copy</Button>
        </VariantTile>
      </div>
    </Ground>
  ),
};
