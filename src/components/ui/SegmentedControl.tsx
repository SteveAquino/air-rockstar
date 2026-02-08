import { classNames } from '@/src/utils/classNames';
import { HelpTooltip } from './HelpTooltip';
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
  helpText?: string;
}

/**
 * Accessible segmented control for choosing between multiple options.
 */
export function SegmentedControl({
  label,
  value,
  options,
  onChange,
  helpText,
}: SegmentedControlProps) {
  const isInteractive = Boolean(onChange);

  return (
    <div className={styles.wrapper}>
      <div className={styles.labelRow}>
        <span className={styles.label}>{label}</span>
        {helpText && <HelpTooltip label={`Help: ${label}`} text={helpText} />}
      </div>
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
