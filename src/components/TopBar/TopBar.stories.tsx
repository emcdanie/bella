import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import TopBar from './TopBar';
import SearchField from '../SearchField/SearchField';
import Avatar from '../Avatar/Avatar';
import cssRaw from './TopBar.module.css?raw';
import componentContract from '../../../tokens/contracts.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const contract = (componentContract as any).component?.['top-bar']?.$extensions?.bella ?? {};

const THEMES = ['chip-light', 'chip-dark'] as const;

const meta: Meta<typeof TopBar> = {
  title: 'Components/TopBar',
  component: TopBar,
  parameters: {
    layout: 'fullscreen',
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: contract.a11y },
  },
  argTypes: { search: { control: false }, right: { control: false }, className: { control: false }, style: { control: false } },
};
export default meta;

type Story = StoryObj<typeof TopBar>;

const Bar = () => <TopBar search={<SearchField />} right={<Avatar size="sm" name="Dara" src="/avatars/dara.png" />} />;

/** Search and the person's avatar, Chip light and Chip dark, over the page ground. */
export const Default: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--spacing-24)' }}>
      {THEMES.map((theme) => (
        <div key={theme} data-theme={theme} style={{ background: 'var(--color-background-default)', paddingBlockEnd: 'var(--spacing-24)' }}>
          <Bar />
        </div>
      ))}
    </div>
  ),
};

/** Behavior: the bar is 68 tall (12 + 44 + 12) and holds one searchbox. */
export const Behavior: Story = {
  render: () => <Bar />,
  play: async ({ canvas, canvasElement }) => {
    expect(canvas.getByRole('searchbox')).toBeInTheDocument();
    const bar = canvasElement.querySelector('[data-bella-component="top-bar"]') as HTMLElement;
    expect(Math.round(bar.getBoundingClientRect().height)).toBe(68);
  },
};
