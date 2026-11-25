import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import TourStep from './TourStep';
import cssRaw from './TourStep.module.css?raw';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))).sort();

const meta: Meta<typeof TourStep> = {
  title: 'Components/Layout/TourStep',
  component: TourStep,
  parameters: { docs: { page: ComponentDocsPage }, bellaDocs: { tokens: consumedTokens } },
};
export default meta;
type Story = StoryObj<typeof TourStep>;

const noop = () => {};

/** Both Figma variants: a middle step (Next) and the last step (Done). */
export const Steps: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 22.5rem), 1fr))', gap: 'var(--spacing-24)', padding: 'var(--spacing-24)', background: 'var(--color-background-default)' }}>
      <TourStep number="01" count="4 of 4 steps" onBack={noop} onNext={noop} onClose={noop}>
        true means yes, false means no. So the contrast check passed.
      </TourStep>
      <TourStep number="01" count="4 of 4 steps" isEnd onBack={noop} onNext={noop} onClose={noop}>
        true means yes, false means no. So the contrast check passed.
      </TourStep>
    </div>
  ),
};
