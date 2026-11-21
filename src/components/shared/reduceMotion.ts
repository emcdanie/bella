/* Stories only: pretend the reader asked for less motion. Use as a story's
 * `beforeEach`; it returns the cleanup that puts the real matchMedia back.
 * Parts read reduced motion through useReducedMotion / reducedMotion
 * (shared/useCountTo), so they show their end state at once. */
export default function reduceMotion() {
  const real = window.matchMedia;
  window.matchMedia = ((query: string) => {
    if (!query.includes('prefers-reduced-motion')) return real.call(window, query);
    return {
      matches: query.includes('reduce'),
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    } as MediaQueryList;
  }) as typeof window.matchMedia;
  return () => {
    window.matchMedia = real;
  };
}
