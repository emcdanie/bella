import { create } from 'storybook/theming/create';
import values from './theme-values.json';
import pkg from '../package.json';

/* Sidebar lockup: the mark in front of the name, the version
 * read from package.json so it never goes stale. */
const lockup = (ink: string, muted: string) =>
  `<span style="display:flex;align-items:center;gap:10px">` +
  `<img src="./brand/bella-mark-iris.svg" alt="" width="34" height="34" style="display:block" />` +
  `<span><span style="display:block;font-family:${values.fontWordmark};font-weight:700;font-size:24px;letter-spacing:0.04em;line-height:1;color:${ink}">BELLA</span>` +
  `<span style="display:block;margin-top:4px;font-family:${values.fontBody};font-weight:500;font-size:10px;letter-spacing:0.18em;color:${muted}">DESIGN SYSTEM · V${pkg.version.split('.').slice(0, 2).join('.')}</span></span></span>`;

/* The branded manager theme. Every colour, font, and radius here comes from
 * .storybook/theme-values.json, which tokens/build.py generates from the
 * token sources and the gate diff-checks. Never write a hex in this file. */

export const bellaTheme = create({
  base: 'light',

  brandTitle: lockup(values.ink, values.muted),
  brandUrl: 'https://elleta.design/design-system',
  brandTarget: '_blank',

  colorPrimary: values.iris,
  colorSecondary: values.iris,

  appBg: values.bg,
  appContentBg: values.bg,
  appPreviewBg: values.bg,
  appBorderColor: values.line,
  appBorderRadius: parseInt(values.radiusLg, 10),

  fontBase: values.fontBody,
  fontCode: values.fontMono,

  textColor: values.ink,
  textInverseColor: values.bg,
  textMutedColor: values.muted,

  barTextColor: values.muted,
  barSelectedColor: values.iris,
  barHoverColor: values.irisDeep,
  barBg: values.panel,

  buttonBg: values.panel,
  buttonBorder: values.control,
  booleanBg: values.panel,
  booleanSelectedBg: values.bg,

  inputBg: values.bg,
  inputBorder: values.control,
  inputTextColor: values.ink,
  inputBorderRadius: parseInt(values.radiusMd, 10),
});

/* Dark counterpart for the themed docs container: the neutral dark ground
 * (color.dark.*, style unify 2026-09-22), dark inks, periwinkle accent;
 * the same flip the semantic tier makes. */
export const bellaThemeDark = create({
  base: 'dark',

  brandTitle: 'BELLA',
  brandUrl: 'https://elleta.design/design-system',
  brandTarget: '_blank',

  colorPrimary: values.periwinkle,
  colorSecondary: values.periwinkle,

  appBg: values.darkBg,
  appContentBg: values.darkBg,
  appPreviewBg: values.darkBg,
  appBorderColor: values.darkLine,
  appBorderRadius: parseInt(values.radiusLg, 10),

  fontBase: values.fontBody,
  fontCode: values.fontMono,

  textColor: values.darkInk,
  textInverseColor: values.darkBg,
  textMutedColor: values.darkMuted,

  barTextColor: values.darkMuted,
  barSelectedColor: values.periwinkle,
  barHoverColor: values.periwinkle,
  barBg: values.darkSurface,

  buttonBg: values.darkSurface,
  buttonBorder: values.darkControl,
  booleanBg: values.darkSurface,
  booleanSelectedBg: values.darkBg,

  inputBg: values.darkSurface,
  inputBorder: values.darkControl,
  inputTextColor: values.darkInk,
  inputBorderRadius: parseInt(values.radiusMd, 10),
});
