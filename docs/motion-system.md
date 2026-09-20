# Motion System

BELLA's motion is small, fast and purposeful: every movement answers a state
change, and each state has one job. The tokens live in `tokens/primitive.json`
(`motion.*`) and reach components through `tokens/component.json`; the CSS
consumes the generated custom properties. No animation library, no spring
physics, no bounce on text.

## Tokens

### Durations

| Token | Value | Use |
| --- | --- | --- |
| `motion.duration.fast` | 150ms | Colour shifts, the keycap press |
| `motion.duration.normal` | 250ms | The button label roll, card hover lift, panel opens |
| `motion.duration.slow` | 400ms | Modal enter, route changes |
| `motion.duration.slower` | 600ms | Entrances: section and card-grid reveal on scroll |
| `motion.duration.trace` | 3400ms | One lap of Card's travelling trace ring (linear loop) |

### Easings

| Token | Value | Use |
| --- | --- | --- |
| `motion.easing.standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | Default for colour and state changes |
| `motion.easing.out` | `cubic-bezier(0.22, 1, 0.36, 1)` | Decelerate: the button label roll |
| `motion.easing.emphasis` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Overshoot: card lift only, never text |
| `motion.easing.in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` | Symmetric: movement that reverses, so open and close match |

### Transforms

| Token | Value | Use |
| --- | --- | --- |
| `motion.transform.hover-lift` | `translateY(-2px)` | Card hover. Cards only |
| `motion.transform.key-press` | `translateY(2px)` | Primary keycap `:active`. Down, never up |

## Rules

1. **Buttons never lift on hover; lift is reserved for cards.** A card is an
   object you pick up; a button is a key you press. Hover on a button is the
   label roll, never a rise.
2. **One job per state.**
   - Hover and focus-visible: the label roll (the label slides up out of view
     while an identical copy slides in from below, `duration.normal` on
     `easing.out`), plus a small colour shift on every tier: the primary
     plate settles onto its deep stop, the secondary fill tints, the
     tertiary label moves to `accent-hover` (`duration.fast`).
   - Active: the keycap press (`transform.key-press`, tighter shadow,
     `duration.fast`) on the primary; the secondary deepens its fill.
   - No trace ring on buttons: the travelling ring is Card's hover and focus
     affordance.
3. **Accessible duplicates.** The rolling copy is a real element with
   `aria-hidden="true"`, never CSS `content:`, so assistive tech reads the
   label once.
4. **Reduced motion is colour only.** Under `prefers-reduced-motion: reduce`
   there is no roll, no press, no lift and no travelling trace (Card shows a
   static ring). Colour changes remain, and every Button tier has one, so
   hover feedback never disappears.
5. **Quick and eased.** Hover transitions stay at or under 250ms. Loops run
   linear (the trace); everything else eases.
6. **Tokens only.** Durations, easings and transforms come from `motion.*`
   (through component tokens where a component owns the value). A literal
   `ms`, `cubic-bezier()` or `translateY()` in component CSS is a bug. The
   roll's `translateY(100%)` is geometry (one label height), not a motion
   value.

## Where it lives

| Component | Motion | Tokens |
| --- | --- | --- |
| Button | label roll (hover, focus-visible); keycap press (primary active); secondary fill and tertiary colour shift | `component.button.motion.*` |
| Card | hover lift; travelling trace ring; dark identity halo | `component.card.trace.*`, `motion.transform.hover-lift` |
| Shared trace (`src/components/shared/Trace.module.css`) | the ring recipe Card composes | `component.card.trace.duration` |

## History

Until 2026-09-18 this page described the portfolio's own motion layer
(`lib/motion.ts`, `components/motion/`), a superset ramp that was never
reconciled with BELLA's tokens. The portfolio retired that layer, and this
page now documents BELLA's system only. Same day: the Button primary stopped
lifting on hover and lost its trace ring, the label roll arrived, and
`motion.duration.trace` and `motion.easing.out` were added.

On 2026-09-20 the ramp gained `duration.slower` (600ms) and `easing.in-out`.
They came from the elleta.design portfolio, which had been carrying them as
local copies because BELLA had no entrance step and no symmetric ease. A third
token, `duration.base` (300ms), was proposed and dropped: it sat one step from
`duration.normal` (250ms), close enough that a consumer would guess wrong. The
portfolio retuned to `duration.normal` instead, so the ramp keeps one value for
"a transition you watch".
