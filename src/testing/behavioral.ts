import { expect, userEvent } from 'storybook/test';

/* Behavioral test template — wired BEFORE the first component (Phase 2 brief).
 *
 * Every BELLA component story suite composes these three checks in its play
 * functions. Definition of done per component (Phase 3) requires all of them
 * green, in both themes, plus the audit:visual snapshots.
 *
 * Usage in a stories file:
 *
 *   export const Behavior: Story = {
 *     play: async ({ canvas, step }) => {
 *       const button = canvas.getByRole('button', { name: /save/i });
 *       await step('keyboard', () => expectKeyboardOperable(button));
 *       await step('focus', () => expectVisibleFocus(button));
 *       await step('states', () => expectAriaStates(button, { pressed: true }));
 *     },
 *   };
 */

/** Tab reaches the element, and both Enter and Space activate it. */
export async function expectKeyboardOperable(
  el: HTMLElement,
  onActivate?: () => number
): Promise<void> {
  el.blur();
  await userEvent.tab();
  // Tab until the element is reached (bounded — a template, not a maze solver)
  for (let i = 0; i < 20 && document.activeElement !== el; i++) {
    await userEvent.tab();
  }
  expect(document.activeElement).toBe(el);

  if (onActivate) {
    const before = onActivate();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    expect(onActivate()).toBeGreaterThan(before);
  }
}

/** Focus produces a visible indicator: a non-none outline or a focus box-shadow. */
export async function expectVisibleFocus(el: HTMLElement): Promise<void> {
  el.focus();
  expect(document.activeElement).toBe(el);
  const style = getComputedStyle(el);
  const hasOutline = style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0;
  const hasRing = style.boxShadow !== 'none' && style.boxShadow !== '';
  expect(hasOutline || hasRing).toBe(true);
}

/** Declarative ARIA state assertions — the state must be in the accessibility
 * tree, not only painted. */
export function expectAriaStates(
  el: HTMLElement,
  states: Partial<{
    pressed: boolean;
    expanded: boolean;
    current: string | boolean;
    disabled: boolean;
    checked: boolean;
  }>
): void {
  if (states.pressed !== undefined)
    expect(el).toHaveAttribute('aria-pressed', String(states.pressed));
  if (states.expanded !== undefined)
    expect(el).toHaveAttribute('aria-expanded', String(states.expanded));
  if (states.current !== undefined)
    expect(el).toHaveAttribute('aria-current', String(states.current));
  if (states.disabled !== undefined) {
    if (states.disabled) {
      expect(
        el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true'
      ).toBe(true);
    }
  }
  if (states.checked !== undefined)
    expect(el).toHaveAttribute('aria-checked', String(states.checked));
}

/** Touch-target floor: WCAG 2.5.5 AAA, encoded as spacing.touch-target (44px). */
export function expectTouchTarget(el: HTMLElement, floor = 44): void {
  const rect = el.getBoundingClientRect();
  expect(rect.height).toBeGreaterThanOrEqual(floor);
}

/** Every raster <img> under root has loaded at a natural width of at least
 * 2x its rendered width (vector sources are exempt: they have no natural
 * resolution to run out of). The cover-slot sharpness contract. Under
 * object-fit: contain the rendered width is the painted image, not the box:
 * a portrait screen in a 16:10 well paints narrower than its element. */
export async function expectSharpImages(root: HTMLElement): Promise<void> {
  const imgs = Array.from(root.querySelectorAll('img')).filter(
    (i) => !/\.svg($|\?)|^data:image\/svg/.test(i.currentSrc || i.src)
  );
  /* lazy images below the fold never start loading on their own: force them */
  for (const i of imgs) i.loading = 'eager';
  await Promise.all(imgs.map((i) => i.decode().catch(() => null)));
  for (const i of imgs) {
    const box = i.getBoundingClientRect();
    const rendered =
      getComputedStyle(i).objectFit === 'contain' && i.naturalHeight > 0
        ? Math.min(box.width, (box.height * i.naturalWidth) / i.naturalHeight)
        : box.width;
    if (rendered === 0) continue;
    expect(
      i.naturalWidth,
      `${i.src.split('/').pop()}: natural ${i.naturalWidth}px vs rendered ${Math.round(rendered)}px`
    ).toBeGreaterThanOrEqual(rendered * 2);
  }
}
