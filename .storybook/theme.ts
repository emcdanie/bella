import { create } from 'storybook/theming/create';
import values from './theme-values.json';
import pkg from '../package.json';

/* Sidebar lockup: the mark in front of the name, the version
 * read from package.json so it never goes stale. */
const lockup = (ink: string, muted: string) =>
  `<span style="display:flex;align-items:center;gap:10px">` +
  `<img src="./brand/bella-mark-iris.svg" alt="" width="34" height="34" style="display:block" />` +
  `<span><span style="display:block;font-family:Unique,${values.fontBody};font-weight:700;font-size:24px;letter-spacing:0.04em;line-height:1;color:${ink}">BELLA</span>` +
  `<span style="display:block;margin-top:4px;font-family:${values.fontBody};font-weight:500;font-size:10px;letter-spacing:0.18em;color:${muted}">DESIGN SYSTEM · V${pkg.version.split('.').slice(0, 2).join('.')}</span></span></span>`;

/* The branded manager theme. Every colour, font, and radius here comes from
 * .storybook/theme-values.json, which tokens/build.py generates from the
 * token sources and the gate diff-checks. Never write a hex in this file. */

export const bellaTheme = create({
  base: 'light',

  brandTitle: lockup(values.ink, values.inkMuted),
  brandUrl: 'https://elleta.design/design-system',
  brandTarget: '_blank',

  colorPrimary: values.iris,
  colorSecondary: values.iris,

  appBg: values.ground,
  appContentBg: values.ground,
  appPreviewBg: values.ground,
  appBorderColor: values.border,
  appBorderRadius: parseInt(values.radiusLg, 10),

  fontBase: values.fontBody,
  fontCode: values.fontMono,

  textColor: values.ink,
  textInverseColor: values.ground,
  textMutedColor: values.inkMuted,

  barTextColor: values.inkSoft,
  barSelectedColor: values.iris,
  barHoverColor: values.irisDeep,
  barBg: values.paper,

  buttonBg: values.paper,
  buttonBorder: values.border,
  booleanBg: values.surface,
  booleanSelectedBg: values.paper,

  inputBg: values.paper,
  inputBorder: values.border,
  inputTextColor: values.ink,
  inputBorderRadius: parseInt(values.radiusMd, 10),
});

/* Dark counterpart for the themed docs container: the warm dark ground
 * (color.night.*, surface rules 2026-09-19), dark inks, periwinkle accent;
 * the same flip the semantic tier makes. */
export const bellaThemeDark = create({
  base: 'dark',

  brandTitle: 'BELLA',
  brandUrl: 'https://elleta.design/design-system',
  brandTarget: '_blank',

  colorPrimary: values.periwinkle,
  colorSecondary: values.periwinkle,

  appBg: values.night,
  appContentBg: values.night,
  appPreviewBg: values.night,
  appBorderColor: values.nightDivider,
  appBorderRadius: parseInt(values.radiusLg, 10),

  fontBase: values.fontBody,
  fontCode: values.fontMono,

  textColor: values.navyInk,
  textInverseColor: values.night,
  textMutedColor: values.navyInkMuted,

  barTextColor: values.navyInkMuted,
  barSelectedColor: values.periwinkle,
  barHoverColor: values.periwinkle,
  barBg: values.nightCard,

  buttonBg: values.nightCard,
  buttonBorder: values.nightDivider,
  booleanBg: values.nightCard,
  booleanSelectedBg: values.night,

  inputBg: values.nightCard,
  inputBorder: values.nightDivider,
  inputTextColor: values.navyInk,
  inputBorderRadius: parseInt(values.radiusMd, 10),
});
