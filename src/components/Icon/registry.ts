/* THE icon registry: every glyph BELLA ships, in one module.
 *
 * One set, declared: Iconoir (https://iconoir.com), MIT licence, the
 * portfolio's set. Path data is extracted from iconoir (regular set),
 * (c) Luca Burgio and contributors, MIT. BELLA carries the paths it
 * ships, not the library's component surface (borrow-behavior-only,
 * recorded). No mixing sets; no one-off SVGs anywhere in the system:
 * adding an icon = adding its Iconoir paths HERE, nothing inline
 * (audit:quality fails any inline <svg> outside the Icon component). */

export const GLYPHS = {
  ViewGrid: [
    'M14 20.4V14.6C14 14.2686 14.2686 14 14.6 14H20.4C20.7314 14 21 14.2686 21 14.6V20.4C21 20.7314 20.7314 21 20.4 21H14.6C14.2686 21 14 20.7314 14 20.4Z',
    'M3 20.4V14.6C3 14.2686 3.26863 14 3.6 14H9.4C9.73137 14 10 14.2686 10 14.6V20.4C10 20.7314 9.73137 21 9.4 21H3.6C3.26863 21 3 20.7314 3 20.4Z',
    'M14 9.4V3.6C14 3.26863 14.2686 3 14.6 3H20.4C20.7314 3 21 3.26863 21 3.6V9.4C21 9.73137 20.7314 10 20.4 10H14.6C14.2686 10 14 9.73137 14 9.4Z',
    'M3 9.4V3.6C3 3.26863 3.26863 3 3.6 3H9.4C9.73137 3 10 3.26863 10 3.6V9.4C10 9.73137 9.73137 10 9.4 10H3.6C3.26863 10 3 9.73137 3 9.4Z',
  ],
  Map: [
    'M9 19L3.78974 20.7368C3.40122 20.8663 3 20.5771 3 20.1675L3 5.43246C3 5.1742 3.16526 4.94491 3.41026 4.86325L9 3M9 19L15 21M9 19L9 3M15 21L20.5897 19.1368C20.8347 19.0551 21 18.8258 21 18.5675L21 3.83246C21 3.42292 20.5988 3.13374 20.2103 3.26325L15 5M15 21L15 5M15 5L9 3',
  ],
  Table: [
    'M21 3V21H3V3H21Z',
    'M3 16.5H21',
    'M3 12H21',
    'M3 7.5H21',
    'M16.5 3V21',
    'M12 3V21',
    'M7.5 3V21',
  ],
  NavArrowDown: ['M6 9L12 15L18 9'],
  /* ResourceCard's "Open" action. Extracted from iconoir-react ArrowUpRight,
     not redrawn: the exact path the portfolio's icon set renders. */
  ArrowUpRight: ['M6.00005 19L19 5.99996M19 5.99996V18.48M19 5.99996H6.52005'],
  /* FeaturedCase and CaseGrid's "Read it" cue. Iconoir ArrowRight (regular). */
  ArrowRight: ['M3 12L21 12M21 12L12.5 3.5M21 12L12.5 20.5'],
  /* Input's error message (status tokens, 2026-09-22). Iconoir WarningCircle
     (regular), from iconoir@7 icons/regular/warning-circle.svg. */
  WarningCircle: [
    'M12 7L12 13',
    'M12 17.01L12.01 16.9989',
    'M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z',
  ],
  /* NavList's hide / show toggle (CHIP components, 2026-10-03). Iconoir
     SidebarCollapse and SidebarExpand (regular), from iconoir@7.11.0. */
  SidebarCollapse: [
    'M19 21L5 21C3.89543 21 3 20.1046 3 19L3 5C3 3.89543 3.89543 3 5 3L19 3C20.1046 3 21 3.89543 21 5L21 19C21 20.1046 20.1046 21 19 21Z',
    'M7.25 10L5.5 12L7.25 14',
    'M9.5 21V3',
  ],
  SidebarExpand: [
    'M19 21L5 21C3.89543 21 3 20.1046 3 19L3 5C3 3.89543 3.89543 3 5 3L19 3C20.1046 3 21 3.89543 21 5L21 19C21 20.1046 20.1046 21 19 21Z',
    'M9.5 21V3',
    'M5.5 10L7.25 12L5.5 14',
  ],
  /* Search fields (CHIP components, 2026-10-03). Iconoir Search (regular),
     from iconoir@7.11.0. */
  Search: [
    'M17 17L21 21',
    'M3 11C3 15.4183 6.58172 19 11 19C13.213 19 15.2161 18.1015 16.6644 16.6493C18.1077 15.2022 19 13.2053 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11Z',
  ],
  /* Page tools (tool chrome, 7 Nov 2026). Iconoir regular, from iconoir@7.10.1. */
  RefreshDouble: [
    'M21.1679 8C19.6247 4.46819 16.1006 2 11.9999 2C6.81459 2 2.55104 5.94668 2.04932 11',
    'M17 8H21.4C21.7314 8 22 7.73137 22 7.4V3',
    'M2.88146 16C4.42458 19.5318 7.94874 22 12.0494 22C17.2347 22 21.4983 18.0533 22 13',
    'M7.04932 16H2.64932C2.31795 16 2.04932 16.2686 2.04932 16.6V21',
  ],
  Pin: [
    'M9.5 14.5L3 21',
    'M5.00007 9.48528L14.1925 18.6777L15.8895 16.9806L15.4974 13.1944L21.0065 8.5211L15.1568 2.67141L10.4834 8.18034L6.69713 7.78823L5.00007 9.48528Z',
  ],
  MoreHoriz: [
    'M20 12.5C20.2761 12.5 20.5 12.2761 20.5 12C20.5 11.7239 20.2761 11.5 20 11.5C19.7239 11.5 19.5 11.7239 19.5 12C19.5 12.2761 19.7239 12.5 20 12.5Z',
    'M12 12.5C12.2761 12.5 12.5 12.2761 12.5 12C12.5 11.7239 12.2761 11.5 12 11.5C11.7239 11.5 11.5 11.7239 11.5 12C11.5 12.2761 11.7239 12.5 12 12.5Z',
    'M4 12.5C4.27614 12.5 4.5 12.2761 4.5 12C4.5 11.7239 4.27614 11.5 4 11.5C3.72386 11.5 3.5 11.7239 3.5 12C3.5 12.2761 3.72386 12.5 4 12.5Z',
  ],
  Code: [
    'M13.5 6L10 18.5',
    'M6.5 8.5L3 12L6.5 15.5',
    'M17.5 8.5L21 12L17.5 15.5',
  ],
  Eye: [
    'M3 13C6.6 5 17.4 5 21 13',
    'M12 17C10.3431 17 9 15.6569 9 14C9 12.3431 10.3431 11 12 11C13.6569 11 15 12.3431 15 14C15 15.6569 13.6569 17 12 17Z',
  ],
  Copy: [
    'M19.4 20H9.6C9.26863 20 9 19.7314 9 19.4V9.6C9 9.26863 9.26863 9 9.6 9H19.4C19.7314 9 20 9.26863 20 9.6V19.4C20 19.7314 19.7314 20 19.4 20Z',
    'M15 9V4.6C15 4.26863 14.7314 4 14.4 4H4.6C4.26863 4 4 4.26863 4 4.6V14.4C4 14.7314 4.26863 15 4.6 15H9',
  ],
} as const;

export type IconName = keyof typeof GLYPHS;

export const ICON_NAMES = Object.keys(GLYPHS) as IconName[];
