import type { HTMLAttributes } from 'react';
import { classNames } from '@/src/utils/classNames';
import styles from './Stack.module.css';

export interface StackProps extends HTMLAttributes<HTMLDivElement> {
  gap?: 'sm' | 'md' | 'lg';
}

/**
 * Vertical stack layout with consistent spacing.
 */
export function Stack({ gap = 'md', className, ...props }: StackProps) {
  return (
    <div className={classNames(styles.stack, styles[gap], className)} {...props} />
  );
}
