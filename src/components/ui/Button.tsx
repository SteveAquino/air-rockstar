import type { ButtonHTMLAttributes } from 'react';
import { classNames } from '@/src/utils/classNames';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'ghost' | 'subtle' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isFullWidth?: boolean;
}

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
