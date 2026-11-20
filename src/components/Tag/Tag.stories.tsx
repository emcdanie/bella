import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import Tag from './Tag';
import tagCssRaw from './Tag.module.css?raw';
import componentContract from '../../../tokens/contracts.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((tagCssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const tagContract = (componentContract as any).component?.tag?.$extensions?.bella ?? {};

const meta: Meta<typeof Tag> = {
  title: 'Components/Data/Tag',
  component: Tag,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: tagContract.a11y },
  },
  argTypes: {
    variant: { control: 'inline-radio' },
    className: { control: false },
    style: { control: false },
    children: { control: false },
  },
  args: { variant: 'default' },
};
export default meta;

type Story = StoryObj<typeof Tag>;

/** Both variants in a metadata row, on the raised surface cards provide:
 * the default wash is a RECESS into its surface, so it reads against
 * paper (light) and the navy card (dark), not against the page. */
export const Variants: Story = {
  render: () => (
    <div
      style={{
        maxWidth: 420,
        padding: 'var(--spacing-20)',
        background: 'var(--color-background-surface)',
        borderRadius: 'var(--border-radius-12)',
        display: 'flex',
        gap: 'var(--spacing-8)',
        flexWrap: 'wrap',
      }}
    >
      <Tag>Design systems</Tag>
      <Tag>Case study</Tag>
      <Tag variant="accent">Current</Tag>
    </div>
  ),
};

/** A Tag is not a control: no role, no tab stop, no pointer affordance. */
export const Behavior: Story = {
  render: () => <Tag>Metadata only</Tag>,
  play: async ({ canvas, step }) => {
    await step('non-interactive: no button or link role, no tab stop', async () => {
      expect(canvas.queryAllByRole('button')).toHaveLength(0);
      expect(canvas.queryAllByRole('link')).toHaveLength(0);
      const el = canvas.getByText('Metadata only');
      expect(el).not.toHaveAttribute('tabindex');
      expect(getComputedStyle(el).cursor).toBe('default');
    });
  },
};

const FIGMA_TONES = ['default', 'count', 'success', 'info', 'attention', 'danger'] as const;

/** Figma's tone x style x Show dot, in Chip light and Chip dark (re-sync,
 * 19 Nov 2026). outline every tone, with and without the dot; index for the
 * lane pins (count, attention); flat for missing items (18 Nov, "B, flat"); line on a List row's right
 * stack (21 Nov). */
export const ChipTones: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--spacing-16)' }}>
      {(['chip-light', 'chip-dark'] as const).map((theme) => (
        <div
          key={theme}
          data-theme={theme}
          style={{
            padding: 'var(--spacing-20)',
            background: 'var(--color-background-surface)',
            borderRadius: 'var(--border-radius-12)',
            display: 'flex',
            gap: 'var(--spacing-8)',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          {FIGMA_TONES.map((tone) => (
            <Tag key={tone} tone={tone}>{tone === 'count' ? '42' : tone}</Tag>
          ))}
          {FIGMA_TONES.map((tone) => (
            <Tag key={`dot-${tone}`} tone={tone} showDot>{tone === 'count' ? '42' : tone}</Tag>
          ))}
          <Tag variant="index" tone="count">01</Tag>
          <Tag variant="index" tone="attention">02</Tag>
          <Tag variant="flat">No dark story</Tag>
          <Tag variant="line">Design systems</Tag>
        </div>
      ))}
    </div>
  ),
};

/* ---- contrast, every tone and style, Chip light and dark ---- */
const TONES = ['default', 'count', 'success', 'info', 'attention', 'danger'] as const;
const STYLES = ['outline', 'line', 'index'] as const;

