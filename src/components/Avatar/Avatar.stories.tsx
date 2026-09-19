import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import Avatar from './Avatar';
import avatarCssRaw from './Avatar.module.css?raw';
import componentContract from '../../../tokens/component.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((avatarCssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const avatarContract = (componentContract as any).component?.avatar?.$extensions?.bella ?? {};

const meta: Meta<typeof Avatar> = {
  title: 'Components/Avatar',
  component: Avatar,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: avatarContract.a11y },
  },
  argTypes: {
    size: { control: 'inline-radio' },
    ring: { control: 'boolean' },
    className: { control: false },
    style: { control: false },
  },
  args: { name: 'Elleta McDaniel', size: 'md', ring: false },
};
export default meta;

type Story = StoryObj<typeof Avatar>;

/** The three ramp steps, initials only, so the type scale inside the disc is visible. */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)' }}>
      <Avatar name="Elleta McDaniel" size="sm" />
      <Avatar name="Elleta McDaniel" size="md" />
      <Avatar name="Elleta McDaniel" size="lg" />
    </div>
  ),
};

/** The ring is a rest state. The gap is painted in the page ground, so it
 * separates the accent from the disc on whatever surface the avatar sits on. */
export const Ring: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-6)' }}>
      <Avatar name="Elleta McDaniel" size="lg" />
      <Avatar name="Elleta McDaniel" size="lg" ring />
    </div>
  ),
};

/** The common case: an avatar beside the name it belongs to, on the raised
 * surface a Card provides. The image is decorative here because the name is
 * already written next to it. */
export const WithName: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-3)',
        maxWidth: 360,
        padding: 'var(--spacing-5)',
        background: 'var(--color-semantic-surface)',
        borderRadius: 'var(--radius-lg)',
      }}
    >
      <Avatar name="Elleta McDaniel" size="md" />
      <span>
        <span style={{ display: 'block', fontWeight: 'var(--typography-font-weight-bold)' }}>
          Elleta McDaniel
        </span>
        <span
          style={{
            display: 'block',
            fontSize: 'var(--typography-font-size-tag)',
            color: 'var(--color-semantic-text-secondary)',
          }}
        >
          Design systems
        </span>
      </span>
    </div>
  ),
};

/**
 * Static by construction, and it announces once. Without an image the root is
 * the image: labelled with the full name, initials hidden, so assistive tech
 * says the person and not two stray letters.
 */
export const Behavior: Story = {
  render: () => <Avatar name="Elleta McDaniel" size="lg" ring />,
  play: async ({ canvas, step }) => {
    const el = canvas.getByRole('img', { name: 'Elleta McDaniel' });

    await step('initials are derived, and hidden from assistive tech', async () => {
      expect(el).toHaveTextContent('EM');
      expect(el.querySelector('[aria-hidden="true"]')).not.toBeNull();
    });

    await step('not a control: no role button or link, no tab stop', async () => {
      expect(canvas.queryAllByRole('button')).toHaveLength(0);
      expect(canvas.queryAllByRole('link')).toHaveLength(0);
      expect(el).not.toHaveAttribute('tabindex');
    });

    await step('inert at rest: no transform, no animation', async () => {
      const cs = getComputedStyle(el);
      expect(cs.transform === 'none' || cs.transform === '').toBe(true);
      expect(cs.animationName).toBe('none');
    });

    await step('the ring is a spread box-shadow, so it costs no layout', async () => {
      expect(getComputedStyle(el).boxShadow).not.toBe('none');
      expect(el.getBoundingClientRect().width).toBe(80);
    });
  },
};
