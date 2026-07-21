import React, { useEffect } from 'react';
import type { Preview, Decorator } from '@storybook/react-vite';
import '../tokens/bella.css';

/* Every story renders inside the BELLA stage: semantic background + primary
 * text, so a story's surfaces are judged against the real page ground.
 * The theme global drives [data-theme] on <html> — the same contract
 * consumers use — so semantic and component dark overrides flip for free.
 * audit:visual snapshots every story in BOTH themes and additionally
 * asserts the stage's effective background luminance matches the active
 * theme (the About-cards class of bug: dark surfaces on a light page). */
const withBellaTheme: Decorator = (Story, context) => {
  const theme = (context.globals.theme as string) ?? 'light';
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  return (
    <div
      data-testid="bella-stage"
      style={{
        minHeight: '100vh',
        padding: 'var(--spacing-8)',
        background: 'var(--color-semantic-background)',
        color: 'var(--color-semantic-text-primary)',
        fontFamily: 'var(--typography-font-family-body)',
        fontSize: 'var(--typography-font-size-base)',
        lineHeight: 'var(--typography-line-height-normal)',
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
          { value: 'light', title: 'Light (ground)' },
          { value: 'dark', title: 'Dark (navy)' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: 'light',
  },
  decorators: [withBellaTheme],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { disable: true },
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
