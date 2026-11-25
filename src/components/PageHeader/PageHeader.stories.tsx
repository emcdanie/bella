import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import PageHeader from './PageHeader';
import Button from '../Button/Button';
import ActionChip from '../ActionChip/ActionChip';
import cssRaw from './PageHeader.module.css?raw';
import componentContract from '../../../tokens/contracts.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))).sort();
const contract = (componentContract as any).component?.['page-header']?.$extensions?.bella ?? {};

const meta: Meta<typeof PageHeader> = {
  title: 'Components/Layout/PageHeader',
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
    lede: 'Buttons with real hierarchy: two colour treatments, three tiers, one primary per view.',
    actions: (
      <>
        <ActionChip onClick={() => {}}>Copy import</ActionChip>
        <Button variant="primary" onClick={() => {}}>Open the story</Button>
      </>
    ),
  },
};

/** Something that belongs to the title sits beside it, outside the h1 (a quiet ⋯ menu). */
export const WithTitleAside: Story = {
  args: {
    meta: 'Specimen No. 002 · Actions',
    title: 'Button',
    titleAside: (
      <ActionChip variant="quiet" ariaLabel="Button: visibility and status" onClick={() => {}}>
        ⋯
      </ActionChip>
    ),
    actions: <Button variant="secondary" onClick={() => {}}>Open the story</Button>,
  },
  play: async ({ canvas }) => {
    // the heading's name is the title alone
    expect(canvas.getByRole('heading', { level: 1 }).textContent).toBe('Button');
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
      expect(getComputedStyle(h1s[0]).fontSize).toBe('28px');
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

/** icon (BellaComponents, 11 Nov 2026): a glyph in a quiet well before the
 * title. Decorative: the h1 still reads as the title alone. */
export const WithIcon: Story = {
  args: {
    meta: 'BELLA 0.3.0 · checked 7 Nov, 10:53',
    icon: 'SunLight',
    title: 'Today',
    lede: 'Every item says why it matters and offers one next step.',
    actions: <Button variant="secondary" onClick={() => {}}>Read everything</Button>,
  },
  play: async ({ canvas }) => {
    expect(canvas.getByRole('heading', { level: 1 }).textContent).toBe('Today');
  },
};

/** Figma's CHIP shell use (pick Chip light or Chip dark in the toolbar): meta, a plain title
 * (no dot, no icon), the health line, the story link, the one main action top right, the lede. */
export const ChipShell: Story = {
  render: () => (
    <div style={{ padding: 'var(--spacing-24) var(--spacing-32)', background: 'var(--color-background-surface)' }}>
      <PageHeader
        meta="CHIP · checked 19 Nov, 10:53"
        title="Not again"
        health="95% healthy · 13 checks to fix"
        storyLink={{ label: 'Read the story', href: '#story' }}
        lede="Mistakes we fixed once, written down so the next session does not repeat them."
        actions={<Button variant="primary" size="sm" onClick={() => {}}>New entry</Button>}
      />
    </div>
  ),
  play: async ({ canvas }) => {
    for (const h of canvas.getAllByRole('heading', { level: 1 })) expect(h.textContent).toBe('Not again');
  },
};

/** Figma "size" (22 Nov 19:08): the title is 28 on a 36 line in both sizes; the meta and health lines are
 * meta lines, 14 on 20, in both. */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--spacing-48)' }}>
      {/* each in its own region, so the story has no second banner landmark */}
      <section aria-label="size page">
        <PageHeader size="page" meta="Specimen No. 002 · Actions" title="Button" health="95% healthy · 13 checks to fix" lede="Buttons with real hierarchy." />
      </section>
      <section aria-label="size project">
        <PageHeader size="project" meta="BELLA 0.3.0 · checked 7 Nov, 10:53" title="CHIP" health="95% healthy · 13 checks to fix" lede="Every item says why it matters and offers the action that follows." actions={<Button variant="primary" size="sm">Run checks</Button>} />
      </section>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const [page, project] = Array.from(canvasElement.querySelectorAll('h1')).map((h) => getComputedStyle(h));
    await expect([page.fontSize, page.lineHeight]).toEqual(['28px', '36px']);
    await expect([project.fontSize, project.lineHeight]).toEqual(['28px', '36px']);
    for (const header of Array.from(canvasElement.querySelectorAll('header'))) {
      for (const line of Array.from(header.querySelectorAll<HTMLElement>('[data-bella-meta]'))) {
        await expect([getComputedStyle(line).fontSize, getComputedStyle(line).lineHeight]).toEqual(['14px', '20px']);
      }
      await expect(header.querySelectorAll('[data-bella-meta]')).toHaveLength(2);
    }
  },
};

/** size bar (CHIP, 23 Nov, "page chrome is small"): one 56 row, the breadcrumb's parents then the title (the one h1, 22 on 28), the action at the right edge. */
export const Bar: Story = {
  render: () => (
    <section aria-label="size bar">
      <PageHeader size="bar" meta="CHIP › System" title="Components" actions={<Button variant="primary" size="sm">New</Button>} />
    </section>
  ),
  play: async ({ canvasElement }) => {
    const header = canvasElement.querySelector('header') as HTMLElement;
    await expect(header.getBoundingClientRect().height).toBeLessThanOrEqual(56);
    await expect(getComputedStyle(canvasElement.querySelector('h1') as HTMLElement).fontSize).toBe('22px');
  },
};
