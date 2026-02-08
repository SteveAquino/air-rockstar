import type { HTMLAttributes } from 'react';
import { classNames } from '@/src/utils/classNames';
import styles from './Cluster.module.css';

export interface ClusterProps extends HTMLAttributes<HTMLDivElement> {
  gap?: 'sm' | 'md' | 'lg';
  wrap?: boolean;
  align?: 'center' | 'start' | 'end';
  justify?: 'start' | 'center' | 'between';
}

/**
 * Horizontal cluster layout with optional wrap.
 */
export function Cluster({
  gap = 'md',
  wrap = false,
  align = 'center',
  justify = 'start',
  className,
  ...props
}: ClusterProps) {
  return (
    <div
      className={classNames(
        styles.cluster,
        styles[gap],
        styles[align],
        styles[`justify-${justify}`],
        wrap && styles.wrap,
        className
      )}
      {...props}
    />
  );
}
