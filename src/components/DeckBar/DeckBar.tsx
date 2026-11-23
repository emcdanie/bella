import React from 'react';
import Button from '../Button/Button';
import Progress from '../Progress/Progress';
import Kbd from '../Kbd/Kbd';
import styles from './DeckBar.module.css';

export interface DeckBarProps {
  /** The slide showing, counted from 1. */
  current: number;
  /** How many slides there are. */
  total: number;
  /** Back one slide. Missing, or on the first slide, the button is disabled. */
  onBack?: () => void;
  /** Forward one slide. On the last slide the button is disabled. */
  onNext?: () => void;
  /** Shows the Notes button. Called when pressed; `notesOpen` says whether the panel is open. */
  onNotes?: () => void;
  notesOpen?: boolean;
  /** Shows the All slides button. */
  onGrid?: () => void;
  className?: string;
}

/**
 * Deck bar (deck plan, 23 Nov 2026): the controls under a presented deck. Back, the count with one
 * segment per slide, Next, then Notes and All slides when the deck has them. Composes Button, Progress
 * (segments) and Kbd; the keys it names are the ones the deck binds (arrows, N, G).
 */
export default function DeckBar({ current, total, onBack, onNext, onNotes, notesOpen = false, onGrid, className }: DeckBarProps) {
  return (
    <div className={[styles.bar, className].filter(Boolean).join(' ')} role="group" aria-label="Deck controls" data-bella-component="deck-bar">
      <Button variant="secondary" icon="NavArrowLeft" onClick={onBack} disabled={!onBack || current <= 1}>Back</Button>
      <div className={styles.count}>
        <Progress
          label={`Slide ${current} of ${total}`}
          value={`${current} of ${total}`}
          showLabel={false}
          shape="segments"
          segments={total}
          done={current}
        />
        <span className={styles.text} aria-hidden="true">{current} of {total}</span>
      </div>
      <Button variant="secondary" icon="NavArrowRight" onClick={onNext} disabled={!onNext || current >= total}>Next</Button>
      {onNotes || onGrid ? (
        <div className={styles.extras}>
          {onNotes ? <Button variant="tertiary" onClick={onNotes} ariaPressed={notesOpen}>Notes <Kbd keys={['N']} label="N" /></Button> : null}
          {onGrid ? <Button variant="tertiary" onClick={onGrid}>All slides <Kbd keys={['G']} label="G" /></Button> : null}
        </div>
      ) : null}
    </div>
  );
}