function parse(c: string): [number, number, number, number] {
  const m = c.match(/rgba?\(([^)]+)\)/);
  if (m) {
    const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
    return [p[0], p[1], p[2], p[3] ?? 1];
  }
  const h = c.trim().replace('#', '');
  if (h === 'transparent' || h === '') return [0, 0, 0, 0];
  const n = (i: number) => parseInt(h.slice(i, i + 2), 16);
  return [n(0), n(2), n(4), h.length === 8 ? n(6) / 255 : 1];
}
function over(top: number[], under: number[]) {
  const a = top[3];
  return [0, 1, 2].map((i) => top[i] * a + under[i] * (1 - a));
}
function lum(c: number[]) {
  const f = (x: number) => {
    const v = x / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
}
function ratio(a: number[], b: number[]) {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

/** Every tone and style in Chip light and Chip dark, each on a selected row (the darkest light blue,
 * where "Merged" fell to 5.23:1 with a see-through wash). Each Tag carries its own fill, so its ink
 * keeps 7:1 whatever row it sits on. The play test measures all of them. */
export const Contrast: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--spacing-16)' }}>
      {(['chip-light', 'chip-dark'] as const).map((theme) => (
        <div key={theme} data-theme={theme} data-contrast-theme={theme} style={{ background: 'var(--color-background-surface)' }}>
        <div data-row="" style={{ display: 'grid', gap: 'var(--spacing-8)', padding: 'var(--spacing-16)', background: 'var(--color-background-brand-subtle-hover)' }}>
          {STYLES.map((look) => (
            <div key={look} style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-8)' }}>
              {TONES.map((tone) => (
                <Tag key={tone} variant={look} tone={tone} showDot={tone !== 'count'}>
                  {tone === 'count' ? '12' : `${look} ${tone}`}
                </Tag>
              ))}
            </div>
          ))}
          <div>
            <Tag variant="flat">flat default</Tag>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-8)' }}>
            {(['success', 'info', 'attention'] as const).map((tone) => (
              <Tag key={tone} variant="solid" tone={tone}>
                12
              </Tag>
            ))}
          </div>
        </div>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    for (const box of canvasElement.querySelectorAll<HTMLElement>('[data-contrast-theme]')) {
      /* the selected row (see-through in Chip dark) on the card surface, as on History */
      const inner = box.querySelector<HTMLElement>('[data-row]')!;
      const row = over(parse(getComputedStyle(inner).backgroundColor), parse(getComputedStyle(box).backgroundColor));
      await step(`${box.dataset.contrastTheme}: every Tag 7:1 or more`, async () => {
        const out: string[] = [];
        for (const tag of box.querySelectorAll<HTMLElement>('[data-bella-component="tag"]')) {
          const cs = getComputedStyle(tag);
          const surface = parse(cs.backgroundColor);
          const wash = parse(cs.getPropertyValue('--tag-wash') || 'transparent');
          const ground = over(wash, over(surface, row));
          const r = ratio(parse(cs.color), ground);
          out.push(`${tag.textContent} ${r.toFixed(2)}`);
          await expect(r, `${box.dataset.contrastTheme} ${tag.textContent}: ${r.toFixed(2)}:1`).toBeGreaterThanOrEqual(7);
        }
        console.log(box.dataset.contrastTheme, out.join(' · '));
      });
    }
  },
};

/** Show count (Tag 140:46, published 21 Nov): the number before the label, in the number face, the tone kept. */
export const Count: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-8)', padding: 'var(--spacing-16)' }}>
      <Tag tone="default" count={12}>Components</Tag>
      <Tag tone="attention" count={3}>Waiting on you</Tag>
      <Tag tone="info" count={5}>Working</Tag>
      <Tag tone="success" count={18}>Done</Tag>
      <Tag tone="danger" count={1}>Failed</Tag>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const tag = canvasElement.querySelector('[data-bella-component="tag"]') as HTMLElement;
    await expect(tag).toHaveTextContent('12Components');
    const count = tag.querySelector('[class*="count"]') as HTMLElement;
    await expect(getComputedStyle(count).fontWeight).toBe('600');
    await expect(getComputedStyle(count).fontFamily).toMatch(/Mono|Geist|Lexend|DM/);
  },
};
