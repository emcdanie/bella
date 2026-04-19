# Motion System

A lightweight, zero-dependency motion system for the portfolio. All animations use native CSS transitions and the IntersectionObserver API — no Framer Motion or GSAP required.

## Architecture

```
lib/motion.ts              ← Tokens (durations, easings, distances)
lib/web-vitals.ts          ← Core Web Vitals monitoring (dev only)
lib/a11y-dev.ts            ← axe-core accessibility auditing (dev only)
components/motion/         ← Motion primitives
  ├── FadeIn.tsx           ← Viewport fade + slide-up
  ├── SlideUp.tsx          ← Viewport slide-up (no fade)
  ├── ScaleIn.tsx          ← Viewport scale + fade entrance
  ├── HoverLift.tsx        ← Standardized hover lift
  ├── StaggerContainer.tsx ← Stagger timing context
  ├── StaggerItem.tsx      ← Individual stagger item
  ├── PageTransition.tsx   ← Page-level fade on mount
  ├── LoadingBubbles.tsx   ← Lightweight loading indicator
  ├── useReducedMotion.ts  ← Reduced motion preference hook
  ├── useInView.ts         ← IntersectionObserver hook
  └── index.ts             ← Barrel exports
components/DevTools.tsx    ← Dev-only Web Vitals + a11y init
```

## Motion Tokens

All animation values are centralized in `lib/motion.ts`.

### Durations

| Token      | Value  | Use                                     |
|------------|--------|-----------------------------------------|
| `instant`  | 100ms  | Micro-interactions, toggles             |
| `fast`     | 150ms  | Hover states, button feedback           |
| `normal`   | 240ms  | Default transitions, card state changes |
| `moderate` | 350ms  | Entrances, exits, reveals               |
| `entrance` | 550ms  | Viewport-triggered fade-ins             |
| `slow`     | 700ms  | Hero/page-level transitions             |

### Easings

| Token        | Value                             | Use                        |
|--------------|-----------------------------------|----------------------------|
| `default`    | `cubic-bezier(0.25, 0.1, 0.25, 1)` | General purpose          |
| `out`        | `cubic-bezier(0.16, 1, 0.3, 1)`    | Entrances (decelerate)   |
| `in`         | `cubic-bezier(0.55, 0, 1, 0.45)`   | Exits (accelerate)       |
| `inOut`      | `cubic-bezier(0.45, 0, 0.55, 1)`   | Toggles, state changes   |
| `expressive` | `cubic-bezier(0.76, 0, 0.24, 1)`   | Menu reveals, overlays   |
| `linear`     | `linear`                            | Continuous animations    |

### Distances

| Token    | Value | Use                           |
|----------|-------|-------------------------------|
| `micro`  | 3px   | Hover lift, small feedback    |
| `small`  | 16px  | Card entrance, content reveal |
| `medium` | 24px  | Section entrance, fade-in     |
| `large`  | 40px  | Hero entrance, page slide     |

### Stagger

| Token     | Value | Use                       |
|-----------|-------|---------------------------|
| `fast`    | 40ms  | Small lists               |
| `default` | 80ms  | Section content           |
| `slow`    | 120ms | Hero sequences            |

## Component Usage

### FadeIn

Viewport-triggered fade-in with slide-up:

```tsx
import { FadeIn } from "@/components/motion";

<FadeIn delay={100} distance={24}>
  <h2>Section Title</h2>
</FadeIn>
```

Props: `delay?` (ms), `distance?` (px), `ms?` (duration), `as?` (HTML tag), `className?`

### SlideUp

Pure vertical slide without opacity change:

```tsx
<SlideUp distance={16}>
  <Card />
</SlideUp>
```

### ScaleIn

Scale + fade entrance for media/cards:

```tsx
<ScaleIn from={0.92} delay={200}>
  <Image ... />
</ScaleIn>
```

### HoverLift

Standardized hover effect for interactive elements:

```tsx
<HoverLift lift={3} shadow="0 12px 32px rgba(44,24,16,0.08)">
  <Card />
</HoverLift>
```

### Stagger

Sequential entrance for lists:

```tsx
import { StaggerContainer, StaggerItem } from "@/components/motion";

<StaggerContainer stagger={80}>
  {items.map((item, i) => (
    <StaggerItem key={item.id} index={i} visible={containerInView}>
      <Card data={item} />
    </StaggerItem>
  ))}
</StaggerContainer>
```

### PageTransition

Page-level fade on mount:

```tsx
import { PageTransition } from "@/components/motion";

export default function Page() {
  return (
    <PageTransition>
      <main>...</main>
    </PageTransition>
  );
}
```

### LoadingBubbles

Lightweight loading indicator:

```tsx
import { LoadingBubbles } from "@/components/motion";

<LoadingBubbles count={3} size={8} color="#8C8CA0" />
```

## Accessibility

### prefers-reduced-motion

Every motion primitive respects the user's OS-level motion preference:

- **Reduced motion ON**: Animations resolve instantly (opacity fades still work, transforms are skipped)
- **Reduced motion OFF**: Full animation experience

The `useReducedMotion()` hook provides reactive access:

```tsx
import { useReducedMotion } from "@/components/motion";

function MyComponent() {
  const reduced = useReducedMotion();
  // Adapt behavior based on preference
}
```

Global CSS fallback in `globals.css`:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

## Performance Guidelines

### Do

- Animate only `transform` and `opacity` (compositor-only properties)
- Use `will-change` sparingly and only on elements that animate
- Use `{ passive: true }` on all scroll event listeners
- Use `requestAnimationFrame` for JS-driven animations
- Lazy-load below-fold images with `loading="lazy"`
- Use `priority` prop on above-fold hero images

### Don't

- Animate `width`, `height`, `top`, `left`, `margin`, `padding` (triggers layout)
- Animate `box-shadow` directly (triggers paint) — use pseudo-elements or opacity instead
- Add `will-change` to more than 5–6 elements simultaneously
- Run continuous JS animations when the tab is not visible

## Dev Tools

### Web Vitals

Automatically reports LCP, CLS, INP, and FCP to the browser console in development. Color-coded by rating (green/yellow/red).

### Accessibility Audit

Runs axe-core on page load in development. Reports violations grouped by severity. Requires `axe-core` as a dev dependency:

```bash
npm install -D axe-core
```

Both are initialized by the `<DevTools />` component in `layout.tsx` and have zero production impact (tree-shaken by the `NODE_ENV` check).
