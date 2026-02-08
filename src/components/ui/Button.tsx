import { classNames } from '@/src/utils/classNames';
import type { ButtonProps } from './types';
import styles from './Button.module.css';

export type { ButtonProps, ButtonSize, ButtonVariant } from './types';

/**
 * Primary action button with size and variant options.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  isFullWidth = false,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
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
