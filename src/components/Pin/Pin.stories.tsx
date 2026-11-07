import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import Pin from './Pin';
import Leader from '../Leader/Leader';
import cssRaw from './Pin.module.css?raw';
import componentContract from '../../../tokens/component.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const contract = (componentContract as any).component?.pin?.$extensions?.bella ?? {};

const meta: Meta<typeof Pin> = {
  title: 'Components/Pin',
  component: Pin,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: contract.a11y },
  },
  argTypes: {
    variant: { control: 'inline-radio' },
    number: { control: 'text' },
    label: { control: 'text' },
    onClick: { control: false },
    className: { control: false },
    style: { control: false },
  },
  args: { number: '1', variant: 'pink', label: 'Fill' },
};
export default meta;

type Story = StoryObj<typeof Pin>;

/** The four pops. The number and word say it; the colour only groups. */
export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-3)' }}>
      <Pin number="1" variant="yellow" label="Key shadow" />
      <Pin number="2" variant="pink" label="Fill" />
      <Pin number="3" variant="blue" label="Box" />
      <Pin number="4" variant="red" label="Focus ring" />
      <Pin number="12" variant="pink" />
    </div>
  ),
};

/** With onClick it is a button: a 44px box and BELLA's focus ring. */
export const Clickable: Story = {
  args: { onClick: fn(), number: '3', variant: 'blue', label: 'Box' },
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole('button', { name: /Box/ });
    await expect(button.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalled();
  },
};

/** A pin tied to what it explains by a Leader, on the grid canvas. */
export const WithLeader: Story = {
  render: () => (
    <div
      style={{
        position: 'relative',
        display: 'grid',
        gap: 'var(--spacing-8)',
        justifyItems: 'start',
        padding: 'var(--spacing-8)',
        backgroundColor: 'var(--color-semantic-background)',
        backgroundImage: 'var(--color-semantic-canvas-grid)',
        backgroundSize: 'var(--spacing-6) var(--spacing-6)',
      }}
    >
      <span
        id="pin-story-part"
        style={{
          padding: 'var(--spacing-3) var(--spacing-4)',
          border: 'var(--border-width-thin) solid var(--color-semantic-border-strong)',
          color: 'var(--color-semantic-text-primary)',
        }}
      >
        The part it explains
      </span>
      <span id="pin-story-note" style={{ justifySelf: 'end' }}>
        <Pin number="1" variant="red" label="Focus ring" />
      </span>
      <Leader from="#pin-story-note" to="#pin-story-part" label="Pin 1 points to the part it explains" variant="red" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const svg = canvasElement.querySelector('[data-bella-component="leader"]');
    await expect(svg?.getAttribute('aria-label')).toBeTruthy();
    await waitFor(() => expect(svg?.querySelectorAll('path').length).toBeGreaterThan(0));
  },
};
