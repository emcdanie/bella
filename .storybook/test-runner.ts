import type { TestRunnerConfig } from '@storybook/test-runner';
import { getStoryContext } from '@storybook/test-runner';
import { toMatchImageSnapshot } from 'jest-image-snapshot';
import { PNG } from 'pngjs';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/* fs, not import: the test-runner's ESM loader requires import attributes
 * for JSON, which the TS transform here does not emit */
const componentContract = JSON.parse(
  readFileSync(join(process.cwd(), 'tokens/component.json'), 'utf8')
);

/* audit:quality — the correctness layer. Baselines verify sameness; these
 * checks verify rules, per story, in the same pass:
 *   1. Rendered-text lint: no em/en dashes; nothing below 13px (the hard
 *      floor); own text past ~40 chars computes >= 16px (metadata rows are
 *      the recorded 13-14px tier and exempt via the length heuristic);
 *      Unique never below 24px.
 *   2. Computed styles: no pure-white solid fills except the page ground
 *      (the stage or [data-bella-ground]; alpha overlays pass);
 *      colour properties in inline styles resolve through var(), never
 *      literals (token specimens opt out with data-bella-specimen);
 *      contract rest-state invariants: hover/focus-only layers are inert
 *      at rest, driven by $extensions.bella.restState per component;
 *      no id attributes inside icon SVGs; the Button label roll keeps ONE
 *      static underline on its window, checked at rest and mid-roll.
 * Negative-tested (PR ritual): the grid double-surface and an em dash were
 * reintroduced as probes; both failed the gate, were removed, and it passed. */

const REST_CONTRACTS = Object.entries(
  (componentContract as any).component ?? {}
)
  .map(([key, val]: [string, any]) => ({
    name: key,
    restState: val?.$extensions?.bella?.restState,
  }))
  .filter((c) => c.restState?.invariants?.length);

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

/* The rolling label's underline contract (single-underline): the rolling
 * spans never carry text-decoration, and the only underline is the roll
 * window's ::after, present exactly once on the underlined variant and
 * absent elsewhere (and on disabled). Registered on the page so the rest
 * pass and the mid-roll pass run the SAME check. */
function underlineCheck(el: Element, inv: any): string[] {
  const out: string[] = [];
  for (const span of el.querySelectorAll(inv.selector)) {
    const line = getComputedStyle(span).textDecorationLine;
    if (line !== 'none') out.push(`rolling span carries text-decoration "${line}"; the underline belongs on the window`);
  }
  let count = 0;
  for (const node of [el, ...el.querySelectorAll('*')]) {
    if (node.matches(inv.selector)) continue;
    if (getComputedStyle(node).textDecorationLine.includes('underline')) count++;
  }
  const win = el.querySelector(inv.window);
  const after = win ? getComputedStyle(win, '::after') : null;
  const drawn = !!after && after.content !== 'none' && parseFloat(after.height) > 0;
  if (drawn) count++;
  const want =
    el.getAttribute('data-bella-variant') === inv.underlinedVariant && !(el as HTMLButtonElement).disabled ? 1 : 0;
  if (count !== want || (want === 1 && !drawn))
    out.push(`${count} underline(s), expected ${want}${want ? ' on the roll window' : ''}`);
  return out;
}

async function registerUnderlineCheck(page: Parameters<NonNullable<TestRunnerConfig['postVisit']>>[0]) {
  await page.evaluate(`window.__bellaUnderlineCheck = ${underlineCheck.toString()}`);
}

/* Mid-roll: hover each underlined, enabled button and, on every animation
 * frame for the length of the roll, run the same check while the text is
 * in flight. At least one sampled frame must be genuinely mid-roll, so a
 * pass cannot come from sampling only the settled end state. */
