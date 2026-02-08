import Link from 'next/link';
import { classNames } from '@/src/utils/classNames';
import type { LinkButtonProps } from './types';
import styles from './Button.module.css';

export type { LinkButtonProps, LinkButtonSize, LinkButtonVariant } from './types';

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
