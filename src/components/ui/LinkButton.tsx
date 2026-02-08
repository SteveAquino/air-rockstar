import Link, { type LinkProps } from 'next/link';
import type { AnchorHTMLAttributes } from 'react';
import { classNames } from '@/src/utils/classNames';
import styles from './Button.module.css';

export type LinkButtonVariant = 'primary' | 'ghost' | 'subtle';
export type LinkButtonSize = 'sm' | 'md' | 'lg';

export interface LinkButtonProps
  extends LinkProps,
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  variant?: LinkButtonVariant;
  size?: LinkButtonSize;
  isFullWidth?: boolean;
}

/**
 * Link styled like a button for navigation actions.
 */
export function LinkButton({
  variant = 'primary',
  size = 'md',
  isFullWidth = false,
  className,
  ...props
}: LinkButtonProps) {
  return (
    <Link
      className={classNames(
        styles.button,
        styles[variant],
        styles[size],
        isFullWidth && styles.fullWidth,
        className
      )}
      {...props}
    />
  );
}
