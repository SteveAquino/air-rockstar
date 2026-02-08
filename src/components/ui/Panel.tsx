import { classNames } from '@/src/utils/classNames';
import type { PanelProps } from './types';
import styles from './Card.module.css';

export type { PanelProps } from './types';

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
