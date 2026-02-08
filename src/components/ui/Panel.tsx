import type { HTMLAttributes } from 'react';
import { classNames } from '@/src/utils/classNames';
import styles from './Card.module.css';

export interface PanelProps extends HTMLAttributes<HTMLElement> {
  as?: 'section' | 'aside' | 'div';
}

/**
 * Panel container for sections of UI content.
 */
export function Panel({
  as = 'section',
  className,
  ...props
}: PanelProps) {
  const Component = as;
  return (
    <Component
      className={classNames(styles.panel, className)}
      {...props}
    />
  );
}
