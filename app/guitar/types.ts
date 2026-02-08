import type { GuitarSoundVariant, GuitarString } from '@/src/types/guitar';
import type { RefObject } from 'react';

export interface GuitarHeaderProps {
  handsDetected: number;
  isReady: boolean;
}

export interface GuitarVideoStageProps {
  videoRef: RefObject<HTMLVideoElement>;
  canvasRef: RefObject<HTMLCanvasElement>;
  containerRef: RefObject<HTMLDivElement>;
  strings: GuitarString[];
  activeStrings: Set<string>;
  frettedStrings: Record<string, number>;
  fretZoneWidthRatio: number;
  strumZoneWidthRatio: number;
  fretCount: number;
  isReady: boolean;
  isFullScreen: boolean;
  onExitFullScreen: () => void;
  onStopCamera: () => void;
}

export interface GuitarStatsProps {
  combo: number;
  tempoLabel: string;
  hits: number;
}

export interface GuitarControlsProps {
  sensitivity: number;
  spacing: number;
  position: number;
  volume: number;
  fretCount: number;
  variant: GuitarSoundVariant;
  onSensitivityChange: (value: number) => void;
  onSpacingChange: (value: number) => void;
  onPositionChange: (value: number) => void;
  onVolumeChange: (value: number) => void;
  onFretCountChange: (value: number) => void;
  onVariantChange: (value: GuitarSoundVariant) => void;
}

export interface GuitarActionsProps {
  isFullScreen: boolean;
  onToggleFullScreen: () => void;
  onStopCamera: () => void;
}
