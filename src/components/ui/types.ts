import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  HTMLAttributes,
  ReactNode,
} from 'react';
import type { LinkProps } from 'next/link';

export type ButtonVariant = 'primary' | 'ghost' | 'subtle' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isFullWidth?: boolean;
}

export type BadgeTone = 'accent' | 'muted';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

export type CardVariant = 'surface' | 'pop';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

export interface ClusterProps extends HTMLAttributes<HTMLDivElement> {
  gap?: 'sm' | 'md' | 'lg';
  wrap?: boolean;
  align?: 'center' | 'start' | 'end';
  justify?: 'start' | 'center' | 'between';
}

export interface HelpTooltipProps {
  label: string;
  text: string;
  className?: string;
}

export interface IconButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
}

export interface LabelProps extends HTMLAttributes<HTMLSpanElement> {}

export type LinkButtonVariant = 'primary' | 'ghost' | 'subtle';
export type LinkButtonSize = 'sm' | 'md' | 'lg';

export interface LinkButtonProps
  extends LinkProps,
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  variant?: LinkButtonVariant;
  size?: LinkButtonSize;
  isFullWidth?: boolean;
}

export interface PanelProps extends HTMLAttributes<HTMLElement> {
  as?: 'section' | 'aside' | 'div';
}

export interface SegmentedOption {
  value: string;
  label: string;
}

export interface SegmentedControlProps {
  label: string;
  value: string;
  options: SegmentedOption[];
  onChange?: (value: string) => void;
  helpText?: string;
}

export interface SliderProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  unit?: string;
  onChange?: (value: number) => void;
  helpText?: string;
}

export interface StackProps extends HTMLAttributes<HTMLDivElement> {
  gap?: 'sm' | 'md' | 'lg';
}

export type StatusTone = 'ready' | 'info' | 'warn' | 'locked';

export interface StatusPillProps extends HTMLAttributes<HTMLDivElement> {
  tone?: StatusTone;
  icon?: ReactNode;
  label: string;
}

export interface CameraSetupCardProps {
  title: string;
  description?: string;
  isRequesting: boolean;
  onEnable?: () => void;
  buttonLabel?: string;
  loadingLabel?: string;
}
