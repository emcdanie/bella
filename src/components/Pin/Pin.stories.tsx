import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import Pin from './Pin';
import Leader from '../Leader/Leader';
import cssRaw from './Pin.module.css?raw';
import componentContract from '../../../tokens/contracts.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const contract = (componentContract as any).component?.pin?.$extensions?.bella ?? {};

const meta: Meta<typeof Pin> = {
  title: 'Components/Layout/Pin',
  component: Pin,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: contract.a11y },
  },
  argTypes: {
    tone: { control: 'inline-radio' },
    variant: { control: 'inline-radio' },
    number: { control: 'text' },
    label: { control: 'text' },
    onClick: { control: false },
    className: { control: false },
    style: { control: false },
  },
  args: { number: '1', tone: 'pink', label: 'Fill' },
};
export default meta;

type Story = StoryObj<typeof Pin>;

/** The five tones (pop colours). The number and word say it; the colour only groups. */
export const Tones: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-12)' }}>
      <Pin number="1" tone="yellow" label="Key shadow" />
      <Pin number="2" tone="pink" label="Fill" />
      <Pin number="3" tone="blue" label="Box" />
      <Pin number="4" tone="red" label="Focus ring" />
      <Pin number="5" tone="green" label="Label" />
      <Pin number="12" tone="pink" />
    </div>
  ),
};

/** With onClick it is a button: a 44px box and BELLA's focus ring. */
export const Clickable: Story = {
  args: { onClick: fn(), number: '3', tone: 'blue', label: 'Box' },
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
        gap: 'var(--spacing-32)',
        justifyItems: 'start',
        padding: 'var(--spacing-32)',
        backgroundColor: 'var(--color-background-default)',
        backgroundImage: 'none',
        backgroundSize: 'var(--spacing-24) var(--spacing-24)',
      }}
    >
      <span
        id="pin-story-part"
        style={{
          padding: 'var(--spacing-12) var(--spacing-16)',
          border: 'var(--border-width-1) solid var(--color-border-strong)',
          color: 'var(--color-content-default)',
        }}
      >
        The part it explains
      </span>
      <span id="pin-story-note" style={{ justifySelf: 'end' }}>
        <Pin number="1" tone="red" label="Focus ring" />
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

/** style="solid": the disc filled in its tone with an ink number (anatomy pins, the Tour step), all five tones. */
export const Solid: StoryObj<typeof Pin> = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--spacing-16)', padding: 'var(--spacing-24)', background: 'var(--color-background-surface)' }}>
      {(['yellow', 'pink', 'blue', 'red', 'green'] as const).map((v, i) => (
        <Pin key={v} number={`0${i + 1}`} tone={v} variant="solid" />
      ))}
    </div>
  ),
};

/** A comment's pin, as Figma draws it (23 Nov 2026): the author's initials on a white teardrop pointing at the spot. */
export const Comment: Story = {
  args: { number: 'EM', variant: 'comment', ariaLabel: 'Comment 1 by Elleta McDaniel', onClick: () => {} },
  play: async ({ canvasElement }) => {
    const disc = canvasElement.querySelector('[data-bella-component="pin"] span') as HTMLElement;
    await expect(getComputedStyle(disc).borderBottomLeftRadius).toBe('0px');
  },
};
