# Surfaces — glass, shadow, and when to use which

BELLA ships three glass tiers plus a handful of solid surfaces. This file governs when each one is right, why the pure-white-alpha exception exists, and how dark mode changes the rules.

Consumer projects inherit this file. Downstream microagents may tighten these rules; they do not get to relax them.

## The three glass tiers

BELLA has three glass surfaces, progressing in opacity, blur, and radius:

| Token | Gradient | Blur | Radius | Use for |
|---|---|---|---|---|
| `surface.glass-light` | glass-48 → glass-28 | 14px (sm) | 16 | Subtle content panels, secondary surfaces, nested containers |
| `surface.glass-elevated` | glass-68 → glass-48 | 16px (md) | 20 | Case-study cards, featured content |
| `surface.glass` | glass-82 → glass-68 | 18px (lg) | 24 | Hero panels, primary feature cards |

Maps to `card.default` / `card.elevated` / `card.glass` respectively.

Decision tree:

1. **Is the card the single most important thing on the screen?** Use `card.glass`. One per view.
2. **Is it a content card — case study, idea cluster, feature?** Use `card.elevated`. Several per view is fine.
3. **Is it a subtle panel, secondary surface, or nested container?** Use `card.default`.

Pick the tier before picking the radius. Radius, shadow, and blur move together — don't cherry-pick one and leave the others on a different tier.

## When NOT to use glass

- **Never glass on glass.** A glass card inside a glass card produces mud. If a card needs sub-sections, use solid surface panels inside.
- **Never glass over colored surfaces.** Glass is designed for parchment (light mode) or ink (dark mode). Placing glass over amber, steel, sage, or dusk breaks the warmth model and makes text-contrast against the layer underneath unpredictable.
- **Never glass over a busy photo.** If you have an image backdrop, use a solid surface with `shadow.soft` instead — a frost won't save the readability.

Solid surface + shadow is the right answer whenever glass isn't.

## The pure-white-alpha exception

BELLA's top-level rule is: **never pure white.** The glass tokens break that rule, deliberately.

All glass primitives are white at alpha (28 / 48 / 55 / 68 / 72 / 82 / 90). The justification is encoded in `$extensions.bella.exception` on every one of them:

> Pure white alpha is permitted ONLY as a translucent overlay. Never as a solid fill. The warmth comes from parchment showing through.

Glass is never a solid fill. Every glass token is painted over parchment (`#F7F4EF`) or, in dark mode, over ink. The warm cream of the page transmits through the frost — you are never looking at `#FFFFFF`, you are looking at parchment filtered through alpha.

If a glass token is ever used without a warm background behind it (e.g. on pure white canvas, or on a photo without a parchment layer), it resolves visually to opaque white. That's a bug. Fix it by restoring a parchment layer beneath.

## Shadow pairing

Glass without shadow reads as flat. Every glass tier ships with a matching shadow:

| Surface | Shadow | Layers |
|---|---|---|
| `card.default` | `shadow.card-default` | 2-layer drop + inset `glass-55` highlight |
| `card.elevated` | `shadow.card-elevated` | 2-layer drop + inset `glass-68` highlight |
| `card.glass` | `shadow.raised` → `shadow.layered` | 3-layer drop + inset `glass-90` highlight |
| Floating hero glass | `shadow.floating` → `shadow.soft` | 3-layer drop, no inset |

Shadow tints are warm — cognac (`#2C1810` at 3–8% alpha), not black. That warmth is what keeps BELLA's editorial feel visible even under elevation. Do not substitute black or neutral-tinted shadows.

## Dark mode

In dark mode the rules flip:

- Glass opacity goes from white-alpha to **slate-alpha**: `slate-60 / slate-48 / slate-32` for glass / elevated / light. Parchment isn't beneath, ink is — slate at alpha reads as a lighter slate panel floating over ink.
- **Shadows stay warm.** Cognac shadows on dark still read as warmth — the CommandCenterDashboard surfaces use this exact combination. Do not swap to neutral-black shadows.
- An **amber-tinted glass variant** is available for active / selected states only: `surface.glass-amber` (amber at 15% over slate). Use sparingly — for a selected nav item, an active filter chip, a playing track. Never as a default surface.
- Text on dark glass: `parchment` is primary. `amber` passes AAA on ink (7.06:1) for emphasis spans and active-state text. Nothing else.

## Motion and reduced-motion (WCAG 2.3.3 AAA)

Blur and transform animations are cognitive and vestibular load. BELLA gates them behind `prefers-reduced-motion`.

Rules:

- **`backdrop-filter` transitions** (animating the blur value itself): only animate when `(prefers-reduced-motion: no-preference)`.
- **`transform: translateY(-2px)` hover-lifts** on glass cards: same gate.
- **Route transitions, modal openings, cross-fades**: reduce to instant swaps under `prefers-reduced-motion: reduce`.

The static glass surface itself is fine under reduced motion — it's the animation of blur or transform that triggers vestibular issues.

Implementation pattern:

```css
.bella-card-glass {
  /* Static glass — always on */
  background: var(--color-semantic-surface-glass);
  backdrop-filter: blur(var(--bella-blur-lg));
  -webkit-backdrop-filter: blur(var(--bella-blur-lg));
  box-shadow: var(--shadow-raised);
  border: 1px solid var(--color-semantic-border-glass-edge);
  border-top: 1px solid var(--color-semantic-border-glass-top);
  border-radius: var(--component-card-glass-border-radius);
  transition: none;
}

@media (prefers-reduced-motion: no-preference) {
  .bella-card-glass {
    transition: transform var(--motion-duration-normal) var(--motion-easing-emphasis),
                box-shadow var(--motion-duration-normal) var(--motion-easing-standard);
  }
  .bella-card-glass:hover {
    transform: var(--motion-transform-hover-lift);
  }
}
```

Consumer components that use glass or heavy animation must follow this gate. Default to static.

## Utility class

`.bella-card-glass` is emitted by `build.py` alongside `.bella-card-elevated` and `.bella-card-default`. Each bundles the surface + blur + shadow + borders into a single class and keeps `backdrop-filter` and `-webkit-backdrop-filter` in lock-step.

Prefer the utility classes over hand-composing properties. The `backdrop-filter` / `-webkit-backdrop-filter` pair drifts easily when maintained by hand; the utility doesn't let you forget the vendor prefix.
