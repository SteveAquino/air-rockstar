import { classNames } from '@/src/utils/classNames';
import type { StatusPillProps } from './types';
import styles from './StatusPill.module.css';

export type { StatusPillProps, StatusTone } from './types';

/**
 * Status indicator with optional icon and tone.
 */
export function StatusPill({
  tone = 'info',
  icon,
  label,
  className,
  ...props
}: StatusPillProps) {
  return (
    <div className={classNames(styles.pill, styles[tone], className)} {...props}>
      <span className={styles.dot} aria-hidden="true" />
      {icon ? <span className={styles.icon}>{icon}</span> : null}
      <span className={styles.label}>{label}</span>
    </div>
  );
}
