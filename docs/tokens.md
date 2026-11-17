# BELLA tokens

Built by `tokens/build.mjs` from the Figma Foundations export. Do not edit. Values per theme; an arrow means the token points at another token.

## Tier 1: ramps and scales

| CSS name | Value | Description |
|---|---|---|
| `--shadow-sm` | `0px 1px 2px 0px #1d20300d` | Shadow sm, from the Figma effect style shadow/sm; the same in every theme. |
| `--shadow-md` | `0px 4px 12px 0px #1d20301a` | Shadow md, from the Figma effect style shadow/md; the same in every theme. |
| `--shadow-lg` | `0px 12px 32px 0px #1d20301a` | Shadow lg, from the Figma effect style shadow/lg; the same in every theme. |
| `--shadow-hover` | `0px 8px 24px 0px #1d20301a` | Shadow hover, from the Figma effect style shadow/hover; the same in every theme. |
| `--shadow-soft` | `0px 1px 2px 0px #1d20300d, 0px 10px 30px 0px #1d20300d, 0px 24px 60px 0px #1d20300d` | Shadow soft, from the Figma effect style shadow/soft; the same in every theme. |
| `--shadow-key-resting` | `0px 0px 0px 0px #00000000` | Flat button: no key edge or cast (shared look, 8 Nov). The name stays so nothing that reads it breaks. |
| `--shadow-key-pressed` | `0px 0px 0px 0px #00000000` | Flat button: no key edge or cast (shared look, 8 Nov). The name stays so nothing that reads it breaks. |
| `--shadow-card-rest` | `13px 26px 54px 0px #1d203033` | Shadow card-rest, from the Figma effect style shadow/card-rest; the same in every theme. |
| `--shadow-card-rest-dark` | `13px 26px 54px 0px #1d20304d` | Shadow card-rest-dark, from the Figma effect style shadow/card-rest-dark; the same in every theme; the dark-theme twin of shadow/card-rest. |
| `--shadow-card-ink` | `0px 1px 3px 0px #1d20300d, 0px 12px 28px 0px #1d20301a` | Shadow card-ink, from the Figma effect style shadow/card-ink; the same in every theme. |
| `--shadow-ui-ink` | `0px 1px 2px 0px #1d20300d, 0px 4px 10px 0px #1d20301a` | Shadow ui-ink, from the Figma effect style shadow/ui-ink; the same in every theme. |
| `--shadow-card-ink-dark` | `0px 1px 3px 0px #1d20304d, 0px 12px 28px 0px #1d20304d` | Shadow card-ink-dark, from the Figma effect style shadow/card-ink-dark; the same in every theme; the dark-theme twin of shadow/card-ink. |
| `--shadow-ui-ink-dark` | `0px 1px 2px 0px #1d20304d, 0px 4px 10px 0px #1d20304d` | Shadow ui-ink-dark, from the Figma effect style shadow/ui-ink-dark; the same in every theme; the dark-theme twin of shadow/ui-ink. |
| `--shadow-offset-y-1` | `1px` | Shadow drop, 1px y-offset. An exception to the 4px scale, like hairline widths: shadows are not spacing, sizes or corners (17 Nov). |
| `--color-brand-navy-100` | `#edecf2` | brand navy ramp, step 100. Global scale: parts use a Tier 2 token, not this. |
| `--color-brand-navy-200` | `#c6c2d4` | Brand navy ramp, step 200. Dark code comments and line numbers. |
| `--color-brand-navy-300` | `#b0abc3` | brand navy ramp, step 300. Global scale: parts use a Tier 2 token, not this. |
| `--color-brand-navy-400` | `#9994b1` | Brand navy ramp, step 400. Global scale: parts use a Tier 2 token, not this. |
| `--color-brand-navy-500` | `#7c789b` | brand navy ramp, step 500. Global scale: parts use a Tier 2 token, not this. |
| `--color-brand-navy-600` | `#605e86` | brand navy ramp, step 600. Global scale: parts use a Tier 2 token, not this. |
| `--color-brand-navy-700` | `#444370` | brand navy ramp, step 700. Global scale: parts use a Tier 2 token, not this. |
| `--color-brand-navy-800` | `#2b2b5c` | Brand navy ramp, step 800. Global scale: parts use a Tier 2 token, not this. |
| `--color-brand-navy-900` | `#1b1b40` | Brand navy ramp, step 900. Global scale: parts use a Tier 2 token, not this. |
| `--color-brand-ochre-100` | `#fcf0e0` | Ochre ramp, step 100. Rebuilt on the ochre hue (was #fdefe5, the old peach chip fill). |
| `--color-brand-ochre-200` | `#efcda0` | Brand ochre ramp, step 200. Dark code numbers (7:1 on code rows). |
| `--color-brand-ochre-300` | `#e8a83e` | The accent (brand refresh, 2026-09-22): a fill |
| `--color-brand-ochre-400` | `#d0902a` | brand ochre ramp, step 400. Global scale: parts use a Tier 2 token, not this. |
| `--color-brand-ochre-500` | `#b97a14` | Brand ochre ramp, step 500, the deep accent. Global scale: parts use a Tier 2 token, not this. |
| `--color-brand-ochre-600` | `#94610e` | brand ochre ramp, step 600. Global scale: parts use a Tier 2 token, not this. |
| `--color-brand-ochre-700` | `#6f4808` | brand ochre ramp, step 700. Global scale: parts use a Tier 2 token, not this. |
| `--color-brand-ochre-800` | `#4e3104` | Brand ochre ramp, step 800. Light code numbers and attributes (7:1 on code rows). |
| `--color-brand-ochre-900` | `#2f1c01` | brand ochre ramp, step 900. Global scale: parts use a Tier 2 token, not this. |
| `--color-brand-ochre-alpha-15` | `#e8a83e26` | brand ochre at 15% opacity. Global; used through Tier 2 (shadows, scrims, glass, washes). |
| `--color-brand-stone-100` | `#f7f7f5` | The page ground (shared look, Elleta, 8 Nov 2026), the same as elleta.design. |
| `--color-brand-stone-200` | `#e6e4e1` | oklch(92% 0.005 85). Light selected wash (light ground, 2026-10-05). Figma mirrors the hex; OKLCH lives in the token source. |
| `--color-brand-stone-300` | `#c3c1be` | brand stone ramp, step 300. Global scale: parts use a Tier 2 token, not this. |
| `--color-brand-stone-400` | `#a09e9b` | brand stone ramp, step 400. Global scale: parts use a Tier 2 token, not this. |
| `--color-brand-stone-500` | `#7f7d79` | brand stone ramp, step 500. Global scale: parts use a Tier 2 token, not this. |
| `--color-brand-stone-600` | `#5f5d5a` | brand stone ramp, step 600. Global scale: parts use a Tier 2 token, not this. |
| `--color-brand-stone-700` | `#403e3b` | brand stone ramp, step 700. Global scale: parts use a Tier 2 token, not this. |
| `--color-brand-stone-800` | `#252320` | Brand stone ramp, step 800. Global scale: parts use a Tier 2 token, not this. |
| `--color-brand-stone-900` | `#110f0d` | Warm near-black |
| `--color-brand-wash-grey-ink` | `#3a3f50` | Ink on the grey wash #3a3f50, exact. Allowed off-ramp colour: the “Not measured” ink, kept as it was (Elleta, 17 Nov: “exactly as they were”). |
| `--color-brand-wash-grey` | `#ededea` | Wash grey #ededea, exact: the “Not measured” status wash. Allowed off-ramp colour (Elleta, 17 Nov: “exactly as they were”). |
| `--color-brand-pink-100` | `#fbeef5` | Brand pink ramp, step 100. Global scale: parts use a Tier 2 token, not this. |
| `--color-brand-pink-200` | `#f1bbd8` | brand pink ramp, step 200. Global scale: parts use a Tier 2 token, not this. |
| `--color-brand-pink-300` | `#e58bbb` | Brand pink ramp, step 300. Selection fill (Elleta, 8 Nov 2026); text on it is content/on-accent-1. |
| `--color-brand-pink-400` | `#da73a8` | brand pink ramp, step 400. Global scale: parts use a Tier 2 token, not this. |
| `--color-brand-pink-500` | `#cf5a95` | Value: #cf5a95 in every mode. |
| `--color-brand-pink-600` | `#a64777` | brand pink ramp, step 600. Global scale: parts use a Tier 2 token, not this. |
| `--color-brand-pink-700` | `#7d3359` | brand pink ramp, step 700. Global scale: parts use a Tier 2 token, not this. |
| `--color-brand-pink-800` | `#59223e` | brand pink ramp, step 800. Global scale: parts use a Tier 2 token, not this. |
| `--color-brand-pink-900` | `#361224` | brand pink ramp, step 900. Global scale: parts use a Tier 2 token, not this. |
| `--color-brand-blue-100` | `#eaf5fc` | CHIP light-blue button family (Elleta, 16 Nov 2026: “yes fill only”). AAA with the navy/blue labels. |
| `--color-brand-blue-200` | `#c8e5f7` | CHIP light-blue button family (Elleta, 16 Nov 2026: “yes fill only”). AAA with the navy/blue labels. |
| `--color-brand-blue-300` | `#63b4e8` | CHIP light-blue button family (Elleta, 16 Nov 2026: “yes fill only”). AAA with the navy/blue labels. |
| `--color-brand-blue-400` | `#48a1dc` | brand blue ramp, step 400. Global scale: parts use a Tier 2 token, not this. |
| `--color-brand-blue-500` | `#2b8fd0` | Brand blue ramp, step 500. Accent-3 fill. Global scale: parts use a Tier 2 token, not this. |
| `--color-brand-blue-600` | `#1865bb` | Brand blue ramp, step 600. Focus ring in the light themes; Chip light brand edge (4.57:1 on the lane). |
| `--color-brand-blue-700` | `#16496b` | CHIP light-blue button family (Elleta, 16 Nov 2026: “yes fill only”). AAA with the navy/blue labels. |
| `--color-brand-blue-800` | `#0f3550` | CHIP light-blue button family (Elleta, 16 Nov 2026: “yes fill only”). AAA with the navy/blue labels. |
| `--color-brand-blue-900` | `#0a2236` | CHIP light-blue button family (Elleta, 16 Nov 2026: “yes fill only”). AAA with the navy/blue labels. |
| `--color-utility-blue-100` | `#e6f1fb` | Blue ramp, step 100 = Chip wash blue #e6f1fb (brand anchor). |
| `--color-utility-blue-200` | `#b9daf5` | Utility blue ramp, step 200. Dark info word (7:1 on page, card and its wash). |
| `--color-utility-blue-300` | `#8fc4ee` | Utility blue ramp, step 300. Info strong fill and dark info edge. |
| `--color-utility-blue-400` | `#6495c5` | Muted blue |
| `--color-utility-blue-500` | `#4a7cae` | utility blue ramp, step 500. Global scale: parts use a Tier 2 token, not this. |
| `--color-utility-blue-600` | `#306497` | utility blue ramp, step 600. Global scale: parts use a Tier 2 token, not this. |
| `--color-utility-blue-700` | `#114c80` | Utility blue ramp, step 700. Light info word on its wash, 7:1. |
| `--color-utility-blue-800` | `#09345b` | utility blue ramp, step 800. Global scale: parts use a Tier 2 token, not this. |
| `--color-utility-blue-900` | `#031e37` | utility blue ramp, step 900. Global scale: parts use a Tier 2 token, not this. |
| `--color-utility-blue-alpha-15` | `#6495c526` | utility blue at 15% opacity. Global; used through Tier 2 (shadows, scrims, glass, washes). |
| `--color-utility-blue-alpha-30` | `#6495c54d` | utility blue at 30% opacity. Global; used through Tier 2 (shadows, scrims, glass, washes). |
| `--color-utility-red-100` | `#fbeae8` | Red ramp, step 100 = Chip wash red #fbeae8 (brand anchor). |
| `--color-utility-red-200` | `#febdb6` | Utility red ramp, step 200. Dark error word and dark code tags (7:1). |
| `--color-utility-red-300` | `#ff8f84` | Utility red ramp, step 300. Error strong fill and dark error edge. |
| `--color-utility-red-400` | `#f16d60` | utility red ramp, step 400. Global scale: parts use a Tier 2 token, not this. |
| `--color-utility-red-500` | `#e2473b` | Value: #e2473b in every mode. |
| `--color-utility-red-600` | `#b3261e` | Value: #b3261e in every mode. |
| `--color-utility-red-700` | `#8f2118` | Utility red ramp, step 700. Light error word on its wash, 7:1. |
| `--color-utility-red-800` | `#641e18` | utility red ramp, step 800. Global scale: parts use a Tier 2 token, not this. |
| `--color-utility-red-900` | `#3a1714` | Danger wash, dark |
| `--color-utility-green-100` | `#e5f4ea` | Green ramp, step 100 = Chip wash green #e5f4ea (brand anchor). |
| `--color-utility-green-200` | `#abe2ba` | Utility green ramp, step 200. Dark success word (7:1). |
| `--color-utility-green-300` | `#72d08b` | Utility green ramp, step 300. Success strong fill and dark success edge. |
| `--color-utility-green-400` | `#50b470` | utility green ramp, step 400. Global scale: parts use a Tier 2 token, not this. |
| `--color-utility-green-500` | `#2b9a57` | Utility green ramp, step 500. Global scale: parts use a Tier 2 token, not this. |
| `--color-utility-green-600` | `#1a7439` | Utility green ramp, step 600. Light success edge; pattern leopard. |
| `--color-utility-green-700` | `#18502f` | Utility green ramp, step 700. Light success word on its wash, 7:1. |
| `--color-utility-green-800` | `#12301d` | Success wash, dark |
| `--color-utility-green-900` | `#071b0e` | utility green ramp, step 900. Global scale: parts use a Tier 2 token, not this. |
| `--color-utility-yellow-100` | `#fcf4d8` | Utility yellow ramp, step 100 = Chip wash yellow #fcf4d8 (brand anchor). Light warning wash; dark warning word (her “A, cream is fine”). |
| `--color-utility-yellow-200` | `#f1d68a` | utility yellow ramp, step 200. Global scale: parts use a Tier 2 token, not this. |
| `--color-utility-yellow-300` | `#e9b820` | Value: #e9b820 in every mode. |
| `--color-utility-yellow-400` | `#c49a16` | utility yellow ramp, step 400. Global scale: parts use a Tier 2 token, not this. |
| `--color-utility-yellow-500` | `#a17e0d` | utility yellow ramp, step 500. Global scale: parts use a Tier 2 token, not this. |
| `--color-utility-yellow-600` | `#7f6305` | utility yellow ramp, step 600. Global scale: parts use a Tier 2 token, not this. |
| `--color-utility-yellow-700` | `#5e4800` | Utility yellow ramp, step 700. Light warning word on its wash, 7:1. |
| `--color-utility-yellow-800` | `#423100` | utility yellow ramp, step 800. Global scale: parts use a Tier 2 token, not this. |
| `--color-utility-yellow-900` | `#271c00` | utility yellow ramp, step 900. Global scale: parts use a Tier 2 token, not this. |
| `--color-neutral-100` | `#eceef3` | Neutral ramp, step 100. Dark default text; light subtle fill and light hairline. |
| `--color-neutral-200` | `#c3c7d2` | Neutral ramp, step 200. Dark muted and disabled text; light disabled edge. |
| `--color-neutral-300` | `#b1b7c7` | Neutral ramp, step 300. Global scale: parts use a Tier 2 token, not this. |
| `--color-neutral-400` | `#858b9f` | Neutral ramp, step 400. Dark control edge (border/strong) and dark icons; 3:1 on dark surfaces. |
| `--color-neutral-500` | `#767c8e` | neutral ramp, step 500. Global scale: parts use a Tier 2 token, not this. |
| `--color-neutral-600` | `#686d7d` | Neutral ramp, step 600. Light control edge (border/strong) and light icons; 3:1 on light surfaces. |
| `--color-neutral-700` | `#474c5e` | Neutral ramp, step 700. Light muted and disabled text (7:1 on page, surface, card); dark hairline. |
| `--color-neutral-800` | `#2e3240` | Neutral ramp, step 800. Light body and lane text; dark card and raised fill. |
| `--color-neutral-900` | `#1d2030` | Value: #1d2030 in every mode. |
| `--color-neutral-alpha-0` | `#1d203000` | Ink at 0% opacity. Global; used through Tier 2 (shadows, scrims, glass, washes). |
| `--color-neutral-alpha-5` | `#1d20300d` | Ink at 5% opacity. Global; used through Tier 2 (shadows, scrims, glass, washes). |
| `--color-neutral-alpha-10` | `#1d20301a` | Ink at 10% opacity. Global; used through Tier 2 (shadows, scrims, glass, washes). |
| `--color-neutral-alpha-20` | `#1d203033` | Ink at 20% opacity. Global; used through Tier 2 (shadows, scrims, glass, washes). |
| `--color-neutral-alpha-30` | `#1d20304d` | Ink at 30% opacity. Global; used through Tier 2 (shadows, scrims, glass, washes). |
| `--color-neutral-alpha-60` | `#1d203099` | Ink at 60% opacity. Global; used through Tier 2 (shadows, scrims, glass, washes). |
| `--color-neutral-white-alpha-10` | `#ffffff1a` | White at 10% opacity. Global; used through Tier 2 (shadows, scrims, glass, washes). |
| `--color-neutral-white-alpha-30` | `#ffffff4d` | White at 30% opacity. Global; used through Tier 2 (shadows, scrims, glass, washes). |
| `--color-neutral-white-alpha-50` | `#ffffff80` | White at 50% opacity. Global; used through Tier 2 (shadows, scrims, glass, washes). |
| `--color-neutral-white-alpha-70` | `#ffffffb2` | White at 70% opacity. Global; used through Tier 2 (shadows, scrims, glass, washes). |
| `--color-neutral-white` | `#ffffff` | Neutral ramp, white. Light card, surface and raised fills. |
| `--color-neutral-black` | `#000000` | neutral ramp, step black. Global scale: parts use a Tier 2 token, not this. |
| `--color-third-party-git` | `#f05133` | Another company’s logo colour, exact, logos only. |
| `--color-third-party-claude` | `#d97757` | Another company’s logo colour, exact, logos only. |
| `--spacing-4` | `4px` | Value: 4 in every mode. |
| `--spacing-8` | `8px` | Value: 8 in every mode. |
| `--spacing-12` | `12px` | Value: 12 in every mode. |
| `--spacing-16` | `16px` | Value: 16 in every mode. |
| `--spacing-20` | `20px` | Value: 20 in every mode. |
| `--spacing-24` | `24px` | Value: 24 in every mode. |
| `--spacing-32` | `32px` | Value: 32 in every mode. |
| `--spacing-40` | `40px` | Value: 40 in every mode. |
| `--spacing-44` | `44px` | Value: 44 in every mode. |
| `--spacing-48` | `48px` | Value: 48 in every mode. |
| `--spacing-64` | `64px` | Value: 64 in every mode. |
| `--spacing-80` | `80px` | Value: 80 in every mode. |
| `--breakpoint-640` | `640` | Mobile breakpoint |
| `--breakpoint-768` | `768` | Tablet breakpoint |
| `--breakpoint-1024` | `1024` | Desktop breakpoint |
| `--breakpoint-1440` | `1440` | Wide-desktop breakpoint |
| `--border-radius-0` | `0px` | border radius 0. Global scale value; use it through Tier 2. |
| `--border-radius-4` | `4px` | Value: 4 in every mode. |
| `--border-radius-8` | `8px` | Value: 8 in every mode. |
| `--border-radius-12` | `12px` | Value: 12 in every mode. |
| `--border-radius-16` | `16px` | Value: 16 in every mode. |
| `--border-radius-20` | `20px` | Value: 20 in every mode. |
| `--border-radius-24` | `24px` | Value: 24 in every mode. |
| `--border-radius-round` | `999px` | Value: 999 in every mode. |
| `--border-width-1` | `1px` | Value: 1 in every mode. |
| `--border-width-2` | `2px` | Value: 2 in every mode. |
| `--border-width-4` | `4px` | Value: 4 in every mode. Focus ring thickness (Elleta, 17 Nov: “4px, on the scale”). Was border/width/3. |
| `--typography-font-family-newsreader` | `"Newsreader", serif` | Typeface Newsreader (display). Global scale; parts use a Tier 2 type token. |
| `--typography-font-family-dm-sans` | `"DM Sans", sans-serif` | Typeface DM Sans (body and UI). Global scale; parts use a Tier 2 type token. |
| `--typography-font-family-geist-mono` | `"Geist Mono", monospace` | Typeface Geist Mono (code). Global scale; parts use a Tier 2 type token. |
| `--typography-font-size-16` | `16px` | Value: 16 in every mode. |
| `--typography-font-size-18` | `18px` | Value: 18 in every mode. |
| `--typography-font-size-20` | `20px` | Value: 20 in every mode. |
| `--typography-font-size-22` | `22px` | Value: 22 in every mode. |
| `--typography-font-size-24` | `24px` | typography font-size 24. Global scale value; use it through Tier 2. |
| `--typography-font-size-28` | `28px` | Value: 28 in every mode. Section titles on Figma doc pages. |
| `--typography-font-size-32` | `32px` | typography font-size 32. Global scale value; use it through Tier 2. |
| `--typography-font-size-40` | `40px` | Value: 40 in every mode. |
| `--typography-font-size-88` | `88px` | Cover only: the Figma file cover, never reading text. |
| `--typography-font-weight-300` | `300` | Value: 300 in every mode. |
| `--typography-font-weight-400` | `400` | Value: 400 in every mode. |
| `--typography-font-weight-500` | `500` | Value: 500 in every mode. |
| `--typography-font-weight-600` | `600` | Value: 600 in every mode. |
| `--typography-font-weight-700` | `700` | Value: 700 in every mode. |
| `--typography-font-weight-800` | `800` | Extra-bold |
| `--typography-line-height-110` | `1.1` | Line height 1.1 × the font size (named in percent). Global scale; use through Tier 2. |
| `--typography-line-height-115` | `1.15` | Line height 1.15 × the font size (named in percent). Global scale; use through Tier 2. |
| `--typography-line-height-130` | `1.3` | Line height 1.3 × the font size (named in percent). Global scale; use through Tier 2. |
| `--typography-line-height-150` | `1.5` | Line height 1.5 × the font size (named in percent). Global scale; use through Tier 2. |
| `--typography-line-height-180` | `1.8` | Line height 1.8 × the font size (named in percent). Global scale; use through Tier 2. |
| `--typography-letter-spacing-0` | `0px` | Value: 0 in every mode. |
| `--typography-letter-spacing-4` | `0.04em` | Wordmark tracking, 0.04em. The wordmark only (style unify, 22 Sep 2026). |
| `--typography-letter-spacing-minus-2` | `-0.02em` | Tightened tracking |
| `--typography-letter-spacing-minus-1-half` | `-0.015em` | Value: -0.015em in every mode. |
| `--typography-font-feature-ss09` | `"ss09" 1` | Font feature “ss09” 1 for Geist Mono. Global scale. |
| `--typography-line-height-px-24` | `24px` | Line height 24px, fixed (px group; the % group holds ratios). Global scale; use through Tier 2. |
| `--typography-line-height-px-40` | `40px` | Line height 40px, fixed (px group; the % group holds ratios). Global scale; use through Tier 2. |
| `--size-0` | `0px` | Global value 0. Added 17 Nov so part tokens alias instead of typing values. |
| `--size-4` | `4px` | size 4. Global scale value (4px step); use it through Tier 2. Was size/3 (Elleta, 17 Nov: “follow the by 4 px”). |
| `--size-12` | `12px` | size 12. Global scale value; use it through Tier 2. |
| `--size-16` | `16px` | Value: 16 in every mode. |
| `--size-20` | `20px` | Value: 20 in every mode. |
| `--size-24` | `24px` | Value: 24 in every mode. |
| `--size-28` | `28px` | size 28. Global scale value; use it through Tier 2. |
| `--size-32` | `32px` | size 32. Global scale value; use it through Tier 2. |
| `--size-36` | `36px` | Global value 36. Added 17 Nov so part tokens alias instead of typing values. |
| `--size-60` | `60px` | Value: 60 in every mode. |
| `--motion-duration-150` | `150ms` | Value: 150 in every mode. |
| `--motion-duration-200` | `200ms` | Hover lift on interactive cards (ms) |
| `--motion-duration-250` | `250ms` | Value: 250 in every mode. |
| `--motion-duration-400` | `400ms` | Value: 400 in every mode. |
| `--motion-duration-450` | `450ms` | Pop-in of a diagram element (ms). |
| `--motion-duration-900` | `900ms` | Line draw (ms). |
| `--motion-duration-3400` | `3400ms` | Value: 3400 in every mode. |
| `--motion-easing-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | Value: cubic-bezier(0.4, 0, 0.2, 1) in every mode. |
| `--motion-easing-emphasis` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Value: cubic-bezier(0.34, 1.56, 0.64, 1) in every mode. |
| `--motion-easing-out` | `cubic-bezier(0.22, 1, 0.36, 1)` | Value: cubic-bezier(0.22, 1, 0.36, 1) in every mode. |
| `--motion-easing-draw` | `cubic-bezier(0.65, 0, 0.35, 1)` | Draw ease. |
| `--motion-easing-pop` | `cubic-bezier(0.34, 1.4, 0.64, 1)` | Pop ease, a small overshoot. |
| `--motion-stagger-120` | `120ms` | Shortest stagger between diagram steps (ms). |
| `--motion-stagger-200` | `200ms` | Longest stagger between diagram steps (ms). |
| `--blur-8` | `8px` | Lightest frost |
| `--blur-14` | `14px` | Value: 14 in every mode. |
| `--blur-16` | `16px` | Value: 16 in every mode. |
| `--blur-18` | `18px` | Value: 18 in every mode. |
| `--blur-20` | `20px` | Extra-large frost |
| `--boolean-false` | `false` | boolean false. Global scale value; use it through Tier 2. |
| `--boolean-true` | `true` | Global value true. Added 17 Nov so part tokens alias instead of typing values. |

## Breakpoint sizes

| CSS name | BELLA light | BELLA dark | Chip light | Chip dark |
|---|---|---|---|---|
| `--typography-font-size-display-hero` | `82px` | `82px` | `82px` | `82px` |
| `--typography-font-size-display-section` | `40px` | `40px` | `40px` | `40px` |
| `--typography-font-size-display-page` | `60px` | `60px` | `60px` | `60px` |
| `--layout-container-pad` | → `spacing.32` `32px` | → `spacing.32` `32px` | → `spacing.32` `32px` | → `spacing.32` `32px` |
| `--layout-section-space` | → `spacing.48` `48px` | → `spacing.48` `48px` | → `spacing.48` `48px` | → `spacing.48` `48px` |
| `--layout-stack-sm` | → `spacing.8` `8px` | → `spacing.8` `8px` | → `spacing.8` `8px` | → `spacing.8` `8px` |
| `--layout-stack-md` | → `spacing.16` `16px` | → `spacing.16` `16px` | → `spacing.16` `16px` | → `spacing.16` `16px` |
| `--layout-stack-lg` | → `spacing.24` `24px` | → `spacing.24` `24px` | → `spacing.24` `24px` | → `spacing.24` `24px` |
| `--layout-gutter` | → `spacing.24` `24px` | → `spacing.24` `24px` | → `spacing.24` `24px` | → `spacing.24` `24px` |
| `--layout-card-padding` | → `spacing.24` `24px` | → `spacing.24` `24px` | → `spacing.24` `24px` | → `spacing.24` `24px` |
| `--layout-measure-body` | `680px` | `680px` | `680px` | `680px` |

## Tier 2: shared meaning

| CSS name | BELLA light | BELLA dark | Chip light | Chip dark |
|---|---|---|---|---|
| `--color-background-default` | → `color.brand.stone.100` `#f7f7f5` | → `color.neutral.900` `#1d2030` | → `color.brand.stone.100` `#f7f7f5` | → `color.neutral.900` `#1d2030` |
| `--color-background-knockout` | → `color.neutral.900` `#1d2030` | → `color.neutral.100` `#eceef3` | → `color.neutral.900` `#1d2030` | → `color.neutral.100` `#eceef3` |
| `--color-background-surface` | → `color.neutral.white` `#ffffff` | → `color.neutral.800` `#2e3240` | → `color.neutral.white` `#ffffff` | → `color.neutral.800` `#2e3240` |
| `--color-background-subtle` | → `color.neutral.100` `#eceef3` | → `color.neutral.black` `#000000` | → `color.neutral.100` `#eceef3` | → `color.neutral.black` `#000000` |
| `--color-background-accent-1` | → `color.brand.pink.300` `#e58bbb` | → `color.brand.pink.300` `#e58bbb` | → `color.brand.pink.300` `#e58bbb` | → `color.brand.pink.300` `#e58bbb` |
| `--color-background-accent-1-hover` | → `color.brand.pink.200` `#f1bbd8` | → `color.brand.pink.300` `#e58bbb` | → `color.brand.pink.200` `#f1bbd8` | → `color.brand.pink.300` `#e58bbb` |
| `--color-background-accent-subtle` | → `color.brand.stone.200` `#e6e4e1` | → `color.brand.stone.900` `#110f0d` | → `color.brand.stone.200` `#e6e4e1` | → `color.brand.stone.900` `#110f0d` |
| `--color-background-utility-success-knockout` | → `color.utility.green.300` `#72d08b` | → `color.utility.green.300` `#72d08b` | → `color.utility.green.300` `#72d08b` | → `color.utility.green.300` `#72d08b` |
| `--color-background-utility-info-knockout` | → `color.utility.blue.300` `#8fc4ee` | → `color.utility.blue.300` `#8fc4ee` | → `color.utility.blue.300` `#8fc4ee` | → `color.utility.blue.300` `#8fc4ee` |
| `--color-background-utility-info` | → `color.utility.blue.100` `#e6f1fb` | → `color.utility.blue.alpha.15` `#6495c526` | → `color.utility.blue.100` `#e6f1fb` | → `color.utility.blue.alpha.15` `#6495c526` |
| `--color-background-utility-error` | → `color.utility.red.100` `#fbeae8` | → `color.utility.red.900` `#3a1714` | → `color.utility.red.100` `#fbeae8` | → `color.utility.red.900` `#3a1714` |
| `--color-background-utility-success` | → `color.utility.green.100` `#e5f4ea` | → `color.utility.green.800` `#12301d` | → `color.utility.green.100` `#e5f4ea` | → `color.utility.green.800` `#12301d` |
| `--color-background-utility-warning-knockout` | → `color.brand.ochre.300` `#e8a83e` | → `color.brand.ochre.300` `#e8a83e` | → `color.brand.ochre.300` `#e8a83e` | → `color.brand.ochre.300` `#e8a83e` |
| `--color-background-utility-error-knockout` | → `color.utility.red.300` `#ff8f84` | → `color.utility.red.300` `#ff8f84` | → `color.utility.red.300` `#ff8f84` | → `color.utility.red.300` `#ff8f84` |
| `--color-background-utility-warning` | → `color.utility.yellow.100` `#fcf4d8` | → `color.brand.ochre.alpha.15` `#e8a83e26` | → `color.utility.yellow.100` `#fcf4d8` | → `color.brand.ochre.alpha.15` `#e8a83e26` |
| `--color-background-utility-neutral` | → `color.brand.wash.grey` `#ededea` | → `color.neutral.800` `#2e3240` | → `color.brand.wash.grey` `#ededea` | → `color.neutral.800` `#2e3240` |
| `--color-background-brand-hover` | → `color.neutral.700` `#474c5e` | → `color.neutral.200` `#c3c7d2` | → `color.brand.blue.200` `#c8e5f7` | → `color.brand.blue.200` `#c8e5f7` |
| `--color-background-transparent` | → `color.neutral.alpha.20` `#1d203033` | → `color.neutral.alpha.60` `#1d203099` | → `color.neutral.alpha.30` `#1d20304d` | → `color.neutral.alpha.60` `#1d203099` |
| `--color-background-default-hover` | → `color.neutral.100` `#eceef3` | → `color.neutral.800` `#2e3240` | → `color.neutral.100` `#eceef3` | → `color.neutral.800` `#2e3240` |
| `--color-background-highlight` | → `color.neutral.alpha.10` `#1d20301a` | → `color.neutral.white-alpha.10` `#ffffff1a` | → `color.neutral.alpha.10` `#1d20301a` | → `color.neutral.white-alpha.10` `#ffffff1a` |
| `--color-background-brand` | → `color.neutral.900` `#1d2030` | → `color.neutral.100` `#eceef3` | → `color.brand.blue.300` `#63b4e8` | → `color.brand.blue.300` `#63b4e8` |
| `--color-background-lane` | → `color.brand.stone.200` `#e6e4e1` | → `color.neutral.black` `#000000` | → `color.brand.stone.200` `#e6e4e1` | → `color.neutral.black` `#000000` |
| `--color-background-syntax-background` | → `color.brand.stone.100` `#f7f7f5` | → `color.neutral.900` `#1d2030` | → `color.brand.stone.100` `#f7f7f5` | → `color.neutral.900` `#1d2030` |
| `--color-background-syntax-add` | → `color.utility.green.100` `#e5f4ea` | → `color.utility.green.800` `#12301d` | → `color.utility.green.100` `#e5f4ea` | → `color.utility.green.800` `#12301d` |
| `--color-background-syntax-del` | → `color.utility.red.100` `#fbeae8` | → `color.utility.red.900` `#3a1714` | → `color.utility.red.100` `#fbeae8` | → `color.utility.red.900` `#3a1714` |
| `--color-background-accent-2` | → `color.utility.yellow.300` `#e9b820` | → `color.utility.yellow.300` `#e9b820` | → `color.utility.yellow.300` `#e9b820` | → `color.utility.yellow.300` `#e9b820` |
| `--color-background-accent-3` | → `color.brand.blue.500` `#2b8fd0` | → `color.brand.blue.500` `#2b8fd0` | → `color.brand.blue.500` `#2b8fd0` | → `color.brand.blue.500` `#2b8fd0` |
| `--color-background-accent-4` | → `color.utility.red.500` `#e2473b` | → `color.utility.red.500` `#e2473b` | → `color.utility.red.500` `#e2473b` | → `color.utility.red.500` `#e2473b` |
| `--color-background-logo-git` | → `color.third-party.git` `#f05133` | → `color.third-party.git` `#f05133` | → `color.third-party.git` `#f05133` | → `color.third-party.git` `#f05133` |
| `--color-background-logo-claude` | → `color.third-party.claude` `#d97757` | → `color.third-party.claude` `#d97757` | → `color.third-party.claude` `#d97757` | → `color.third-party.claude` `#d97757` |
| `--color-background-brand-subtle` | → `color.neutral.100` `#eceef3` | → `color.neutral.800` `#2e3240` | → `color.brand.blue.100` `#eaf5fc` | → `color.brand.blue.900` `#0a2236` |
| `--color-background-brand-subtle-hover` | → `color.neutral.200` `#c3c7d2` | → `color.neutral.700` `#474c5e` | → `color.brand.blue.200` `#c8e5f7` | → `color.brand.blue.800` `#0f3550` |
| `--color-background-transparent-none` | → `color.neutral.alpha.0` `#1d203000` | → `color.neutral.alpha.0` `#1d203000` | → `color.neutral.alpha.0` `#1d203000` | → `color.neutral.alpha.0` `#1d203000` |
| `--color-background-disabled` | → `color.neutral.100` `#eceef3` | → `color.neutral.800` `#2e3240` | → `color.neutral.100` `#eceef3` | → `color.neutral.800` `#2e3240` |
| `--color-background-pattern-ground` | → `color.brand.ochre.300` `#e8a83e` | → `color.brand.ochre.300` `#e8a83e` | → `color.brand.ochre.300` `#e8a83e` | → `color.brand.ochre.300` `#e8a83e` |
| `--color-background-pattern-tiger` | → `color.utility.blue.500` `#4a7cae` | → `color.utility.blue.500` `#4a7cae` | → `color.utility.blue.500` `#4a7cae` | → `color.utility.blue.500` `#4a7cae` |
| `--color-background-pattern-cream` | → `color.utility.yellow.100` `#fcf4d8` | → `color.utility.yellow.100` `#fcf4d8` | → `color.utility.yellow.100` `#fcf4d8` | → `color.utility.yellow.100` `#fcf4d8` |
| `--color-background-pattern-rosette` | → `color.neutral.200` `#c3c7d2` | → `color.neutral.200` `#c3c7d2` | → `color.neutral.200` `#c3c7d2` | → `color.neutral.200` `#c3c7d2` |
| `--color-background-pattern-pink` | → `color.brand.pink.300` `#e58bbb` | → `color.brand.pink.300` `#e58bbb` | → `color.brand.pink.300` `#e58bbb` | → `color.brand.pink.300` `#e58bbb` |
| `--color-background-pattern-leopard` | → `color.utility.green.600` `#1a7439` | → `color.utility.green.600` `#1a7439` | → `color.utility.green.600` `#1a7439` | → `color.utility.green.600` `#1a7439` |
| `--color-background-pattern-zebra` | → `color.utility.yellow.300` `#e9b820` | → `color.utility.yellow.300` `#e9b820` | → `color.utility.yellow.300` `#e9b820` | → `color.utility.yellow.300` `#e9b820` |
| `--color-background-pattern-zebra-light` | → `color.utility.yellow.200` `#f1d68a` | → `color.utility.yellow.200` `#f1d68a` | → `color.utility.yellow.200` `#f1d68a` | → `color.utility.yellow.200` `#f1d68a` |
| `--color-background-pattern-ink` | → `color.brand.stone.900` `#110f0d` | → `color.brand.stone.900` `#110f0d` | → `color.brand.stone.900` `#110f0d` | → `color.brand.stone.900` `#110f0d` |
| `--color-background-pattern-coral` | → `color.utility.red.400` `#f16d60` | → `color.utility.red.400` `#f16d60` | → `color.utility.red.400` `#f16d60` | → `color.utility.red.400` `#f16d60` |
| `--color-border-glass-top` | → `color.neutral.white-alpha.70` `#ffffffb2` | → `color.neutral.white-alpha.10` `#ffffff1a` | → `color.neutral.white-alpha.70` `#ffffffb2` | → `color.neutral.white-alpha.10` `#ffffff1a` |
| `--color-border-glass-edge` | → `color.neutral.white-alpha.50` `#ffffff80` | → `color.neutral.white-alpha.10` `#ffffff1a` | → `color.neutral.white-alpha.50` `#ffffff80` | → `color.neutral.white-alpha.10` `#ffffff1a` |
| `--color-border-accent` | → `color.neutral.400` `#858b9f` | → `color.neutral.600` `#686d7d` | → `color.neutral.400` `#858b9f` | → `color.neutral.600` `#686d7d` |
| `--color-border-default` | → `color.neutral.100` `#eceef3` | → `color.neutral.700` `#474c5e` | → `color.neutral.alpha.20` `#1d203033` | → `color.neutral.700` `#474c5e` |
| `--color-border-subtle` | → `color.neutral.100` `#eceef3` | → `color.neutral.700` `#474c5e` | → `color.neutral.100` `#eceef3` | → `color.neutral.700` `#474c5e` |
| `--color-border-strong` | → `color.neutral.600` `#686d7d` | → `color.neutral.400` `#858b9f` | → `color.neutral.600` `#686d7d` | → `color.neutral.400` `#858b9f` |
| `--color-border-utility-info` | → `color.utility.blue.500` `#4a7cae` | → `color.utility.blue.300` `#8fc4ee` | → `color.utility.blue.500` `#4a7cae` | → `color.utility.blue.300` `#8fc4ee` |
| `--color-border-utility-error` | → `color.utility.red.500` `#e2473b` | → `color.utility.red.300` `#ff8f84` | → `color.utility.red.500` `#e2473b` | → `color.utility.red.300` `#ff8f84` |
| `--color-border-utility-success` | → `color.utility.green.600` `#1a7439` | → `color.utility.green.300` `#72d08b` | → `color.utility.green.600` `#1a7439` | → `color.utility.green.300` `#72d08b` |
| `--color-border-utility-warning` | → `color.utility.yellow.500` `#a17e0d` | → `color.brand.ochre.300` `#e8a83e` | → `color.utility.yellow.500` `#a17e0d` | → `color.brand.ochre.300` `#e8a83e` |
| `--color-border-utility-neutral` | → `color.brand.stone.500` `#7f7d79` | → `color.neutral.400` `#858b9f` | → `color.brand.stone.500` `#7f7d79` | → `color.neutral.400` `#858b9f` |
| `--color-border-ink` | → `color.neutral.900` `#1d2030` | → `color.neutral.100` `#eceef3` | → `color.neutral.900` `#1d2030` | → `color.neutral.100` `#eceef3` |
| `--color-border-focus` | → `color.brand.blue.600` `#1865bb` | → `color.brand.blue.300` `#63b4e8` | → `color.brand.blue.600` `#1865bb` | → `color.brand.blue.300` `#63b4e8` |
| `--color-border-action-raised` | → `color.neutral.900` `#1d2030` | → `color.neutral.100` `#eceef3` | → `color.brand.blue.300` `#63b4e8` | → `color.brand.blue.300` `#63b4e8` |
| `--color-border-syntax` | → `color.brand.stone.200` `#e6e4e1` | → `color.neutral.800` `#2e3240` | → `color.brand.stone.200` `#e6e4e1` | → `color.neutral.800` `#2e3240` |
| `--color-border-brand` | → `color.neutral.900` `#1d2030` | → `color.neutral.100` `#eceef3` | → `color.brand.blue.600` `#1865bb` | → `color.brand.blue.300` `#63b4e8` |
| `--color-border-disabled` | → `color.neutral.200` `#c3c7d2` | → `color.neutral.700` `#474c5e` | → `color.neutral.200` `#c3c7d2` | → `color.neutral.700` `#474c5e` |
| `--color-border-accent-1` | → `color.brand.pink.500` `#cf5a95` | → `color.brand.pink.300` `#e58bbb` | → `color.brand.pink.500` `#cf5a95` | → `color.brand.pink.300` `#e58bbb` |
| `--color-content-default` | → `color.neutral.900` `#1d2030` | → `color.neutral.100` `#eceef3` | → `color.neutral.900` `#1d2030` | → `color.neutral.100` `#eceef3` |
| `--color-content-subtle` | → `color.neutral.700` `#474c5e` | → `color.neutral.200` `#c3c7d2` | → `color.neutral.700` `#474c5e` | → `color.neutral.200` `#c3c7d2` |
| `--color-content-knockout` | → `color.neutral.100` `#eceef3` | → `color.neutral.900` `#1d2030` | → `color.neutral.100` `#eceef3` | → `color.neutral.900` `#1d2030` |
| `--color-content-accent` | → `color.neutral.900` `#1d2030` | → `color.neutral.100` `#eceef3` | → `color.neutral.900` `#1d2030` | → `color.neutral.100` `#eceef3` |
| `--color-content-on-accent-1` | → `color.brand.stone.900` `#110f0d` | → `color.brand.stone.900` `#110f0d` | → `color.brand.stone.900` `#110f0d` | → `color.brand.stone.900` `#110f0d` |
| `--color-content-link` | → `color.neutral.900` `#1d2030` | → `color.neutral.100` `#eceef3` | → `color.neutral.900` `#1d2030` | → `color.neutral.100` `#eceef3` |
| `--color-content-utility-error` | → `color.utility.red.700` `#8f2118` | → `color.utility.red.200` `#febdb6` | → `color.utility.red.700` `#8f2118` | → `color.utility.red.200` `#febdb6` |
| `--color-content-utility-success` | → `color.utility.green.700` `#18502f` | → `color.utility.green.200` `#abe2ba` | → `color.utility.green.700` `#18502f` | → `color.utility.green.200` `#abe2ba` |
| `--color-content-utility-on-status` | → `color.neutral.900` `#1d2030` | → `color.neutral.900` `#1d2030` | → `color.neutral.900` `#1d2030` | → `color.neutral.900` `#1d2030` |
| `--color-content-utility-info` | → `color.utility.blue.700` `#114c80` | → `color.utility.blue.200` `#b9daf5` | → `color.utility.blue.700` `#114c80` | → `color.utility.blue.200` `#b9daf5` |
| `--color-content-utility-warning` | → `color.utility.yellow.700` `#5e4800` | → `color.utility.yellow.100` `#fcf4d8` | → `color.utility.yellow.700` `#5e4800` | → `color.utility.yellow.100` `#fcf4d8` |
| `--color-content-utility-neutral` | → `color.brand.wash.grey-ink` `#3a3f50` | → `color.neutral.200` `#c3c7d2` | → `color.brand.wash.grey-ink` `#3a3f50` | → `color.neutral.200` `#c3c7d2` |
| `--color-content-icon-subtle` | → `color.neutral.600` `#686d7d` | → `color.neutral.400` `#858b9f` | → `color.neutral.600` `#686d7d` | → `color.neutral.400` `#858b9f` |
| `--color-content-body` | → `color.neutral.800` `#2e3240` | → `color.neutral.100` `#eceef3` | → `color.neutral.800` `#2e3240` | → `color.neutral.100` `#eceef3` |
| `--color-content-highlight` | → `color.neutral.900` `#1d2030` | → `color.neutral.100` `#eceef3` | → `color.neutral.900` `#1d2030` | → `color.neutral.100` `#eceef3` |
| `--color-content-brand-knockout` | → `color.neutral.100` `#eceef3` | → `color.neutral.900` `#1d2030` | → `color.brand.blue.900` `#0a2236` | → `color.brand.blue.900` `#0a2236` |
| `--color-content-syntax-foreground` | → `color.neutral.900` `#1d2030` | → `color.neutral.100` `#eceef3` | → `color.neutral.900` `#1d2030` | → `color.neutral.100` `#eceef3` |
| `--color-content-syntax-keyword` | → `color.brand.pink.700` `#7d3359` | → `color.brand.pink.200` `#f1bbd8` | → `color.brand.pink.700` `#7d3359` | → `color.brand.pink.200` `#f1bbd8` |
| `--color-content-syntax-string` | → `color.utility.green.700` `#18502f` | → `color.utility.green.300` `#72d08b` | → `color.utility.green.700` `#18502f` | → `color.utility.green.300` `#72d08b` |
| `--color-content-syntax-number` | → `color.brand.ochre.800` `#4e3104` | → `color.brand.ochre.200` `#efcda0` | → `color.brand.ochre.800` `#4e3104` | → `color.brand.ochre.200` `#efcda0` |
| `--color-content-syntax-comment` | → `color.brand.stone.700` `#403e3b` | → `color.brand.navy.200` `#c6c2d4` | → `color.brand.stone.700` `#403e3b` | → `color.brand.navy.200` `#c6c2d4` |
| `--color-content-syntax-function` | → `color.brand.blue.700` `#16496b` | → `color.utility.blue.300` `#8fc4ee` | → `color.brand.blue.700` `#16496b` | → `color.utility.blue.300` `#8fc4ee` |
| `--color-content-syntax-tag` | → `color.utility.red.700` `#8f2118` | → `color.utility.red.200` `#febdb6` | → `color.utility.red.700` `#8f2118` | → `color.utility.red.200` `#febdb6` |
| `--color-content-syntax-attr` | → `color.brand.ochre.800` `#4e3104` | → `color.utility.yellow.200` `#f1d68a` | → `color.brand.ochre.800` `#4e3104` | → `color.utility.yellow.200` `#f1d68a` |
| `--color-content-syntax-punct` | → `color.neutral.700` `#474c5e` | → `color.neutral.200` `#c3c7d2` | → `color.neutral.700` `#474c5e` | → `color.neutral.200` `#c3c7d2` |
| `--color-content-syntax-line-number` | → `color.brand.stone.700` `#403e3b` | → `color.brand.navy.200` `#c6c2d4` | → `color.brand.stone.700` `#403e3b` | → `color.brand.navy.200` `#c6c2d4` |
| `--color-content-brand` | → `color.neutral.900` `#1d2030` | → `color.neutral.100` `#eceef3` | → `color.brand.blue.700` `#16496b` | → `color.brand.blue.200` `#c8e5f7` |
| `--color-content-brand-hover` | → `color.neutral.900` `#1d2030` | → `color.neutral.100` `#eceef3` | → `color.brand.blue.800` `#0f3550` | → `color.brand.blue.100` `#eaf5fc` |
| `--color-content-disabled` | → `color.neutral.700` `#474c5e` | → `color.neutral.200` `#c3c7d2` | → `color.neutral.700` `#474c5e` | → `color.neutral.200` `#c3c7d2` |
| `--color-content-lane-subtle` | → `color.neutral.800` `#2e3240` | → `color.neutral.200` `#c3c7d2` | → `color.neutral.800` `#2e3240` | → `color.neutral.200` `#c3c7d2` |
| `--border-radius-md` | → `border.radius.8` `8px` | → `border.radius.8` `8px` | → `border.radius.round` `999px` | → `border.radius.round` `999px` |
| `--border-radius-lg` | → `border.radius.round` `999px` | → `border.radius.round` `999px` | → `border.radius.round` `999px` | → `border.radius.round` `999px` |
| `--border-radius-card` | → `border.radius.16` `16px` | → `border.radius.16` `16px` | → `border.radius.20` `20px` | → `border.radius.20` `20px` |
| `--border-radius-form` | → `border.radius.8` `8px` | → `border.radius.8` `8px` | → `border.radius.16` `16px` | → `border.radius.16` `16px` |
| `--border-radius-sm` | → `border.radius.4` `4px` | → `border.radius.4` `4px` | → `border.radius.4` `4px` | → `border.radius.4` `4px` |
| `--typography-body-default-font-family` | → `typography.font-family.dm-sans` `"DM Sans", sans-serif` | → `typography.font-family.dm-sans` `"DM Sans", sans-serif` | → `typography.font-family.dm-sans` `"DM Sans", sans-serif` | → `typography.font-family.dm-sans` `"DM Sans", sans-serif` |
| `--typography-body-default-font-size` | → `typography.font-size.16` `16px` | → `typography.font-size.16` `16px` | → `typography.font-size.16` `16px` | → `typography.font-size.16` `16px` |
| `--typography-body-default-font-weight` | → `typography.font-weight.400` `400` | → `typography.font-weight.400` `400` | → `typography.font-weight.400` `400` | → `typography.font-weight.400` `400` |
| `--typography-label-default-font-size` | → `typography.font-size.16` `16px` | → `typography.font-size.16` `16px` | → `typography.font-size.16` `16px` | → `typography.font-size.16` `16px` |
| `--typography-button-default-font-size` | → `typography.font-size.16` `16px` | → `typography.font-size.16` `16px` | → `typography.font-size.16` `16px` | → `typography.font-size.16` `16px` |
| `--typography-button-default-font-weight` | → `typography.font-weight.500` `500` | → `typography.font-weight.500` `500` | → `typography.font-weight.500` `500` | → `typography.font-weight.500` `500` |
| `--typography-primary-nav-default-font-weight` | → `typography.font-weight.600` `600` | → `typography.font-weight.600` `600` | → `typography.font-weight.600` `600` | → `typography.font-weight.600` `600` |
| `--typography-title-default-font-weight` | → `typography.font-weight.600` `600` | → `typography.font-weight.600` `600` | → `typography.font-weight.600` `600` | → `typography.font-weight.600` `600` |
| `--typography-title-default-font-family` | → `typography.font-family.dm-sans` `"DM Sans", sans-serif` | → `typography.font-family.dm-sans` `"DM Sans", sans-serif` | → `typography.font-family.newsreader` `"Newsreader", serif` | → `typography.font-family.newsreader` `"Newsreader", serif` |
| `--typography-headline-sm-font-family` | → `typography.font-family.newsreader` `"Newsreader", serif` | → `typography.font-family.newsreader` `"Newsreader", serif` | → `typography.font-family.dm-sans` `"DM Sans", sans-serif` | → `typography.font-family.dm-sans` `"DM Sans", sans-serif` |
| `--focus-ring-width` | → `border.width.4` `4px` | → `border.width.4` `4px` | → `border.width.4` `4px` | → `border.width.4` `4px` |
| `--focus-ring-offset` | → `size.4` `4px` | → `size.4` `4px` | → `size.4` `4px` | → `size.4` `4px` |

## Tier 3: part tokens

| CSS name | BELLA light | BELLA dark | Chip light | Chip dark |
|---|---|---|---|---|
| `--component-button-secondary-background-hover` | → `button.color.background.hover` `#1d203000` | → `button.color.background.hover` `#1d203000` | → `button.color.background.hover` `#c8e5f7` | → `button.color.background.hover` `#0f3550` |
| `--component-button-secondary-background-active` | → `button.color.background.active` `#eceef3` | → `button.color.background.active` `#000000` | → `button.color.background.active` `#c8e5f7` | → `button.color.background.active` `#0f3550` |
| `--component-button-secondary-foreground-active` | → `button.color.content.active` `#1d2030` | → `button.color.content.active` `#eceef3` | → `button.color.content.active` `#0a2236` | → `button.color.content.active` `#eaf5fc` |
| `--component-button-sm-min-height` | → `spacing.44` `44px` | → `spacing.44` `44px` | → `spacing.44` `44px` | → `spacing.44` `44px` |
| `--component-button-icon-size` | → `size.20` `20px` | → `size.20` `20px` | → `size.20` `20px` | → `size.20` `20px` |
| `--component-button-tertiary-background-hover` | → `button.color.background.hover` `#1d203000` | → `button.color.background.hover` `#1d203000` | → `button.color.background.hover` `#c8e5f7` | → `button.color.background.hover` `#0f3550` |
| `--component-button-tertiary-background-active` | → `button.color.background.hover` `#1d203000` | → `button.color.background.hover` `#1d203000` | → `button.color.background.hover` `#c8e5f7` | → `button.color.background.hover` `#0f3550` |
| `--component-button-tertiary-foreground-active` | → `button.color.content.active` `#1d2030` | → `button.color.content.active` `#eceef3` | → `button.color.content.active` `#0a2236` | → `button.color.content.active` `#eaf5fc` |
| `--component-input-border-radius` | → `border.radius.form` `8px` | → `border.radius.form` `8px` | → `border.radius.form` `16px` | → `border.radius.form` `16px` |
| `--component-status-dot-size` | → `spacing.12` `12px` | → `spacing.12` `12px` | → `spacing.12` `12px` | → `spacing.12` `12px` |
| `--component-leader-pink` | → `color.border.accent-1` `#cf5a95` | → `color.border.accent-1` `#e58bbb` | → `color.border.accent-1` `#cf5a95` | → `color.border.accent-1` `#e58bbb` |
| `--component-select-border-radius` | → `border.radius.form` `8px` | → `border.radius.form` `8px` | → `border.radius.form` `16px` | → `border.radius.form` `16px` |
| `--component-kbd-border-radius` | → `border.radius.sm` `4px` | → `border.radius.sm` `4px` | → `border.radius.sm` `4px` | → `border.radius.sm` `4px` |
| `--component-page-title-font-weight` | → `typography.font-weight.400` `400` | → `typography.font-weight.400` `400` | → `typography.font-weight.400` `400` | → `typography.font-weight.400` `400` |
| `--component-meter-height` | → `spacing.8` `8px` | → `spacing.8` `8px` | → `spacing.8` `8px` | → `spacing.8` `8px` |
| `--component-stat-icon-well-size` | → `spacing.32` `32px` | → `spacing.32` `32px` | → `spacing.32` `32px` | → `spacing.32` `32px` |
| `--component-toast-action-border` | → `color.border.strong` `#686d7d` | → `color.border.strong` `#858b9f` | → `color.neutral.white-alpha.30` `#ffffff4d` | → `color.neutral.white-alpha.30` `#ffffff4d` |
| `--component-drawer-title-font-family` | → `typography.title-default.font-family` `"DM Sans", sans-serif` | → `typography.title-default.font-family` `"DM Sans", sans-serif` | → `typography.title-default.font-family` `"Newsreader", serif` | → `typography.title-default.font-family` `"Newsreader", serif` |
| `--component-drawer-head-border` | → `color.border.default` `#eceef3` | → `color.border.default` `#474c5e` | → `color.neutral.alpha.0` `#1d203000` | → `color.neutral.alpha.0` `#1d203000` |
| `--component-heading-subsection-font-family` | → `typography.headline-sm.font-family` `"Newsreader", serif` | → `typography.headline-sm.font-family` `"Newsreader", serif` | → `typography.headline-sm.font-family` `"DM Sans", sans-serif` | → `typography.headline-sm.font-family` `"DM Sans", sans-serif` |
| `--component-card-content-min-height` | → `size.0` `0px` | → `size.0` `0px` | → `size.0` `0px` | → `size.0` `0px` |
| `--component-spacing-step-bar-width-1` | → `spacing.4` `4px` | → `spacing.4` `4px` | → `spacing.4` `4px` | → `spacing.4` `4px` |
| `--component-spacing-step-bar-width-2` | → `spacing.8` `8px` | → `spacing.8` `8px` | → `spacing.8` `8px` | → `spacing.8` `8px` |
| `--component-spacing-step-bar-width-3` | → `spacing.12` `12px` | → `spacing.12` `12px` | → `spacing.12` `12px` | → `spacing.12` `12px` |
| `--component-spacing-step-bar-width-4` | → `spacing.16` `16px` | → `spacing.16` `16px` | → `spacing.16` `16px` | → `spacing.16` `16px` |
| `--component-spacing-step-bar-width-5` | → `spacing.20` `20px` | → `spacing.20` `20px` | → `spacing.20` `20px` | → `spacing.20` `20px` |
| `--component-spacing-step-bar-width-6` | → `spacing.24` `24px` | → `spacing.24` `24px` | → `spacing.24` `24px` | → `spacing.24` `24px` |
| `--component-spacing-step-bar-width-8` | → `spacing.32` `32px` | → `spacing.32` `32px` | → `spacing.32` `32px` | → `spacing.32` `32px` |
| `--component-spacing-step-bar-width-10` | → `spacing.40` `40px` | → `spacing.40` `40px` | → `spacing.40` `40px` | → `spacing.40` `40px` |
| `--component-spacing-step-bar-width-12` | → `spacing.48` `48px` | → `spacing.48` `48px` | → `spacing.48` `48px` | → `spacing.48` `48px` |
| `--component-spacing-step-bar-width-16` | → `spacing.64` `64px` | → `spacing.64` `64px` | → `spacing.64` `64px` | → `spacing.64` `64px` |
| `--component-spacing-step-bar-width-20` | → `spacing.80` `80px` | → `spacing.80` `80px` | → `spacing.80` `80px` | → `spacing.80` `80px` |
| `--component-spacing-step-bar-width-touch` | → `spacing.44` `44px` | → `spacing.44` `44px` | → `spacing.44` `44px` | → `spacing.44` `44px` |
| `--component-spacing-step-bar-radius` | → `border.radius.sm` `4px` | → `border.radius.sm` `4px` | → `border.radius.sm` `4px` | → `border.radius.sm` `4px` |
| `--button-color-background-default` | → `color.background.transparent-none` `#1d203000` | → `color.background.transparent-none` `#1d203000` | → `color.background.brand-subtle` `#eaf5fc` | → `color.background.brand-subtle` `#0a2236` |
| `--button-color-background-hover` | → `color.background.transparent-none` `#1d203000` | → `color.background.transparent-none` `#1d203000` | → `color.background.brand-subtle-hover` `#c8e5f7` | → `color.background.brand-subtle-hover` `#0f3550` |
| `--button-color-background-active` | → `color.background.subtle` `#eceef3` | → `color.background.subtle` `#000000` | → `color.background.brand-subtle-hover` `#c8e5f7` | → `color.background.brand-subtle-hover` `#0f3550` |
| `--button-color-border-default` | → `color.border.strong` `#686d7d` | → `color.border.strong` `#858b9f` | → `color.border.brand` `#1865bb` | → `color.border.brand` `#63b4e8` |
| `--button-color-content-active` | → `color.content.brand` `#1d2030` | → `color.content.brand` `#eceef3` | → `color.content.brand-knockout` `#0a2236` | → `color.content.brand-hover` `#eaf5fc` |
