'use client';

import { useId, useState } from 'react';
import { classNames } from '@/src/utils/classNames';
import styles from './HelpTooltip.module.css';

export interface HelpTooltipProps {
  label: string;
  text: string;
  className?: string;
}

/**
 * Question-mark tooltip for explaining controls in plain language.
 */
export function HelpTooltip({ label, text, className }: HelpTooltipProps) {
  const tooltipId = useId();
  const [isPinned, setIsPinned] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isOpen = isPinned || isHovered || isFocused;

  return (
    <span
      className={classNames(styles.wrapper, className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        type="button"
        className={styles.button}
        aria-label={label}
        aria-expanded={isOpen}
        aria-describedby={tooltipId}
        onClick={() => setIsPinned((prev) => !prev)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          setIsPinned(false);
        }}
      >
        ?
      </button>
      <span
        role="tooltip"
        id={tooltipId}
        className={styles.tooltip}
        data-open={isOpen}
      >
        {text}
      </span>
    </span>
  );
}
