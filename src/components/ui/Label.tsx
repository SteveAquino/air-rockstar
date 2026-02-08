import type { HTMLAttributes } from 'react';
import { classNames } from '@/src/utils/classNames';
import styles from './Label.module.css';

export interface LabelProps extends HTMLAttributes<HTMLSpanElement> {}

/**
 * Small uppercase label for field titles.
 */
export function Label({ className, ...props }: LabelProps) {
  return <span className={classNames(styles.label, className)} {...props} />;
}
