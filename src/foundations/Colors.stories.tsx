import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { leavesUnder, primitive, semanticByTheme, walk, SectionTitle, SwatchGrid, TokenTable } from './TokenSheet';

const meta: Meta = {
  title: 'Foundations/Colors',
};
export default meta;

const note: React.CSSProperties = { maxWidth: '60ch', color: 'var(--color-content-body)' };

/* Tier 1 ramps, in the order Figma lists them. */
const RAMPS = [
  'color.brand.navy', 'color.brand.ochre', 'color.brand.stone', 'color.brand.pink', 'color.brand.blue', 'color.brand.wash',
  'color.utility.blue', 'color.utility.red', 'color.utility.green', 'color.utility.yellow',
  'color.neutral', 'color.third-party',
];

/** Tier 1: every ramp from Figma Foundations, by hue and step. Parts never
 * read these; they read a Tier 2 token. */
export const Ramps: StoryObj = {
  render: () => (
    <div>
      {RAMPS.map((group) => (
        <div key={group}>
          <SectionTitle>{group.replace('color.', '').replace('.', ' ')}</SectionTitle>
          <SwatchGrid leaves={leavesUnder(primitive, group)} />
        </div>
      ))}
    </div>
  ),
};

/* Tier 2: shared meaning, one story per Figma group, for the theme picked in
 * the toolbar. The value column shows the Tier 1 token each one points at. */
const group = (name: string, part?: { label: string; keep: (rest: string) => boolean }): StoryObj => ({
  render: (_args, { globals }) => {
    const theme = (globals.theme as string) ?? 'bella-light';
    const bindings = semanticByTheme[theme] ?? semanticByTheme['bella-light'];
    return (
      <div>
        <SectionTitle>{`color/${name}${part ? ` (${part.label})` : ''}, ${theme}`}</SectionTitle>
        <p style={note}>
          Chips resolve through the built CSS custom properties, so they follow the
          theme toolbar. At narrow widths the table scrolls inside its frame.
        </p>
        <TokenTable
          label={`color.${name}${part ? ` ${part.label}` : ''}, ${theme}`}
          leaves={walk(bindings as never, []).filter(
            (l) => l.path.startsWith(`color.${name}.`) && (!part || part.keep(l.path.slice(`color.${name}.`.length))),
          )}
        />
      </div>
    );
  },
});

/* Background is split in three (19 Nov 2026): as one story it timed out the
   gate's 60 s once. Same rows, in three smaller tables. */
const BG_DECOR = ['utility.', 'pattern.', 'syntax.', 'logo.', 'wash.'];
export const Background = group('background', { label: 'surfaces and actions', keep: (r) => !BG_DECOR.some((d) => r.startsWith(d)) });
export const BackgroundStatus = group('background', { label: 'status', keep: (r) => r.startsWith('utility.') });
export const BackgroundDecor = group('background', { label: 'pattern, syntax, logo, wash', keep: (r) => ['pattern.', 'syntax.', 'logo.', 'wash.'].some((d) => r.startsWith(d)) });
export const Border = group('border');
export const Content = group('content');
