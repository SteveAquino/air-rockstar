import { classNames } from '@/src/utils/classNames';
import styles from './SegmentedControl.module.css';

export interface SegmentedOption {
  value: string;
  label: string;
}

export interface SegmentedControlProps {
  label: string;
  value: string;
  options: SegmentedOption[];
  onChange?: (value: string) => void;
}

/**
 * Accessible segmented control for choosing between multiple options.
 */
export function SegmentedControl({
  label,
  value,
  options,
  onChange,
}: SegmentedControlProps) {
  const isInteractive = Boolean(onChange);

  return (
    <div className={styles.wrapper}>
      <span className={styles.label}>{label}</span>
      <div className={styles.group} role="radiogroup" aria-label={label}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={option.value === value}
            aria-disabled={!isInteractive}
            className={classNames(
              styles.option,
              option.value === value && styles.active
            )}
            onClick={onChange ? () => onChange(option.value) : undefined}
            disabled={!isInteractive}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
