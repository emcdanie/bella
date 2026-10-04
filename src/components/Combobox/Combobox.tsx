import React, {
  useEffect,
  useId,
  useMemo,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import styles from "./Combobox.module.css";

export interface ComboboxOption {
  /** Stable id, unique across all groups. */
  id: string;
  /** What the option says. Sentence case. */
  label: string;
  /** A quiet second line on the right ("Component · 5 parts"). */
  meta?: string;
}

export interface ComboboxGroup {
  /** Stable id for the group. */
  id: string;
  /** The group heading ("Jump to", "Ask OBI"). */
  label: string;
  options: ComboboxOption[];
}

export interface ComboboxProps {
  /** Names the field and the list. */
  label: string;
  /** Keep the label for assistive tech only, when the context already names the field. */
  hideLabel?: boolean;
  /** The text in the field. */
  value: string;
  onChange: (value: string) => void;
  /** Grouped options, in order. Empty groups are skipped. */
  groups: ComboboxGroup[];
  /** Called with the chosen option (Enter on the active one, or a click). */
  onSelect: (option: ComboboxOption, groupId: string) => void;
  /** The option that is active when the list opens or changes. Defaults to the first. */
  defaultOptionId?: string;
  /** Where the list opens: below the field (default) or above it. */
  placement?: "below" | "above";
  placeholder?: string;
  /** Something quiet at the end of the field, such as a Kbd shortcut. */
  hint?: ReactNode;
  /** Runs before the field's own keys; call preventDefault to take the key over. */
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
  /** Id for the input. */
  id?: string;
  className?: string;
}

/**
 * One field that filters a grouped list: the ARIA combobox pattern. Typing
 * opens the list; Up and Down move the active option (aria-activedescendant,
 * focus stays in the field); Enter chooses it; Esc closes the list. The
 * active option is the ochre fill; nothing else dims.
 */
export default function Combobox({
  label,
  hideLabel = false,
  value,
  onChange,
  groups,
  onSelect,
  defaultOptionId,
  placement = "below",
  placeholder,
  hint,
  onKeyDown,
  id,
  className,
}: ComboboxProps) {
  const base = useId();
  const inputId = id ?? `${base}-input`;
  const listId = `${base}-list`;
  const shown = useMemo(() => groups.filter((g) => g.options.length), [groups]);
  const flat = useMemo(
    () => shown.flatMap((g) => g.options.map((o) => ({ o, g: g.id }))),
    [shown],
  );
  const optId = (i: number) => `${base}-opt-${i}`;
  const startAt = () =>
    Math.max(
      0,
      flat.findIndex((f) => f.o.id === defaultOptionId),
    );
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const signature = flat.map((f) => f.o.id).join("|");

  // a new list starts on the preferred option
  useEffect(() => setActive(startAt()), [signature, defaultOptionId]); // eslint-disable-line react-hooks/exhaustive-deps

  const expanded = open && flat.length > 0;

  function choose(i: number) {
    const f = flat[i];
    if (!f) return;
    setOpen(false);
    onSelect(f.o, f.g);
  }

  function keys(e: KeyboardEvent<HTMLInputElement>) {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (!flat.length) return;
      e.preventDefault();
      if (!expanded) {
        setOpen(true);
        return;
      }
      const step = e.key === "ArrowDown" ? 1 : flat.length - 1;
      setActive((a) => (a + step) % flat.length);
    } else if (e.key === "Enter") {
      if (expanded) {
        e.preventDefault();
        choose(active);
      }
    } else if (e.key === "Escape" && expanded) {
      // the list closes first; a second Esc is the page's to use
      e.preventDefault();
      e.stopPropagation();
      setOpen(false);
    }
  }

  let n = -1;
  return (
    <div
      className={[styles.combobox, className].filter(Boolean).join(" ")}
      data-placement={placement}
      data-bella-component="combobox"
    >
      <label
        htmlFor={inputId}
        className={hideLabel ? styles.srOnly : styles.label}
      >
        {label}
      </label>
      <div className={styles.anchor}>
        <div className={styles.field}>
          <input
            id={inputId}
            className={styles.input}
            type="text"
            role="combobox"
            aria-expanded={expanded}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={expanded ? optId(active) : undefined}
            autoComplete="off"
            spellCheck={false}
            value={value}
            placeholder={placeholder}
            onChange={(e) => {
              onChange(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setOpen(false)}
            onKeyDown={keys}
          />
          {hint ? <span className={styles.hint}>{hint}</span> : null}
        </div>
        <div
          id={listId}
          role="listbox"
          aria-label={label}
          className={styles.list}
          hidden={!expanded}
        >
          {shown.map((g) => (
            <div
              key={g.id}
              role="group"
              aria-labelledby={`${base}-g-${g.id}`}
              className={styles.group}
            >
              <p
                id={`${base}-g-${g.id}`}
                className={styles.groupLabel}
                role="presentation"
              >
                {g.label}
              </p>
              {g.options.map((o) => {
                n += 1;
                const i = n;
                return (
                  <div
                    key={o.id}
                    id={optId(i)}
                    role="option"
                    aria-selected={i === active}
                    className={styles.option}
                    onMouseDown={(e) => e.preventDefault()}
                    onMouseMove={() => setActive(i)}
                    onClick={() => choose(i)}
                  >
                    <span className={styles.optionLabel}>{o.label}</span>
                    {o.meta ? (
                      <span className={styles.meta}>{o.meta}</span>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
