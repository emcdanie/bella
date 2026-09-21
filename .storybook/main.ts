import type { StorybookConfig } from '@storybook/react-vite';
import remarkGfm from 'remark-gfm';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

/* Story UI (dev tooling, 2026-09-21) talks to its local server on :4001, so
 * its panel pages only work under `storybook dev`. Static builds (the gate,
 * GitHub Pages) leave them out: they would publish a dead panel, and its
 * third-party chrome is not BELLA content for audit:quality to judge. */
const isDev = !process.argv.includes('build');
const srcDirs = readdirSync(join(process.cwd(), 'src'), { withFileTypes: true })
  .filter((d) => d.isDirectory() && (isDev || d.name !== 'stories'))
  .map((d) => d.name);

const config: StorybookConfig = {
  stories: srcDirs.flatMap((d) => [`../src/${d}/**/*.mdx`, `../src/${d}/**/*.stories.@(ts|tsx)`]),
  /* addon-mcp serves an MCP endpoint at /mcp in dev mode (agent access;
     see the Agent access note on the Welcome docs page) */
  addons: [
    '@storybook/addon-a11y',
    {
      name: '@storybook/addon-docs',
      options: {
        /* GFM (tables) is not in Storybook's MDX defaults; the docs pages
           use markdown tables (legacy aliases, build artifacts) */
        mdxPluginOptions: {
          mdxCompileOptions: {
            remarkPlugins: [remarkGfm],
          },
        },
      },
    },
    '@storybook/addon-mcp',
  ],
  staticDirs: ['./public'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    defaultName: 'Docs',
  },
  features: {
    /* keep the sidebar clean: this is a doc site, not a first-run setup */
    sidebarOnboardingChecklist: false,
    menuOnboardingChecklist: false,
  },
  viteFinal: async (config) => {
    // Story UI: Exclude from dependency optimization to handle CSS imports correctly
    config.optimizeDeps = {
      ...config.optimizeDeps,
      exclude: [
        ...(config.optimizeDeps?.exclude || []),
        '@tpitre/story-ui'
      ],
      // Excluding '@tpitre/story-ui' means Vite serves it (and everything it
      // imports) unbundled and never interops the CommonJS-only packages on
      // that path — '@radix-ui/themes' imports CJS-only 'classnames', which
      // otherwise fails in the browser with "does not provide an export named
      // 'default'" and the Story UI workspace never mounts. The '>' chains
      // tell Vite to pre-bundle those packages anyway.
      include: [
        ...(config.optimizeDeps?.include || []),
        '@tpitre/story-ui > @radix-ui/themes > classnames'
      ]
    };
    // Story UI: keep Vite's own module watcher alive on macOS. Storybook's story
    // INDEX watcher and Vite's MODULE watcher are different watchers, and the
    // launcher only fixes the first. Measured on a Storybook that had been
    // running seven hours: a story rewritten on disk was never re-transformed —
    // still serving the previous bytes after 90 seconds — so a repair was
    // re-checked against the render it was meant to replace. With polling the
    // same edit was served in 1 second. Remove this if you set server.watch
    // yourself.
    if (process.platform === 'darwin') {
      config.server = {
        ...config.server,
        watch: { ...(config.server?.watch ?? {}), usePolling: true, interval: 300 },
      };
    }
    return config;
  },
};

export default config;
