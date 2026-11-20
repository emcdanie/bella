import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import IconWell from './IconWell';
import cssRaw from './IconWell.module.css?raw';
import componentContract from '../../../tokens/contracts.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const contract = (componentContract as any).component?.['icon-well']?.$extensions?.bella ?? {};

const THEMES = ['chip-light', 'chip-dark'] as const;

/** One surface per Chip theme; dark comes from the token modes, never a variant. */
const Themed = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'grid', gap: 'var(--spacing-16)' }}>
    {THEMES.map((theme) => (
      <div
        key={theme}
        data-theme={theme}
        style={{
          padding: 'var(--spacing-20)',
          background: 'var(--color-background-surface)',
          borderRadius: 'var(--border-radius-12)',
          display: 'flex',
          gap: 'var(--spacing-16)',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        {children}
      </div>
    ))}
  </div>
);

const meta: Meta<typeof IconWell> = {
  title: 'Components/Data/IconWell',
  component: IconWell,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: contract.a11y },
  },
  argTypes: {
    tone: { control: 'inline-radio' },
    icon: { control: 'select' },
    className: { control: false },
    style: { control: false },
  },
  args: { icon: 'Activity', tone: 'success' },
};
export default meta;

type Story = StoryObj<typeof IconWell>;

export const Playground: Story = {};

/** Every tone in Chip light and Chip dark. */
export const AllTones: Story = {
  render: () => (
    <Themed>
      <IconWell icon="Activity" tone="success" />
      <IconWell icon="WarningCircle" tone="warning" />
      <IconWell icon="Sparks" tone="info" />
      <IconWell icon="Clock" tone="neutral" />
    </Themed>
  ),
};

/** Decorative by default: no role, hidden from assistive tech. */
export const Behavior: Story = {
  render: () => <IconWell icon="Activity" />,
  play: async ({ canvas, step }) => {
    await step('no role, no tab stop', async () => {
      expect(canvas.queryAllByRole('img')).toHaveLength(0);
      expect(canvas.queryAllByRole('button')).toHaveLength(0);
    });
  },
};

const ALL = [
  ['success', 'CheckCircle'],
  ['warning', 'WarningCircle'],
  ['info', 'InfoCircle'],
  ['neutral', 'Clock'],
  ['error', 'XmarkCircle'],
  ['fix', 'EditPencil'],
  ['visual', 'Eye'],
  ['tokens', 'Palette'],
  ['tooling', 'Settings'],
  ['docs', 'Page'],
  ['contract', 'Code'],
  ['decision', 'Check'],
] as const;

/** Every Figma tone in both sizes (Icon well 1168:72470, 21 Nov publish): md 36 / 24 and sm 24 / 16.
 * sm error and success are a source's ✕ / ✓ findings. */
export const TonesAndSizes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--spacing-16)', padding: 'var(--spacing-24)', background: 'var(--color-background-surface)' }}>
      {(['md', 'sm'] as const).map((size) => (
        <div key={size} style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-12)', alignItems: 'center' }}>
          {ALL.map(([tone, icon]) => (
            <IconWell key={tone} tone={tone} icon={icon} size={size} />
          ))}
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const wells = [...canvasElement.querySelectorAll<HTMLElement>('[data-bella-component="icon-well"]')];
    await step('md is 36, sm is 24', async () => {
      await expect(Math.round(wells[0].getBoundingClientRect().width)).toBe(36);
      await expect(Math.round(wells[ALL.length].getBoundingClientRect().width)).toBe(24);
      await expect(Math.round(wells[ALL.length].querySelector('svg')!.getBoundingClientRect().width)).toBe(16);
    });
    await step('every tone draws a filled circle', async () => {
      for (const w of wells) await expect(getComputedStyle(w).backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    });
  },
};
