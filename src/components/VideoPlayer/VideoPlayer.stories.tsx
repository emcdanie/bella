import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import VideoPlayer from './VideoPlayer';
import cssRaw from './VideoPlayer.module.css?raw';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))).sort();

const meta: Meta<typeof VideoPlayer> = {
  title: 'Components/Layout/VideoPlayer',
  component: VideoPlayer,
  parameters: { docs: { page: ComponentDocsPage }, bellaDocs: { tokens: consumedTokens } },
};
export default meta;
type Story = StoryObj<typeof VideoPlayer>;

const wrap = { padding: 'var(--spacing-24)', background: 'var(--color-background-default)', maxInlineSize: 'calc(var(--spacing-80) * 8)' } as const;

/* The clip itself lives in the consumer (CHIP). These stories show the poster and the control: the
 * source below does not exist here, so the player keeps the still. */
const props = { src: 'work/deck-clip.mp4', poster: 'work/deck-poster.png', label: 'CHIP promotional film, 27 seconds', autoPlay: false } as const;

/** The still with a Play button. Silent clips carry captions, shown by default. */
export const Default: Story = {
  render: () => (
    <div style={wrap}>
      <VideoPlayer {...props} captions="work/deck-clip.vtt" />
    </div>
  ),
};

/** Reduced motion (or autoPlay off): the still waits for a press, never starts by itself. */
export const StillUntilPressed: Story = {
  render: () => (
    <div style={wrap}>
      <VideoPlayer {...props} />
    </div>
  ),
};
