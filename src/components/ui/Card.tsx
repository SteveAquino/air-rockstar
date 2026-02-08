import type { HTMLAttributes } from 'react';
import { classNames } from '@/src/utils/classNames';
import styles from './Card.module.css';

export type CardVariant = 'surface' | 'pop';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

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
