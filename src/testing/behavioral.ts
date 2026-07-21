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
