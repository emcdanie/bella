import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import Toast from './Toast';
import cssRaw from './Toast.module.css?raw';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))).sort();

const meta: Meta<typeof Toast> = {
  title: 'Components/Layout/Toast',
  component: Toast,
  parameters: { docs: { page: ComponentDocsPage }, bellaDocs: { tokens: consumedTokens } },
};
export default meta;
type Story = StoryObj<typeof Toast>;

const noop = () => {};

/** The four Figma tones, with the action and Close; stays put here (duration 0) so it can be looked at. */
export const Tones: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--spacing-16)', padding: 'var(--spacing-24)', background: 'var(--color-background-default)' }}>
      <Toast tone="success" action={{ label: 'Undo', onClick: noop }} onClose={noop} duration={0}>Accepted. Logged in History.</Toast>
      <Toast tone="info" onClose={noop} duration={0}>Sent to the agent. It picks it up next.</Toast>
      <Toast tone="attention" action={{ label: 'Stop', onClick: noop }} onClose={noop} duration={0}>Running on 9 parts.</Toast>
      <Toast tone="danger" onClose={noop} duration={0}>Couldn't reach Figma. Try again.</Toast>
    </div>
  ),
};
