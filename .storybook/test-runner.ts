import type { TestRunnerConfig } from '@storybook/test-runner';
import { getStoryContext } from '@storybook/test-runner';
import { toMatchImageSnapshot } from 'jest-image-snapshot';
import { PNG } from 'pngjs';

/* audit:visual — every story is verified in BOTH themes:
 *
 * 1. Theme-integrity check: the BELLA stage's effective background must be
 *    light in light mode and dark in dark mode (relative luminance). This is
 *    the automated tripwire for the About-cards class of bug — a light-mode
 *    story rendering dark surfaces fails the run, no baseline needed.
 * 2. Image snapshot per theme (jest-image-snapshot). Baselines live in
 *    src/__image_snapshots__/ and are committed. Rendering differs across
 *    OSes, so baselines are per-platform; CI sets SKIP_VISUAL_SNAPSHOTS=1
 *    and relies on the integrity check + a11y + interactions until a
 *    Linux-baseline (or Docker) decision is made.
 *
 * Opt a story out of the integrity check (e.g. a deliberately fixed-context
 * surface) with parameters: { bella: { themeIntegrity: false } }.
 */

const THEMES = ['light', 'dark'] as const;

function relativeLuminance(rgb: [number, number, number]): number {
  const lin = rgb.map((c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

const config: TestRunnerConfig = {
  setup() {
    expect.extend({ toMatchImageSnapshot });
  },
  async postVisit(page, context) {
    const storyContext = await getStoryContext(page, context);
    const checkIntegrity = storyContext.parameters?.bella?.themeIntegrity !== false;
    const skipSnapshots = process.env.SKIP_VISUAL_SNAPSHOTS === '1';

    for (const theme of THEMES) {
      await page.evaluate((t) => {
        document.documentElement.setAttribute('data-theme', t);
      }, theme);
      // let the theme flip settle (CSS custom properties apply synchronously,
      // but give any transitions a beat, then freeze animations for capture)
      await page.waitForTimeout(100);

      if (checkIntegrity) {
        const bg = await page.evaluate(() => {
          const stage = document.querySelector('[data-testid="bella-stage"]');
          if (!stage) return null;
          const c = getComputedStyle(stage).backgroundColor;
          const m = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
          return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
        });
        if (bg) {
          const lum = relativeLuminance(bg as [number, number, number]);
          if (theme === 'light' && lum < 0.4) {
            throw new Error(
              `[audit:visual] ${context.id}: light theme renders a dark stage ` +
                `(background rgb(${bg.join(',')}), luminance ${lum.toFixed(3)}). ` +
                `A light-mode story must sit on the light ground.`
            );
          }
          if (theme === 'dark' && lum > 0.2) {
            throw new Error(
              `[audit:visual] ${context.id}: dark theme renders a light stage ` +
                `(background rgb(${bg.join(',')}), luminance ${lum.toFixed(3)}). ` +
                `A dark-mode story must sit on navy.`
            );
          }
        }
      }

      const image = await page.screenshot({ fullPage: true, animations: 'disabled' });

      if (checkIntegrity) {
        // Pixel-level integrity: the computed-style check above only sees the
        // stage element; the About-cards class of bug paints dark surfaces
        // INSIDE a light stage. Mean rendered luminance catches it — measured
        // bands on the current suite: light stories 0.86-0.96, dark 0.12-0.22.
        const png = PNG.sync.read(image as Buffer);
        let sum = 0;
        const n = png.width * png.height;
        for (let i = 0; i < png.data.length; i += 4) {
          sum += (0.2126 * png.data[i] + 0.7152 * png.data[i + 1] + 0.0722 * png.data[i + 2]) / 255;
        }
        const mean = sum / n;
        if (theme === 'light' && mean < 0.6) {
          throw new Error(
            `[audit:visual] ${context.id}: light theme renders predominantly dark ` +
              `(mean luminance ${mean.toFixed(3)}, expected ≥ 0.6). Dark surfaces are ` +
              `leaking into the light theme. Opt out only for deliberate fixed-dark ` +
              `stories via parameters.bella.themeIntegrity = false.`
          );
        }
        if (theme === 'dark' && mean > 0.4) {
          throw new Error(
            `[audit:visual] ${context.id}: dark theme renders predominantly light ` +
              `(mean luminance ${mean.toFixed(3)}, expected ≤ 0.4). Light surfaces are ` +
              `leaking into the dark theme.`
          );
        }
      }

      if (!skipSnapshots) {
        expect(image).toMatchImageSnapshot({
          customSnapshotsDir: 'src/__image_snapshots__',
          customSnapshotIdentifier: `${context.id}-${theme}`,
          failureThreshold: 0.01,
          failureThresholdType: 'percent',
        });
      }
    }

    // restore the story's own theme so subsequent test-runner assertions
    // (a11y runs in postVisit order) see the globals-driven state
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'light');
    });
  },
};

export default config;
