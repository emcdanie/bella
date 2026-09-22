import tokens from '../../tokens/bella.json';
import { patternShapesWith, GLYPHS, LOCK, wordPaths, type Shape, type PatternColors } from './pattern-core.mjs';

/* The brand pattern for the components (brand refresh, 2026-09-22). The
 * generator lives in pattern-core.mjs, shared with scripts/build-favicons.mjs;
 * this module feeds it the color.pattern.* tokens, never literals. */

type Tok = { $value: string };
const P = (tokens as unknown as { primitive: { color: { pattern: Record<string, Tok> } } }).primitive.color.pattern;

export const PATTERN_COLORS: PatternColors = {
  ochre: P.ground.$value,
  blue: P.tiger.$value,
  cream: P.cream.$value,
  pale: P.rosette.$value,
  pink: P.pink.$value,
  leaf: P.leopard.$value,
  lime: P.zebra.$value,
  limeL: P['zebra-light'].$value,
  ink: P.ink.$value,
  coral: P.coral.$value,
};

/** Every shape of the pattern for a W x H field, in paint order. */
export function patternShapes(W: number, H: number, seed: number): Shape[] {
  return patternShapesWith(W, H, seed, PATTERN_COLORS);
}

export { GLYPHS, LOCK, wordPaths };
export type { Shape };
export type Glyph = keyof typeof GLYPHS;
