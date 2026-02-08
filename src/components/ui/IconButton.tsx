import { classNames } from '@/src/utils/classNames';
import type { IconButtonProps } from './types';
import styles from './IconButton.module.css';

export type { IconButtonProps } from './types';

/**
 * Compact circular button for icon actions.
 */
export function IconButton({
  icon,
  className,
  ...props
}: IconButtonProps) {
  return (
    <button className={classNames(styles.button, className)} {...props}>
      {icon}
    </button>
  );
}
