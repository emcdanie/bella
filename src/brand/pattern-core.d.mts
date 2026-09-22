export interface Shape {
  d: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}
export interface PatternColors {
  ochre: string; blue: string; cream: string; pale: string; pink: string;
  leaf: string; lime: string; limeL: string; ink: string; coral: string;
}
export function patternShapesWith(W: number, H: number, seed: number, C: PatternColors): Shape[];
export const GLYPHS: {
  E: { w: number; d: string }; L: { w: number; d: string }; T: { w: number; d: string };
  A: { w: number; d: string }; B: { w: number; d: string };
};
export const LOCK: { weight: number; width: number; height: number; tracking: number };
export function wordPaths(word: string): { paths: string[]; width: number; height: number; strokeWidth: number };
