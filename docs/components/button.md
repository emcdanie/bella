# Button

Longer guidance and the reasons behind it. The rules themselves (variants, states, what to use instead) live in the contract, `tokens/component.json` → `component.button`, where agents and the gate read them. This file never repeats a rule; it explains them.

## Why one primary

The primary Button is a flat plate (the look is in the contract, `component.button`; since the shared look, 8 Nov 2026, there is no gloss, no edge and no lift). It is the strongest action on the page, so a view gets at most one: two primaries compete, and the page stops saying what it is for.

## Choosing a tier

- Reach for the primary when the view exists to make one thing happen: send, save, start.
- The outlined secondary tier carries the actions that sit beside it: cancel, back, a second path. It goes ink on hover, so it is clearly a button without competing with the primary.
- The tertiary tier is a text action in a sentence or a dense row, where an outline would be noise.
- If an action is small and repeated (Copy, Test, a suggestion under an answer), it is not a Button tier at all: it is an ActionChip.

## Writing labels

Labels are sentence case on every tier (the contract, `component.button`). Keep them short: a verb, or a verb and its object ("Save changes", "Open the story"). Say what will happen, not what the control is. Avoid "Submit", "OK" and "Click here": they make people read the page again to know what they agreed to.

## Motion

Hover and focus roll the label up and bring a copy in from below; pressing the primary moves it a small step down. The roll gives feedback without moving the box, so a row of buttons never jitters. With reduced motion on, the colour change stays and the roll and press stop.

## Size

Two sizes, default and `sm`, both in the contract (`component.button`). The 44px touch target holds at both: `sm` draws a smaller box but keeps the tap area, so use it for dense rows and tool bars, never to dodge the floor.
