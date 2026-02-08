import { classNames } from '@/src/utils/classNames';
import type { BadgeProps } from './types';
import styles from './Badge.module.css';

export type { BadgeProps, BadgeTone } from './types';

/**
 * Small badge for secondary labels.
 */
export function Badge({ tone = 'accent', className, ...props }: BadgeProps) {
  return (
    <span className={classNames(styles.badge, styles[tone], className)} {...props} />
  );
}
