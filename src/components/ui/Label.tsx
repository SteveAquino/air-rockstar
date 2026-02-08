import { classNames } from '@/src/utils/classNames';
import type { LabelProps } from './types';
import styles from './Label.module.css';

export type { LabelProps } from './types';

/**
 * Small uppercase label for field titles.
 */
export function Label({ className, ...props }: LabelProps) {
  return <span className={classNames(styles.label, className)} {...props} />;
}
