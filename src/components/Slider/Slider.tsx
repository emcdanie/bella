import React, { useId, type CSSProperties, type ReactNode } from 'react';
import styles from './Slider.module.css';

export interface SliderMark {
  value: number;
  /** What the mark means ("BELLA floor"). */
  label: string;
}

export interface SliderProps {
  /** Visible label, always rendered. */
  label: string;
  value: number;
  /** Called with the new number while dragging, on arrow keys and when the value field changes. */
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  /** Unit after the number, read out in aria-valuetext ("44px"). */
  unit?: string;
  /** Marks on the track where a rule lives, each with a short label. */
  marks?: SliderMark[];
  /** Supporting hint below the slider. */
  hint?: ReactNode;
  disabled?: boolean;
  id?: string;
  className?: string;
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/**
 * A native range with its value beside it (and editable), the 44px target,
 * arrow keys from the browser, and optional marks where a rule lives
 * (Atlas v4, 2026-10-03). The value is read out with its unit.
 */
export default function Slider({ label, value, onChange, min, max, step = 1, unit = '', marks, hint, disabled, id, className }: SliderProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const marksId = `${fieldId}-marks`;
  const hintId = `${fieldId}-hint`;
  const pct = (v: number) => ((clamp(v, min, max) - min) / (max - min)) * 100;
  const describedBy = [marks?.length ? marksId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined;
  return (
    <div
      className={[styles.slider, className].filter(Boolean).join(' ')}
      style={{ '--slider-pct': `${pct(value)}%` } as CSSProperties}
      data-bella-component="slider"
    >
      <div className={styles.head}>
        <label className={styles.label} htmlFor={fieldId}>
          {label}
        </label>
        <span className={styles.valueBox}>
          <input
            type="number"
            className={styles.value}
            aria-label={`${label}, value${unit ? ` in ${unit}` : ''}`}
            min={min}
            max={max}
            step={step}
            value={value}
            disabled={disabled}
            onChange={(e) => {
              const n = Number(e.target.value);
              if (e.target.value !== '' && !Number.isNaN(n)) onChange(clamp(n, min, max));
            }}
          />
          {unit ? <span className={styles.unit} aria-hidden="true">{unit}</span> : null}
        </span>
      </div>
      <div className={styles.track}>
        <input
          id={fieldId}
          type="range"
          className={styles.range}
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          aria-valuetext={`${value}${unit}`}
          aria-describedby={describedBy}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        {marks?.length ? (
          <ul className={styles.marks} id={marksId} aria-label={`${label} marks`}>
            {marks.map((m) => (
              <li key={m.value} className={styles.mark} style={{ '--mark-f': pct(m.value) / 100 } as CSSProperties}>
                <span className={styles.tick} aria-hidden="true" />
                <span className={styles.markLabel}>
                  <b>
                    {m.value}
                    {unit}
                  </b>{' '}
                  {m.label}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      {hint ? (
        <p className={styles.hint} id={hintId}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
