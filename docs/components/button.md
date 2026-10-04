# Button

Longer guidance and the reasons behind it. The rules themselves (variants, states, what to use instead) live in the contract, `tokens/component.json` → `component.button`, where agents and the gate read them. This file never repeats a rule; it explains them.

## Why a keycap

BELLA's primary Button is drawn as a physical key: a plate, a gloss, an edge and a short shadow from one light source, upper left. It is the only raised control in the system, so it reads as the thing to press before anyone reads its label. That is also why a view gets at most one: two keycaps compete, and the page stops saying what it is for.

## Choosing a tier

- Reach for the keycap when the view exists to make one thing happen: send, save, start.
- The outlined secondary tier carries the actions that sit beside it: cancel, back, a second path. It goes ink on hover, so it is clearly a button without competing with the keycap.
- The tertiary tier is a text action in a sentence or a dense row, where an outline would be noise.
- If an action is small and repeated (Copy, Test, a suggestion under an answer), it is not a Button tier at all: it is an ActionChip.

## Writing labels

Labels are set in caps on every tier because the keycap is the brand mark, so keep them short: a verb, or a verb and its object ("Save changes", "Open the story"). Say what will happen, not what the control is. Avoid "Submit", "OK" and "Click here": they make people read the page again to know what they agreed to.

## Motion

Hover and focus roll the label up and bring a copy in from below; pressing the keycap moves it down by its own edge. The roll gives feedback without moving the box, so a row of buttons never jitters, and the press is the one moment of depth. With reduced motion on, the colour change stays and the roll and press stop.

## Size

There is one size. The 44px minimum is the touch target BELLA holds everywhere, not a style choice, so a compact layout gets less padding around the Button, never a smaller one.
