import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import ChatThread, { ChatThreadTimestamp, ChatThreadDelivered } from './ChatThread';
import ChatBubble from '../ChatBubble/ChatBubble';
import TypingDots from '../TypingDots/TypingDots';
import threadCssRaw from './ChatThread.module.css?raw';
import componentContract from '../../../tokens/component.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((threadCssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const threadContract = (componentContract as any).component?.['chat-thread']?.$extensions?.bella ?? {};

const meta: Meta<typeof ChatThread> = {
  title: 'Components/Chat/ChatThread',
  component: ChatThread,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: threadContract.a11y },
    layout: 'padded',
  },
};
export default meta;

type Story = StoryObj<typeof ChatThread>;

/** A realistic exchange showing timestamp, sent/received runs, and Delivered. */
export const Default: Story = {
  render: () => (
    <div style={{ maxWidth: 420, margin: '0 auto' }}>
      <ChatThread label="The Bar">
        <ChatThreadTimestamp>Today 21:14</ChatThreadTimestamp>
        <ChatBubble side="received">First round on me.</ChatBubble>
        <ChatBubble side="received" tail>Lager for everyone.</ChatBubble>
        <ChatBubble side="sent">You sure about that?</ChatBubble>
        <ChatBubble side="sent" tail>Last time it cost a fortune.</ChatBubble>
        <ChatBubble side="received" tail>100%.</ChatBubble>
        <ChatBubble side="sent" kind="big-emoji" emojiLabel="Celebration">🎉</ChatBubble>
        <ChatBubble side="sent" tail>See you all Thursday.</ChatBubble>
        <ChatThreadDelivered />
      </ChatThread>
    </div>
  ),
};

/** Typing indicator appearing after a message. */
export const WithTyping: Story = {
  render: () => (
    <div style={{ maxWidth: 420, margin: '0 auto' }}>
      <ChatThread label="The Bar">
        <ChatBubble side="sent" tail>You all coming Thursday?</ChatBubble>
        <TypingDots name="Dara" />
      </ChatThread>
    </div>
  ),
};

/** wee-dote theme with the sage background. */
export const WeeDote: Story = {
  parameters: { backgrounds: { default: 'wee-dote' } },
  render: () => (
    <div
      style={{
        maxWidth: 420,
        margin: '0 auto',
        background: 'var(--color-semantic-surface)',
        borderRadius: 'var(--radius-2xl)',
        overflow: 'hidden',
      }}
    >
      <ChatThread label="The Bar wee-dote">
        <ChatThreadTimestamp>Today 21:14</ChatThreadTimestamp>
        <ChatBubble side="received">First round on me.</ChatBubble>
        <ChatBubble side="received" tail>Lager for everyone.</ChatBubble>
        <ChatBubble side="sent" tail>Legend.</ChatBubble>
        <ChatThreadDelivered />
      </ChatThread>
    </div>
  ),
};

/** Fluid to 320px. The smallest supported width. */
export const Narrow: Story = {
  render: () => (
    <div style={{ maxWidth: 320 }}>
      <ChatThread label="Narrow">
        <ChatBubble side="received" tail>Narrow layout, no overflow.</ChatBubble>
        <ChatBubble side="sent" tail>Text wraps cleanly.</ChatBubble>
      </ChatThread>
    </div>
  ),
};

export const Behavior: Story = {
  render: () => (
    <div style={{ maxWidth: 420 }}>
      <ChatThread label="Test log">
        <ChatBubble side="sent" tail>Hello</ChatBubble>
        <ChatBubble side="received" tail>World</ChatBubble>
      </ChatThread>
    </div>
  ),
  play: async ({ canvas, step }) => {
    const log = canvas.getByRole('log');

    await step('thread is a live region with the provided label', async () => {
      expect(log).toHaveAttribute('aria-live', 'polite');
      expect(log).toHaveAttribute('aria-label', 'Test log');
    });

    await step('data-bella-component present', async () => {
      expect(log.dataset.bellaComponent).toBe('chat-thread');
    });
  },
};
