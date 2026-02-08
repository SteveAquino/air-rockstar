import { classNames } from '@/src/utils/classNames';
import type { ClusterProps } from './types';
import styles from './Cluster.module.css';

export type { ClusterProps } from './types';

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
