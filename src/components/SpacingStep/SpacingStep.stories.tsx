import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import SpacingStep from './SpacingStep';
import cssRaw from './SpacingStep.module.css?raw';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))).sort();

const meta: Meta<typeof SpacingStep> = {
  title: 'Components/Data/SpacingStep',
  component: SpacingStep,
  parameters: { docs: { page: ComponentDocsPage }, bellaDocs: { tokens: consumedTokens } },
};
export default meta;
type Story = StoryObj<typeof SpacingStep>;

/* every number in Geist Mono: the element's face is the number token's first family */
const numberFace = (el: Element) => getComputedStyle(document.documentElement).getPropertyValue('--typography-number-font-family').split(',')[0].trim().replace(/['"]/g, '');
const faceOf = (el: Element) => getComputedStyle(el).fontFamily.split(',')[0].trim().replace(/['"]/g, '');

/** The whole ramp, as on CHIP Foundations: each bar is its spacing token. */
export const Ramp: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--spacing-12)', maxInlineSize: '20rem', padding: 'var(--spacing-24)', background: 'var(--color-background-surface)' }}>
      {([1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 'touch'] as const).map((s) => (
        <SpacingStep key={String(s)} step={s} />
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const value = canvasElement.querySelector('[data-bella-component="spacing-step"] span:last-child')!;
    await expect(faceOf(value)).toBe(numberFace(value));
  },
};
