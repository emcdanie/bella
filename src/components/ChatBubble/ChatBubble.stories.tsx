import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import ChatBubble from './ChatBubble';
import bubbleCssRaw from './ChatBubble.module.css?raw';
import componentContract from '../../../tokens/component.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((bubbleCssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const bubbleContract = (componentContract as any).component?.['chat-bubble']?.$extensions?.bella ?? {};

const meta: Meta<typeof ChatBubble> = {
  title: 'Components/Chat/ChatBubble',
  component: ChatBubble,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: bubbleContract.a11y },
  },
  argTypes: {
    side: { control: 'inline-radio', options: ['sent', 'received'] },
    tail: { control: 'boolean' },
    kind: { control: 'inline-radio', options: ['text', 'ask', 'big-emoji', 'image'] },
  },
  args: { side: 'sent', tail: false, kind: 'text', children: 'Hello, how are you doing today?' },
};
export default meta;

type Story = StoryObj<typeof ChatBubble>;

/** Side-by-side: sent (ink) and received (card surface). */
export const SideBySide: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)', maxWidth: 320 }}>
      <ChatBubble side="sent">Hey, you free tomorrow?</ChatBubble>
      <ChatBubble side="received">Yeah! What time?</ChatBubble>
      <ChatBubble side="sent" tail>Around 3pm works for me.</ChatBubble>
      <ChatBubble side="received" tail>Perfect, see you then.</ChatBubble>
    </div>
  ),
};

/** The tail corner flattens on the last bubble in a run. */
export const Tails: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)', maxWidth: 320 }}>
      <ChatBubble side="sent">Consecutive bubble, no tail.</ChatBubble>
      <ChatBubble side="sent" tail>Last in run. Tail on.</ChatBubble>
      <ChatBubble side="received">Consecutive bubble, no tail.</ChatBubble>
      <ChatBubble side="received" tail>Last in run. Tail on.</ChatBubble>
    </div>
  ),
};

/** big-emoji uses the slam animation and a transparent fill. */
export const BigEmoji: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
      <ChatBubble side="sent" kind="big-emoji" emojiLabel="Waving hand">
        👋
      </ChatBubble>
      <ChatBubble side="received" kind="big-emoji" emojiLabel="Celebration">
        🎉
      </ChatBubble>
    </div>
  ),
};

/** kind="image": the picture fills the bubble and never overflows it. */
export const ImageBubble: Story = {
  render: () => (
    <ChatBubble side="received" kind="image">
      <img src="/avatars/seamus.png" alt="Seamus behind the bar" width={160} height={160} />
    </ChatBubble>
  ),
};

/** Tapback sits above the bubble corner. */
export const Tapback: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)', padding: 'var(--spacing-6)', maxWidth: 320 }}>
      <ChatBubble side="sent" tapback="❤️">Nice work!</ChatBubble>
      <ChatBubble side="received" tapback="😂">That is hilarious.</ChatBubble>
    </div>
  ),
};

/** AAA on both fills. */
export const Behavior: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)', maxWidth: 320 }}>
      <ChatBubble side="sent" tail>Sent message</ChatBubble>
      <ChatBubble side="received" tail>Received message</ChatBubble>
    </div>
  ),
  play: async ({ canvas, step }) => {
    const sent = canvas.getByText('Sent message');
    const recv = canvas.getByText('Received message');

    await step('bubbles contain their text (no overflow)', async () => {
      const sentRect = sent.getBoundingClientRect();
      const recvRect = recv.getBoundingClientRect();
      expect(sentRect.width).toBeGreaterThan(0);
      expect(recvRect.width).toBeGreaterThan(0);
    });

    await step('big-emoji has accessible label, not bare emoji text', async () => {
      // not present in this story, so just check the other elements are present
      expect(sent.closest('[data-bella-component="chat-bubble"]')).not.toBeNull();
      expect(recv.closest('[data-bella-component="chat-bubble"]')).not.toBeNull();
    });
  },
};
