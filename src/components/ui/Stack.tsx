import { classNames } from '@/src/utils/classNames';
import type { StackProps } from './types';
import styles from './Stack.module.css';

export type { StackProps } from './types';

/**
 * Vertical stack layout with consistent spacing.
 */
export function Stack({ gap = 'md', className, ...props }: StackProps) {
  return (
    <div className={classNames(styles.stack, styles[gap], className)} {...props} />
  );
}
