import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import ResourceCard from './ResourceCard';
/* the hashed class map, so the Behavior assertions target the exact elements:
   a [class*="tab"] substring match catches tabRow first and reads its
   transparent background instead of the tab's */
import styles from './ResourceCard.module.css';
import resourceCardCssRaw from './ResourceCard.module.css?raw';
import componentContract from '../../../tokens/component.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set(
    (resourceCardCssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length))
  )
).sort();

const contract = (componentContract as any).component?.['resource-card']?.$extensions?.bella ?? {};

/* The cover artwork is CONTENT, not part of the component: a file window
   built from divs and tokens. No inline SVG, per the icon rule. */
const FileWindow = ({ filename = 'SKILL.md' }: { filename?: string }) => (
  <div
    style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      padding: 'var(--spacing-4)',
      gap: 'var(--spacing-3)',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
      <span
        style={{
          fontFamily: 'var(--typography-font-family-body)',
          fontSize: 'var(--typography-font-size-tag)',
          color: 'var(--color-navy-text-muted)',
        }}
      >
        {filename}
      </span>
    </div>
    <div
      style={{
        flex: 1,
        borderRadius: 'var(--radius-md)',
        background: 'var(--color-navy-card)',
        border: '1px solid var(--color-navy-divider)',
        padding: 'var(--spacing-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-3)',
      }}
    >
      {[92, 74, 60].map((w) => (
        <span
          key={w}
          style={{
            display: 'block',
            height: 'var(--spacing-2)',
            width: `${w}%`,
            borderRadius: 'var(--radius-full)',
            background: 'var(--color-navy-raised)',
          }}
        />
      ))}
      <span
        style={{
          display: 'block',
          height: 'var(--spacing-2)',
          width: '40%',
          borderRadius: 'var(--radius-full)',
          background: 'var(--color-alpha-periwinkle-30)',
        }}
      />
    </div>
  </div>
);

const meta: Meta<typeof ResourceCard> = {
  title: 'Components/ResourceCard',
  component: ResourceCard,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: contract.a11y },
  },
  argTypes: {
    cover: { control: false },
    linkComponent: { control: false },
    className: { control: false },
    style: { control: false },
  },
  args: {
    type: 'Workflow',
    title: 'lock-then-verify',
    description:
      'Two hard gates around any build: a written concept lock before you start, and a real look at the shipped result before you call it done.',
    href: 'https://github.com/emcdanie/bella',
    statusLabel: 'Live',
  },
};
export default meta;

type Story = StoryObj<typeof ResourceCard>;

/** One card, at the width the toolkit gallery gives it. */
export const Default: Story = {
  render: (args) => (
    <div style={{ maxWidth: 360 }}>
      <ResourceCard {...args} cover={<FileWindow />} />
    </div>
  ),
};

/** The gallery case: a row of cards with equal heights, which is what the
 * sheet's flex column and the footer's margin-top auto are for. */
export const Gallery: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 'var(--spacing-6)',
        maxWidth: 1000,
      }}
    >
      <ResourceCard
        type="Workflow"
        title="lock-then-verify"
        description="Two hard gates around any build: a written concept lock before you start, and a real look at the shipped result before you call it done."
        href="https://github.com/emcdanie/bella"
        statusLabel="Live"
        cover={<FileWindow />}
      />
      <ResourceCard
        type="Audit"
        title="context-health-check"
        description="Audits a project folder for context rot and returns a scored health report with prioritized fixes."
        href="https://github.com/emcdanie/bella"
        statusLabel="Live"
        cover={<FileWindow filename="AUDIT.md" />}
      />
      <ResourceCard
        type="Workflow"
        title="session-handoff"
        description="Persists session state so the next session picks up cleanly with zero re-exploration."
        href="https://github.com/emcdanie/bella"
        statusLabel="Live"
        cover={<FileWindow filename="HANDOFF.md" />}
      />
    </div>
  ),
};

/** A long description clamps at two lines rather than pushing the footer down
 * and breaking the row's equal heights. */
export const LongDescription: Story = {
  render: () => (
    <div style={{ maxWidth: 360 }}>
      <ResourceCard
        type="Workflow"
        title="A resource with far too much to say"
        description="This description runs well past two lines on purpose, so the clamp is visible in the snapshot and the footer stays pinned to the bottom of the sheet where the gallery needs it, no matter how much copy the consumer supplies."
        href="https://github.com/emcdanie/bella"
        statusLabel="Always improving"
        cover={<FileWindow />}
      />
    </div>
  ),
};

/**
 * One link, one tab stop, inert at rest, and the fold is theme-driven. The
 * notch check is the named GATE-2 item: its gradient must resolve from the
 * same semantic surface token as the sheet, or dark mode bites a light hole
 * in the navy card.
 */
export const Behavior: Story = {
  render: () => (
    <div style={{ maxWidth: 360 }}>
      <ResourceCard
        type="Workflow"
        title="lock-then-verify"
        description="Two hard gates around any build."
        href="https://github.com/emcdanie/bella"
        statusLabel="Live"
        cover={<FileWindow />}
      />
    </div>
  ),
  play: async ({ canvas, canvasElement, step }) => {
    const links = canvas.getAllByRole('link');

    await step('the whole card is ONE link, no nested second stop', async () => {
      expect(links).toHaveLength(1);
      expect(links[0]).toHaveAttribute('href');
      expect(canvas.queryAllByRole('button')).toHaveLength(0);
    });

    await step('the Open action is inside that link, not a link itself', async () => {
      const open = canvas.getByText('Open');
      expect(open.closest('a')).toBe(links[0]);
      expect(open.tagName).not.toBe('A');
    });

    await step('title clears the card-title floor, description clears the body floor', async () => {
      const title = canvas.getByRole('heading', { level: 3 });
      expect(parseFloat(getComputedStyle(title).fontSize)).toBeGreaterThanOrEqual(20);
      const desc = canvas.getByText(/Two hard gates/);
      expect(parseFloat(getComputedStyle(desc).fontSize)).toBeGreaterThanOrEqual(16);
    });

    await step('the trace is inert at rest', async () => {
      expect(getComputedStyle(links[0], '::before').opacity).toBe('0');
    });

    await step('the fold: tab and sheet share one background, and the tab casts no shadow', async () => {
      const tab = canvasElement.querySelector(`.${styles.tab}`) as HTMLElement;
      const content = canvasElement.querySelector(`.${styles.content}`) as HTMLElement;
      expect(getComputedStyle(tab).backgroundColor).toBe(getComputedStyle(content).backgroundColor);
      expect(getComputedStyle(tab).boxShadow).toBe('none');
    });

    await step('the notch is painted from the SAME token as the sheet, so it flips', async () => {
      const notch = canvasElement.querySelector(`.${styles.notch}`) as HTMLElement;
      const content = canvasElement.querySelector(`.${styles.content}`) as HTMLElement;
      const sheet = getComputedStyle(content).backgroundColor;
      const image = getComputedStyle(notch).backgroundImage;
      expect(image).toContain('radial-gradient');
      /* the resolved gradient must carry the sheet's own colour, which is
         what proves it is a token reference and not a hardcoded cream */
      expect(image).toContain(sheet);
    });
  },
};
