import type { HTMLAttributes, ReactNode } from 'react';
import { classNames } from '@/src/utils/classNames';
import styles from './StatusPill.module.css';

export type StatusTone = 'ready' | 'info' | 'warn' | 'locked';

export interface StatusPillProps extends HTMLAttributes<HTMLDivElement> {
  tone?: StatusTone;
  icon?: ReactNode;
  label: string;
}

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
