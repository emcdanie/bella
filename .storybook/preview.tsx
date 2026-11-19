import React, { useEffect, useState } from 'react';
import type { Preview, Decorator } from '@storybook/react-vite';
import { DocsContainer, type DocsContainerProps } from '@storybook/addon-docs/blocks';
import { GLOBALS_UPDATED } from 'storybook/internal/core-events';
import { bellaTheme, bellaThemeDark } from './theme';
import './fonts.css';
import '../tokens/bella.css';
import './docs.css';

/* Docs pages follow the toolbar theme toggle: the container swaps between the
 * generated light/dark manager themes and mirrors [data-theme] onto <html>,
 * so token-driven content inside MDX (the contrast table, swatches) flips
 * even on pages that render no story. */
const BellaDocsContainer = ({
  children,
  context,
}: React.PropsWithChildren<DocsContainerProps>) => {
  const [theme, setTheme] = useState<string>(
    () => ((context as any).store?.userGlobals?.globals?.theme as string) ?? 'bella-light'
  );
  useEffect(() => {
    const channel = (context as any).channel;
    const onGlobalsUpdated = ({ globals }: { globals?: { theme?: string } }) => {
      if (globals?.theme) setTheme(globals.theme);
    };
    channel?.on(GLOBALS_UPDATED, onGlobalsUpdated);
    return () => channel?.off(GLOBALS_UPDATED, onGlobalsUpdated);
  }, [context]);
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  return (
    <DocsContainer context={context} theme={theme.endsWith('-dark') ? bellaThemeDark : bellaTheme}>
      {children}
    </DocsContainer>
  );
};

/* Every story renders inside the BELLA stage: semantic background + primary
 * text, so a story's surfaces are judged against the real page ground.
 * The theme global drives [data-theme] on <html> — the same contract
 * consumers use — so semantic and component dark overrides flip for free.
 * audit:visual snapshots every story in BOTH themes and additionally
 * asserts the stage's effective background luminance matches the active
 * theme (the About-cards class of bug: dark surfaces on a light page). */
const withBellaTheme: Decorator = (Story, context) => {
  const theme = (context.globals.theme as string) ?? 'bella-light';
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  return (
    <div
      data-testid="bella-stage"
      style={{
        /* Full-height stage in the story view (snapshots judge the whole
           ground); in docs the stage hugs its content so the embedded
           preview does not leave a tall empty canvas above the props table. */
        minHeight: context.viewMode === 'docs' ? undefined : '100vh',
        padding: 'var(--spacing-32)',
        background: 'var(--color-background-default)',
        color: 'var(--color-content-default)',
        fontFamily: 'var(--typography-font-family-dm-sans)',
        fontSize: 'var(--typography-body-default-font-size)',
        lineHeight: 'var(--typography-line-height-150)',
        letterSpacing: 'var(--typography-letter-spacing-0)',
      }}
    >
      <Story />
    </div>
  );
};

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'BELLA theme',
      toolbar: {
        title: 'Theme',
        icon: 'mirror',
        items: [
          { value: 'bella-light', title: 'BELLA light' },
          { value: 'bella-dark', title: 'BELLA dark' },
          { value: 'chip-light', title: 'Chip light' },
          { value: 'chip-dark', title: 'Chip dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: 'bella-light',
  },
  decorators: [withBellaTheme],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { disable: true },
    docs: {
      container: BellaDocsContainer,
    },
    options: {
      storySort: {
        order: [
          'Welcome',
          'Identity',
          'Getting Started',
          'Governance',
          ['Overview', 'The Gate', 'Contribution & Tiers'],
          'Changelog',
          'Brand',
          ['Wordmark', 'Pattern', 'Favicon', 'Logo'],
          'Foundations',
          ['Tokens', 'Accessibility', 'Colors', 'Typography', 'Spacing & Radius', 'Responsiveness', 'Elevation', 'Motion', 'Icons'],
          'Components',
          // by type, as the BellaComponents Figma library groups its pages
          // (Elleta, 19 Nov 2026: "oranize the compoents please.. by type"); A to Z in each
          [
            'Actions',
            ['ActionChip', 'Button', 'FilterChip', 'Link', 'SegmentedControl', 'Tabs', 'Tooltip'],
            'Inputs',
            ['Combobox', 'Input', 'SearchField', 'Select', 'Slider'],
            'Data',
            ['Avatar', 'AvatarStack', 'ChatBubble', 'ChatThread', 'CodeBlock', 'DataTable', 'Icon', 'IconWell', 'Kbd', 'ListRow', 'MapLine', 'Progress', 'Stat', 'StatCard', 'StatusDot', 'StatusPill', 'StatusSquare', 'Step', 'Tag', 'Trailing', 'TypingDots'],
            'Layout',
            ['Card', 'ClientSwitcher', 'Columns', 'Disclosure', 'Drawer', 'Eyebrow', 'Heading', 'IconRail', 'Leader', 'NavItem', 'NavList', 'Notification', 'PageHeader', 'PageOutline', 'Pin', 'ProjectPanel', 'ResourceCard', 'ScaledFrame', 'Section', 'SectionHead', 'SectionHeader', 'SectionNav', 'SidebarLayout', 'TextStack', 'TopBar', 'TreeItem'],
          ],
          'Patterns',
          'Pages',
          'Testing',
        ],
      },
    },
    viewport: {
      options: {
        mobile: { name: 'Mobile (390)', styles: { width: '390px', height: '844px' } },
        tablet: { name: 'Tablet (768)', styles: { width: '768px', height: '1024px' } },
        desktop: { name: 'Desktop (1240)', styles: { width: '1240px', height: '900px' } },
        /* the Work patterns' review widths (2026-09-21) */
        laptop: { name: 'Laptop (1024)', styles: { width: '1024px', height: '768px' } },
        wide: { name: 'Wide (1440)', styles: { width: '1440px', height: '900px' } },
      },
    },
    a11y: {
      // Fail the story on any serious/critical axe violation. The contrast
      // bar itself is enforced upstream (verified ratios in token metadata)
      // and per-story here.
      test: 'error',
    },
    controls: { expanded: true },
  },
  tags: ['autodocs'],
};

export default preview;
