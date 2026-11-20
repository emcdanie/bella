import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor } from 'storybook/test';
import Button from '../Button/Button';
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

function ComesAndGoes() {
  const [shown, setShown] = React.useState(true);
  return (
    <div style={{ display: 'grid', gap: 'var(--spacing-16)', justifyItems: 'start', padding: 'var(--spacing-24)', background: 'var(--color-background-default)' }}>
      <Button variant="secondary" onClick={() => setShown(true)}>
        Show the toast
      </Button>
      {shown ? (
        <Toast tone="success" onClose={() => setShown(false)} duration={0}>
          Accepted. Logged in History.
        </Toast>
      ) : null}
    </div>
  );
}

/** Comes and goes (rule "Motion that shows what happened", item 3): it slides up a step and fades in,
 * once; Close (or the time running out) fades it out, then it is gone. Reduced motion: it simply
 * appears and goes. */
export const ComesAndGoesMotion: Story = {
  name: 'Comes and goes',
  render: () => <ComesAndGoes />,
  play: async ({ canvasElement, canvas, step }) => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const toast = () => canvasElement.querySelector('[data-bella-component="toast"]') as HTMLElement | null;
    await step('arrives: slides up and fades in, once', async () => {
      await expect(getComputedStyle(toast()!).animationName).toMatch(reduced ? /^none$/ : /toastIn/);
      await Promise.all(toast()!.getAnimations().map((a) => a.finished));
      await expect(Number(getComputedStyle(toast()!).opacity)).toBe(1);
    });
    await step('Close fades it out, then it is gone', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Close' }));
      await waitFor(() => expect(toast()).toBeNull());
    });
    await step('it can come back', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Show the toast' }));
      await waitFor(() => expect(toast()).not.toBeNull());
    });
  },
};
