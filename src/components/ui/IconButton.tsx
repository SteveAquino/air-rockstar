import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { classNames } from '@/src/utils/classNames';
import styles from './IconButton.module.css';

export interface IconButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
}

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