async function runMidRollChecks(
  page: Parameters<NonNullable<TestRunnerConfig['postVisit']>>[0],
  storyId: string,
  theme: string
): Promise<void> {
  const inv = REST_CONTRACTS.find((c) => c.name === 'button')?.restState.invariants.find(
    (i: any) => i.type === 'single-underline'
  );
  if (!inv) return;
  const targets = page.locator(
    `#storybook-root [data-bella-component="button"][data-bella-variant="${inv.underlinedVariant}"]:not(:disabled)`
  );
  const n = await targets.count();
  if (!n) return;
  /* In the test runner Storybook pauses every transition with an injected
     `transition: none !important` sheet (stable captures). The roll only
     exists as a transition, so lift that sheet for this pass and restore
     it before anything else runs. */
  const toggleStoryPause = (off: boolean) =>
    page.evaluate((o) => {
      for (const st of document.head.querySelectorAll('style')) {
        if (st.textContent?.includes('animation-play-state: paused !important')) (st as HTMLStyleElement).disabled = o;
      }
    }, off);
  await toggleStoryPause(true);
  const failures: string[] = [];
  try {
  for (let i = 0; i < n; i++) {
    const t = targets.nth(i);
    const box = await t.boundingBox();
    if (!box) continue;
    await page.mouse.move(0, 0);
    await page.waitForTimeout(400);
    /* arm the sampler BEFORE the pointer moves: it starts on the button's
       own pointerenter, so input latency cannot let the roll finish first */
    await t.evaluate((b, i2) => {
      const w = window as any;
      w.__bellaRoll = null;
      b.addEventListener(
        'pointerenter',
        () => {
          const dur = parseFloat(getComputedStyle(b).getPropertyValue('--component-button-motion-roll-duration')) || 250;
          const label = b.querySelector('[data-bella-roll=label]') as HTMLElement;
          const fails = new Set<string>();
          let frames = 0;
          let midFrames = 0;
          const start = performance.now();
          const tick = () => {
            frames++;
            const tf = getComputedStyle(label).transform;
            const y = new DOMMatrixReadOnly(tf === 'none' ? undefined : tf).f;
            const h = label.getBoundingClientRect().height;
            if (y < -0.5 && y > -h + 0.5) midFrames++;
            for (const f of w.__bellaUnderlineCheck(b, i2)) fails.add(f);
            if (performance.now() - start < dur + 100) requestAnimationFrame(tick);
            else w.__bellaRoll = { frames, midFrames, fails: [...fails] };
          };
          tick();
        },
        { once: true }
      );
    }, inv);
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForFunction(() => (window as any).__bellaRoll !== null, undefined, { timeout: 5000 });
    const res = await page.evaluate(() => (window as any).__bellaRoll as { frames: number; midFrames: number; fails: string[] });
    for (const f of res.fails) failures.push(`button #${i} mid-roll: ${f}`);
    if (res.midFrames === 0)
      failures.push(`button #${i}: no mid-roll frame sampled (${res.frames} frames), the check saw only settled states`);
  }
  await page.mouse.move(0, 0);
  await page.waitForTimeout(400);
  } finally {
    await toggleStoryPause(false);
  }
  if (failures.length > 0) {
    throw new Error(`[audit:quality] ${storyId} (${theme}):\n  - ${failures.join('\n  - ')}`);
  }
}

