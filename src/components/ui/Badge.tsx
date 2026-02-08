import type { HTMLAttributes } from 'react';
import { classNames } from '@/src/utils/classNames';
import styles from './Badge.module.css';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: 'accent' | 'muted';
}

/**
 * Small badge for secondary labels.
 */
export function Badge({ tone = 'accent', className, ...props }: BadgeProps) {
  return (
    <span className={classNames(styles.badge, styles[tone], className)} {...props} />
  );
}
