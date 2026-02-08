export type DrumKitVariant = 'synth' | 'acoustic';

export interface DrumPad {
  /** Unique identifier for the drum pad */
  id: string;
  /** Display name of the drum */
  name: string;
  /** X position as percentage of container width */
  x: number;
  /** Y position as percentage of container height */
  y: number;
  /** Width in pixels */
  width: number;
  /** Height in pixels */
  height: number;
  /** Default color */
  color: string;
  /** Color when pad is active/hit */
  activeColor: string;
}

export interface DrumKitOptions {
  /** Scale factor for pad size */
  padScale?: number;
  /** Extra padding (px) around pads for hit detection */
  hitPadding?: number;
  /** Master volume (0 to 1) */
  volume?: number;
  /** Enabled pad IDs (defaults to all pads) */
  enabledPadIds?: string[];
  /** Callback when a pad is hit */
  onHit?: (padId: string) => void;
}
