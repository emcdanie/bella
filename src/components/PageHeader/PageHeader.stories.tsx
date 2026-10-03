import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import PageHeader from './PageHeader';
import Button from '../Button/Button';
import ActionChip from '../ActionChip/ActionChip';
import cssRaw from './PageHeader.module.css?raw';
import componentContract from '../../../tokens/component.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))).sort();
const contract = (componentContract as any).component?.['page-header']?.$extensions?.bella ?? {};

const meta: Meta<typeof PageHeader> = {
  title: 'Components/PageHeader',
  component: PageHeader,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: contract.a11y },
  },
  args: {
    meta: 'BELLA 0.3.0 · synced 3 Oct, 14:05',
    title: 'System health',
    lede: 'BELLA read from the repo, checked by its own gate scripts, on this machine.',
  },
};
export default meta;

type Story = StoryObj<typeof PageHeader>;

/** Overview: meta, title, lede. */
export const Default: Story = {};

/** Object page: category as meta, the one main action beside the title. */
export const WithActions: Story = {
  args: {
    meta: 'Specimen No. 002 · Actions',
    title: 'Button',
    lede: 'Keycaps with real hierarchy: two colour treatments, three tiers, one primary per view.',
    actions: (
      <>
        <ActionChip onClick={() => {}}>Copy import</ActionChip>
        <Button variant="primary" onClick={() => {}}>Open the story</Button>
      </>
    ),
  },
};

/** A long title balances over two lines; the lede stops at the body measure. */
export const LongTitle: Story = {
  args: {
    meta: 'Docs · Decision',
    title: 'Docs live outside the repo in obi-notes, never committed, synced on save',
    lede: 'Notes, plans, decisions and handoffs are personal working files. They live in a folder next to the repo so nothing private can reach a public commit, and OBI indexes them locally.',
  },
};

/** Behavioral suite: one h1 at the one title size, the lede held to 70ch. */
export const Behavior: Story = {
  args: { ...LongTitle.args },
  play: async ({ canvasElement, step }) => {
    const h1s = canvasElement.querySelectorAll('h1');
    const lede = canvasElement.querySelector('header p:last-child') as HTMLElement;
    await step('one h1, at the fixed page-title size (not the display ramp)', async () => {
      expect(h1s.length).toBe(1);
      expect(getComputedStyle(h1s[0]).fontSize).toBe('40px');
    });
    await step('the lede is no wider than 70ch', async () => {
      const probe = document.createElement('span');
      probe.textContent = '0';
      probe.style.font = getComputedStyle(lede).font;
      probe.style.position = 'absolute';
      document.body.appendChild(probe);
      const ch = probe.getBoundingClientRect().width;
      probe.remove();
      expect(lede.getBoundingClientRect().width / ch).toBeLessThanOrEqual(70.5);
    });
  },
};
