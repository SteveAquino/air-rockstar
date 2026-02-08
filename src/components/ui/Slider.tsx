import type { ChangeEvent } from 'react';
import { HelpTooltip } from './HelpTooltip';
import styles from './Slider.module.css';

export interface SliderProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  unit?: string;
  onChange?: (value: number) => void;
  helpText?: string;
}

/**
 * Styled range slider with label and value display.
 */
export function Slider({
  label,
  value,
  min = 0,
  max = 100,
  unit = '',
  onChange,
  helpText,
}: SliderProps) {
  const isInteractive = Boolean(onChange);
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(Number(event.target.value));
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.labelRow}>
          <span className={styles.label}>{label}</span>
          {helpText && (
            <HelpTooltip label={`Help: ${label}`} text={helpText} />
          )}
        </div>
        <span className={styles.value}>
          {value}
          {unit}
        </span>
      </div>
      <input
        className={styles.slider}
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={isInteractive ? handleChange : undefined}
        readOnly={!isInteractive}
        aria-label={label}
      />
    </div>
  );
}
