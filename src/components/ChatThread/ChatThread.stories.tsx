import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import ChatThread, { ChatThreadTimestamp, ChatThreadDelivered } from './ChatThread';
import ChatBubble from '../ChatBubble/ChatBubble';
import TypingDots from '../TypingDots/TypingDots';
import AvatarStack, { type AvatarStackMember } from '../AvatarStack/AvatarStack';
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

/* The Bar members for the first-screen story. Photos from /avatars/*.png.
   Elleta has no photo; she stays as a ringed initials disc. */
const THE_BAR_HEADER: AvatarStackMember[] = [
  { name: 'Elleta',  ringColor: 'var(--color-semantic-text-primary)', showInitials: true },
  { name: 'Seamus',  src: '/avatars/seamus.png',  ringColor: 'var(--color-semantic-text-primary)' },
  { name: 'Dara',    src: '/avatars/dara.png',    ringColor: 'var(--color-wee-dote-lane-a)' },
  { name: 'Bernie',  src: '/avatars/bernie.png',  ringColor: 'var(--color-wee-dote-lane-b)' },
  { name: 'Saoirse', src: '/avatars/saoirse.png', ringColor: 'var(--color-wee-dote-lane-c)' },
  { name: 'Frankie', src: '/avatars/frankie.png', ringColor: 'var(--color-wee-dote-lane-d)' },
  { name: 'Liam',    src: '/avatars/liam.png',    ringColor: 'var(--color-wee-dote-lane-e)' },
];

const BarHeader = () => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 'var(--spacing-2)',
      padding: 'var(--spacing-3) var(--spacing-4) var(--spacing-2)',
      borderBottom: '1px solid var(--color-semantic-border)',
      background: 'var(--color-semantic-surface)',
      textAlign: 'center',
    }}
  >
    <AvatarStack members={THE_BAR_HEADER} size="sm" surfaceColor="var(--color-semantic-surface)" max={7} />
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1)', alignSelf: 'stretch', minWidth: 0 }}>
      <span style={{ fontFamily: 'var(--typography-font-family-body)', fontSize: 'var(--typography-font-size-body)', fontWeight: 600, color: 'var(--color-semantic-text-primary)', lineHeight: 'var(--typography-line-height-normal)', textAlign: 'center' }}>
        The Bar
      </span>
      <span style={{ fontFamily: 'var(--typography-font-family-body)', fontSize: 'var(--typography-font-size-label)', color: 'var(--color-semantic-text-secondary)', lineHeight: 'var(--typography-line-height-normal)', textAlign: 'center', overflowWrap: 'anywhere' }}>
        Elleta, Seamus, Dara, Bernie, Saoirse, Frankie, Liam
      </span>
    </div>
  </div>
);

const FirstScreenContent = () => (
  <ChatThread label="The Bar">
    <ChatThreadTimestamp boldWord="Friday">13:54</ChatThreadTimestamp>
    <ChatBubble side="sent" tail>
      belfast mode {String.fromCodePoint(0x1F37B)} show me what is live, what needs review. The live site still has responsive and image issues, and sections aren&apos;t staying in the frame. go
    </ChatBubble>
    <ChatBubble side="received" senderName="Seamus">
      Go? That&apos;s it? A dozen skills behind me and all I get is go. Grand. On it {String.fromCodePoint(0x1FAE1)}
    </ChatBubble>
    <ChatBubble side="received" tail disc="var(--color-semantic-text-primary)">
      Status board&apos;s up on the right. Your live-site flags aren&apos;t measured yet, so I&apos;m not claiming anything&apos;s fixed.
    </ChatBubble>
    <ChatBubble side="sent" tail tapback="‼️">
      ok I cleared all the terminals, let&apos;s go
    </ChatBubble>
    <ChatBubble side="received" senderName="Bernie" disc="var(--color-wee-dote-lane-b)" tail>
      Right, I&apos;ve had a proper look at every section. Pull up a chair. {String.fromCodePoint(0x1F4CB)}
    </ChatBubble>
  </ChatThread>
);

/** First screen of The Bar: stamp, Elleta opens, Seamus x2, Elleta tapback, Bernie. Light theme. */
export const TheBarFirstScreenLight: Story = {
  render: () => (
    <div style={{ maxWidth: 420, margin: '0 auto' }}>
      <div
        style={{
          background: 'var(--color-semantic-surface)',
          borderRadius: 'var(--radius-2xl)',
          overflow: 'hidden',
        }}
      >
        <BarHeader />
        <FirstScreenContent />
      </div>
    </div>
  ),
};

/** First screen of The Bar in wee-dote theme. Ground must be sage #CBD5CC. */
export const TheBarFirstScreenWeeDote: Story = {
  render: () => (
    <div
      data-theme="wee-dote"
      data-testid="wee-dote-wrapper"
      style={{
        maxWidth: 420,
        margin: '0 auto',
        background: 'var(--color-semantic-background)',
        borderRadius: 'var(--radius-2xl)',
        overflow: 'hidden',
        padding: 'var(--spacing-2)',
      }}
    >
      <div
        style={{
          background: 'var(--color-semantic-surface)',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
        }}
      >
        <BarHeader />
        <FirstScreenContent />
      </div>
    </div>
  ),
  play: async ({ canvas, step }) => {
    await step('wee-dote ground is sage (#CBD5CC)', async () => {
      const wrapper = canvas.getByTestId('wee-dote-wrapper');
      const bg = getComputedStyle(wrapper).backgroundColor;
      // Normalise via canvas pixel — works for oklch, rgb, hex alike.
      const toRgb = (css: string): [number, number, number] => {
        const cv = document.createElement('canvas');
        cv.width = 1; cv.height = 1;
        const ctx = cv.getContext('2d')!;
        ctx.fillStyle = css;
        ctx.fillRect(0, 0, 1, 1);
        const d = ctx.getImageData(0, 0, 1, 1).data;
        return [d[0], d[1], d[2]];
      };
      const [ar, ag, ab] = toRgb(bg);
      const [er, eg, eb] = toRgb('#CBD5CC');
      expect(Math.abs(ar - er) <= 2 && Math.abs(ag - eg) <= 2 && Math.abs(ab - eb) <= 2).toBe(true);
    });
  },
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
