import type { DrumKitVariant, DrumPad } from '@/src/types/drumKit';
import type { RefObject } from 'react';

export interface DrumsHeaderProps {
  handsDetected: number;
  isReady: boolean;
}

export interface DrumsVideoStageProps {
  videoRef: RefObject<HTMLVideoElement>;
  canvasRef: RefObject<HTMLCanvasElement>;
  containerRef: RefObject<HTMLDivElement>;
  pads: DrumPad[];
  activePads: Set<string>;
  isReady: boolean;
  isFullScreen: boolean;
  onExitFullScreen: () => void;
  onStopCamera: () => void;
}

export interface DrumsStatsProps {
  combo: number;
  tempoLabel: string;
  hits: number;
}

export interface DrumsControlsProps {
  sensitivity: number;
  padSize: number;
  volume: number;
  variant: DrumKitVariant;
  enabledPads: Set<string>;
  onSensitivityChange: (value: number) => void;
  onPadSizeChange: (value: number) => void;
  onVolumeChange: (value: number) => void;
  onVariantChange: (value: DrumKitVariant) => void;
  onTogglePad: (padId: string) => void;
}

export interface DrumsActionsProps {
  isFullScreen: boolean;
  onToggleFullScreen: () => void;
  onStopCamera: () => void;
}
