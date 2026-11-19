import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import Notification from './Notification';
import cssRaw from './Notification.module.css?raw';
import componentContract from '../../../tokens/contracts.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const contract = (componentContract as any).component?.notification?.$extensions?.bella ?? {};

const TONES = ['info', 'success', 'attention', 'danger'] as const;

/** One card surface; dark comes from the token modes. The theme toolbar
 * picks the theme (audit:visual shoots all four). */
const Themed = ({ children, width }: { children: React.ReactNode; width?: number }) => (
  <div
    style={{
      padding: 'var(--spacing-24)',
      background: 'var(--color-background-surface)',
      borderRadius: 'var(--border-radius-card)',
      display: 'grid',
      gap: 'var(--spacing-24)',
      maxWidth: width,
    }}
  >
    {children}
  </div>
);

const meta: Meta<typeof Notification> = {
  title: 'Components/Notification',
  component: Notification,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: contract.a11y },
  },
  argTypes: {
    tone: { control: 'inline-radio' },
    message: { control: 'text' },
    title: { control: 'text' },
    action: { control: false },
    secondAction: { control: false },
    onClose: { control: false },
    className: { control: false },
    style: { control: false },
  },
  args: {
    tone: 'attention',
    title: 'Needs you',
    message: 'Figma can’t see CodeBlock: no file key in server/.env',
    action: { label: 'Add file key' },
    onClose: () => {},
  },
};
export default meta;

type Story = StoryObj<typeof Notification>;

export const Playground: Story = {};

/** Every tone, with every zone on: icon, title, message, two actions, close. */
export const Tones: Story = {
  render: () => (
    <Themed width={960}>
      {TONES.map((tone) => (
        <Notification
          key={tone}
          tone={tone}
          title="Needs you"
          message="Figma can’t see CodeBlock: no file key in server/.env"
          action={{ label: 'Add file key', onClick: () => {} }}
          secondAction={{ label: 'Later', onClick: () => {} }}
          onClose={() => {}}
        />
      ))}
    </Themed>
  ),
};

/** As the Not again page uses it: info, icon on, no action, no close; and
 * the kept state: success with one action. */
export const OnTheNotAgainPage: Story = {
  render: () => (
    <Themed width={960}>
      <Notification
        tone="info"
        title="What is a playbook?"
        message="A fix that worked before, saved as steps, so Claude repeats it the same way when a check finds that problem again."
      />
      <Notification
        tone="success"
        title="Kept"
        message="Add contrast pair: 9 pairs added. Logged in History."
        action={{ label: 'Undo', onClick: () => {} }}
      />
    </Themed>
  ),
};

/** Zones off one at a time: no icon; title only; message only. */
export const Zones: Story = {
  render: () => (
    <Themed width={960}>
      <Notification tone="attention" showIcon={false} title="No icon" message="The texts keep their own left edge." onClose={() => {}} />
      <Notification tone="info" title="Title only" />
      <Notification tone="danger" message="Message only: the publish failed. Try again in a minute." action={{ label: 'Try again' }} />
    </Themed>
  ),
};

/** Narrow (320): the actions drop under the text on its left edge; close stays top right. */
export const Narrow: Story = {
  render: () => (
    <Themed width={320}>
      <Notification
        tone="attention"
        title="Needs you"
        message="Figma can’t see CodeBlock: no file key in server/.env"
        action={{ label: 'Add file key' }}
        onClose={() => {}}
      />
    </Themed>
  ),
};

export const Behavior: Story = {
  render: () => (
    <Notification tone="danger" title="Publish failed" message="Try again." action={{ label: 'Try again' }} onClose={() => {}} />
  ),
  play: async ({ canvas, step }) => {
    await step('danger is an alert, the tone is in words, close is named and 44', async () => {
      const root = canvas.getByRole('alert');
      expect(root).toHaveTextContent('Error:');
      const close = canvas.getByRole('button', { name: 'Close' });
      const r = close.getBoundingClientRect();
      expect(r.width).toBeGreaterThanOrEqual(32);
    });
  },
};
