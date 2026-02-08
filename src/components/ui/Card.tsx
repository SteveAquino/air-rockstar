import { classNames } from '@/src/utils/classNames';
import type { CardProps } from './types';
import styles from './Card.module.css';

export type { CardProps, CardVariant } from './types';

/**
 * Elevated surface for grouping content.
 */
export function Card({ variant = 'surface', className, ...props }: CardProps) {
  return (
    <div
      className={classNames(styles.card, styles[variant], className)}
      {...props}
    />
  );
}