async function runQualityChecks(
  page: Parameters<NonNullable<TestRunnerConfig['postVisit']>>[0],
  storyId: string,
  theme: string
): Promise<void> {
  const failures: string[] = await page.evaluate(
    ({ restContracts, textLint }) => {
      const fails: string[] = [];
      const root = document.getElementById('storybook-root') ?? document.body;

      /* No blur here: a blur would change the rendered state before the
         screenshot and invalidate baselines that legitimately capture a
         play function's end state. Focused elements are simply not "at
         rest"; the rest-state loop skips them instead. */

      if (textLint) {
        const text = (root as HTMLElement).innerText ?? '';
        const dash = text.match(/[—–]/);
        if (dash) {
          const i = text.indexOf(dash[0]);
          fails.push(
            `em/en dash in rendered text: "...${text.slice(Math.max(0, i - 30), i + 30).replace(/\n/g, ' ')}..."`
          );
        }

        for (const el of root.querySelectorAll<HTMLElement>('*')) {
          const own = Array.from(el.childNodes)
            .filter((n) => n.nodeType === Node.TEXT_NODE)
            .map((n) => n.textContent ?? '')
            .join('')
            .trim();
          if (!own) continue;
          const cs = getComputedStyle(el);
          const size = parseFloat(cs.fontSize);
          const snippet = own.slice(0, 40);
          if (size < 13) {
            fails.push(`text below the 13px hard floor (${size}px): "${snippet}"`);
          } else if (
            size < 16 &&
            own.length > 40 &&
            (el.tagName === 'P' || el.tagName === 'LI')
          ) {
            /* the recorded audit:type heuristic: long-form reading text
               (P/LI past ~40 own chars) holds the 16px floor; table cells,
               tags, and captions are the 13-14px metadata tier */
            fails.push(
              `long-form text below 16px (${size}px, ${own.length} chars): "${snippet}"`
            );
          }
          if (/\bUnique\b/.test(cs.fontFamily) && size < 24) {
            fails.push(`Unique below 24px (${size}px): "${snippet}"`);
          }
        }
      }

      /* one icon set, declared: any inline <svg> outside the Icon
         component fails; Icon marks its svg with data-bella-icon */
      for (const svg of root.querySelectorAll('svg')) {
        if (svg.hasAttribute('data-bella-icon')) {
          /* an icon renders more than once (the Button label roll
             duplicates it), so an id inside it collides: paths and
             currentColor only */
          for (const withId of [svg, ...svg.querySelectorAll('[id]')].filter((n) => n.id)) {
            fails.push(
              `id inside an icon SVG (ids collide when the glyph repeats): <${withId.tagName.toLowerCase()} id="${withId.id}">`
            );
          }
          continue;
        }
        /* the one named exception (2026-09-22): diagram patterns draw their
           own SVG, and only as a labelled image that tells the story */
        if (svg.hasAttribute('data-bella-diagram')) {
          if (svg.getAttribute('role') !== 'img' || !(svg.getAttribute('aria-label') ?? '').trim()) {
            fails.push('diagram <svg> without role="img" and an aria-label that tells the story');
          }
          continue;
        }
        fails.push(
          `inline <svg> outside the Icon component (one-set rule): ${
            (svg.outerHTML ?? '').slice(0, 80)
          }`
        );
      }

      for (const el of root.querySelectorAll<HTMLElement>('*')) {
        if (el.closest('[data-bella-specimen]')) continue;
        const bg = getComputedStyle(el).backgroundColor;
        /* Pure white is the light page ground (style unify, 2026-09-22) and
           nothing else: only the stage or a marked ground container may
           paint it. Cards, chips and surfaces step down from it. */
        const ground = el.matches('[data-testid="bella-stage"], [data-bella-ground]');
        if (bg === 'rgb(255, 255, 255)' && !ground) {
          fails.push(
            `pure white solid fill on <${el.tagName.toLowerCase()} class="${el.className}">`
          );
        }
        const inline = el.getAttribute('style');
        if (
          inline &&
          /(?:^|;)\s*(?:background|background-color|color|border|border-color|box-shadow|fill|stroke|outline)[^;]*?(#[0-9a-fA-F]{3,8}\b|rgba?\()/.test(
            inline
          )
        ) {
          fails.push(
            `colour literal in inline style on <${el.tagName.toLowerCase()}>: "${inline.slice(0, 80)}"`
          );
        }
      }

      for (const contract of restContracts) {
        for (const el of root.querySelectorAll<HTMLElement>(
          `[data-bella-component="${contract.name}"]`
        )) {
          /* an element holding focus or hover is not at rest; its
             affordance layers are allowed to paint */
          if (el.matches(':focus-within') || el.matches(':hover')) continue;
          for (const inv of contract.restState.invariants) {
            if (inv.type === 'forbidden-ancestor') {
              if (el.parentElement?.closest(inv.ancestor)) {
                fails.push(
                  `[${contract.name}] placement: rendered inside a forbidden ancestor ${inv.ancestor}${inv.note ? ` (${inv.note})` : ''}`
                );
              }
            } else if (inv.type === 'containment') {
              const child = el.firstElementChild;
              if (!child) continue;
              const a = el.getBoundingClientRect();
              const b = child.getBoundingClientRect();
              const eps = 1;
              if (
                b.right > a.right + eps ||
                b.bottom > a.bottom + eps ||
                b.left < a.left - eps ||
                b.top < a.top - eps
              ) {
                fails.push(
                  `[${contract.name}] rest-state geometry: inner (${Math.round(b.bottom)}) overflows wrapper (${Math.round(a.bottom)}), the duplicated-surface class of bug`
                );
              }
            } else if (inv.type === 'single-underline') {
              for (const f of (window as any).__bellaUnderlineCheck(el, inv))
                fails.push(`[${contract.name}] "${inv.layer}": ${f}`);
            } else if (inv.type === 'translate-y') {
              /* a descendant's vertical offset as a percentage of its own
                 height: computed transforms are pixel matrices, so
                 translateY(100%) cannot be compared as a string */
              for (const part of el.querySelectorAll<HTMLElement>(inv.selector)) {
                const t = getComputedStyle(part).transform;
                const m = new DOMMatrixReadOnly(t === 'none' ? undefined : t);
                /* fractional height: offsetHeight rounds, the translate does not */
                const h = part.getBoundingClientRect().height;
                const pct = h ? Math.round((m.f / h) * 100) : 0;
                if (`${pct}%` !== inv.expect) {
                  fails.push(
                    `[${contract.name}] rest-state layer "${inv.layer}" paints at rest: ${inv.selector} sits at translateY(${pct}%), contract expects ${inv.expect}`
                  );
                }
              }
            } else {
              const cs = getComputedStyle(el, inv.pseudo ?? null);
              /* a pseudo invariant only binds where the pseudo exists;
                 tiers without the layer (no ::before content) are exempt */
              if (inv.pseudo && cs.content === 'none') continue;
              const actual = cs.getPropertyValue(inv.property).trim();
              if (actual !== inv.expect) {
                fails.push(
                  `[${contract.name}] rest-state layer "${inv.layer}" paints at rest: ${inv.property} is "${actual}", contract expects "${inv.expect}"`
                );
              }
            }
          }
        }
      }

      return fails;
    },
    { restContracts: REST_CONTRACTS, textLint: theme === 'light' }
  );

  if (failures.length > 0) {
    throw new Error(
      `[audit:quality] ${storyId} (${theme}):\n  - ${failures.join('\n  - ')}`
    );
  }
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

      await registerUnderlineCheck(page);
      await runQualityChecks(page, context.id, theme);
      await runMidRollChecks(page, context.id, theme);

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
                `A dark-mode story must sit on the dark ground.`
            );
          }
        }
      }

      /* play-once reveals (diagrams, style unify 2026-09-22) are frozen at
         their first keyframe by Storybook's capture pause; their reduced-
         motion render IS the finished frame, so capture those stories under
         prefers-reduced-motion: reduce. Scoped by data-bella-reveal so no
         other component's reduced-motion rules touch its baseline. */
      const hasReveal = await page.evaluate(() => !!document.querySelector('[data-bella-reveal]'));
      if (hasReveal) {
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.waitForTimeout(50);
      }
      const image = await page.screenshot({ fullPage: true, animations: 'disabled' });
      if (hasReveal) await page.emulateMedia({ reducedMotion: null });

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
