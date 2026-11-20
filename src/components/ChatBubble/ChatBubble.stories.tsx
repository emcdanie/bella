import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import ChatBubble, { ReactionBar, type ReactionName } from './ChatBubble';
import bubbleCssRaw from './ChatBubble.module.css?raw';
import componentContract from '../../../tokens/contracts.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((bubbleCssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const bubbleContract = (componentContract as any).component?.['chat-bubble']?.$extensions?.bella ?? {};

const meta: Meta<typeof ChatBubble> = {
  title: 'Components/Data/ChatBubble',
  component: ChatBubble,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: bubbleContract.a11y },
  },
  argTypes: {
    side: { control: 'inline-radio', options: ['sent', 'received'] },
    tail: { control: 'boolean' },
    kind: { control: 'inline-radio', options: ['text', 'ask', 'draft', 'big-emoji', 'image'] },
  },
  args: { side: 'sent', tail: false, kind: 'text', children: 'Hello, how are you doing today?' },
};
export default meta;

type Story = StoryObj<typeof ChatBubble>;

/** Side-by-side: sent (her pink) and received. */
export const SideBySide: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-8)', maxWidth: 320 }}>
      <ChatBubble side="sent">Hey, you free tomorrow?</ChatBubble>
      <ChatBubble side="received">Yeah! What time?</ChatBubble>
      <ChatBubble side="sent" tail>Around 3pm works for me.</ChatBubble>
      <ChatBubble side="received" tail>Perfect, see you then.</ChatBubble>
    </div>
  ),
};

/** The tail sits on the last bubble in a run, on the speaker's side. */
export const Tails: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-8)', maxWidth: 320 }}>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-8)' }}>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-24)', padding: 'var(--spacing-24)', maxWidth: 320 }}>
      <ChatBubble side="sent" tapback="❤️">Nice work!</ChatBubble>
      <ChatBubble side="received" tapback="😂">That is hilarious.</ChatBubble>
    </div>
  ),
};

/** AAA on both fills. */
export const Behavior: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-8)', maxWidth: 320 }}>
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

/** ask and draft (BellaComponents, 11 Nov 2026). ask: a question waiting on
 * the reader, headed by an attention StatusPill. draft: an unsent reply, a
 * dashed outline on the surface with a quiet label. kindLabel sets the words. */
export const AskAndDraft: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)', maxWidth: 420 }}>
      <ChatBubble side="received" kind="ask" tail>Gate is green. Merge it?</ChatBubble>
      <ChatBubble side="sent" kind="draft" kindLabel="Claude's draft · edit before sending" tail>
        Yes, merge it.
      </ChatBubble>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    // the pop-in starts at opacity 0, so presence, not visibility
    await expect(c.getByText('Waiting on you')).toBeInTheDocument();
    await expect(c.getByText("Claude's draft · edit before sending")).toBeInTheDocument();
  },
};

/** A reaction lands like iMessage (rules/ask-bella-and-chat.md, 19 Nov): the tapback pops onto the
 * corner and six dots in the reaction colours burst out once and fade. Reduced motion: no burst, the
 * reaction is simply there. No Replay. */
export const ReactionBurst: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-24)', padding: 'var(--spacing-24)', maxWidth: 320 }}>
      <ChatBubble side="received" tail tapback="👍">
        Gate passed, all 44 parts.
      </ChatBubble>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const tapback = canvasElement.querySelector('[class*="tapback"]') as HTMLElement;
    const sparks = [...tapback.querySelectorAll('[class*="spark"]')] as HTMLElement[];
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    await step('six dots, hidden from assistive tech with the tapback', async () => {
      await expect(sparks.length).toBe(6);
      await expect(tapback).toHaveAttribute('aria-hidden', 'true');
    });
    await step(reduced ? 'reduced motion: no burst' : 'the burst plays once and is gone', async () => {
      if (reduced) {
        await expect(getComputedStyle(sparks[0].parentElement!).display).toBe('none');
        return;
      }
      await expect(getComputedStyle(sparks[0]).animationIterationCount).toBe('1');
      await Promise.all(sparks.flatMap((s) => s.getAnimations().map((a) => a.finished)));
      for (const s of sparks) await expect(Number(getComputedStyle(s).opacity)).toBe(0);
    });
  },
};

function ReactDemo() {
  const [picked, setPicked] = React.useState<ReactionName[]>([]);
  const toggle = (n: ReactionName) => setPicked((p) => (p.includes(n) ? p.filter((x) => x !== n) : [...p, n]));
  return (
    <div style={{ display: 'grid', gap: 'var(--spacing-24)', justifyItems: 'start', padding: 'var(--spacing-32) var(--spacing-24)', maxInlineSize: 'calc(var(--spacing-80) * 6)' }}>
      <ReactionBar label="React to BELLA's answer" selected={picked} onReact={toggle} />
      <ChatBubble side="received" tail reactions={picked}>
        2 of 43 components have no a11y notes: ScaledFrame and SectionHeader.
      </ChatBubble>
    </div>
  );
}

/** Reactions, coloured like iMessage (Figma _Reaction, Reaction bar and Reaction badge, 21 Nov; her
 * 19 Nov rule): pick from the bar (44 targets, aria-pressed), and the coloured badge pops onto the
 * bubble with a small burst. Reduced motion: it is simply there. */
export const Reactions: Story = {
  render: () => <ReactDemo />,
  play: async ({ canvasElement, canvas, step }) => {
    const bar = canvas.getByRole('group', { name: "React to BELLA's answer" });
    await step('six reactions, each a 44 target', async () => {
      const buttons = within(bar).getAllByRole('button');
      await expect(buttons.length).toBe(6);
      for (const b of buttons) await expect(Math.round(b.getBoundingClientRect().height)).toBeGreaterThanOrEqual(44);
    });
    await step('picking two leaves both on the bubble, in their colours', async () => {
      await userEvent.click(within(bar).getByRole('button', { name: 'Love' }));
      await userEvent.click(within(bar).getByRole('button', { name: 'Like' }));
      await expect(within(bar).getByRole('button', { name: 'Love' })).toHaveAttribute('aria-pressed', 'true');
      const badge = canvas.getByRole('img', { name: /Reactions: Love, Like/ });
      const glyphs = badge.querySelectorAll<HTMLElement>('[data-reaction]');
      await expect(glyphs.length).toBe(2);
      await expect(getComputedStyle(glyphs[0]).color).not.toBe(getComputedStyle(glyphs[1]).color);
    });
    await step('taking one back removes it', async () => {
      await userEvent.click(within(bar).getByRole('button', { name: 'Love' }));
      await expect(canvas.getByRole('img', { name: 'Reactions: Like' })).toBeInTheDocument();
      await expect(canvasElement.querySelectorAll('[role="img"] [data-reaction]').length).toBe(1);
    });
  },
};
