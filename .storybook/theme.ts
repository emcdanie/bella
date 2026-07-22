import { create } from 'storybook/theming/create';
import values from './theme-values.json';

/* The branded manager theme. Every colour, font, and radius here comes from
 * .storybook/theme-values.json, which tokens/build.py generates from the
 * token sources and the gate diff-checks. Never write a hex in this file. */

export const bellaTheme = create({
  base: 'light',

  brandTitle: 'BELLA',
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

/* Dark counterpart for the themed docs container: the navy page, dark inks,
 * periwinkle accent — the same flip the semantic tier makes. */
export const bellaThemeDark = create({
  base: 'dark',

  brandTitle: 'BELLA',
  brandUrl: 'https://elleta.design/design-system',
  brandTarget: '_blank',

  colorPrimary: values.periwinkle,
  colorSecondary: values.periwinkle,

  appBg: values.navy,
  appContentBg: values.navy,
  appPreviewBg: values.navy,
  appBorderColor: values.navyDivider,
  appBorderRadius: parseInt(values.radiusLg, 10),

  fontBase: values.fontBody,
  fontCode: values.fontMono,

  textColor: values.navyInk,
  textInverseColor: values.navy,
  textMutedColor: values.navyInkMuted,

  barTextColor: values.navyInkMuted,
  barSelectedColor: values.periwinkle,
  barHoverColor: values.periwinkle,
  barBg: values.navyCard,

  buttonBg: values.navyCard,
  buttonBorder: values.navyDivider,
  booleanBg: values.navyCard,
  booleanSelectedBg: values.navy,

  inputBg: values.navyCard,
  inputBorder: values.navyDivider,
  inputTextColor: values.navyInk,
  inputBorderRadius: parseInt(values.radiusMd, 10),
});
