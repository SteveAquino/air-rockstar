export interface GuitarString {
  /** Unique identifier for the string */
  id: string;
  /** Display label for the string (E, A, D, G, B, E) */
  label: string;
  /** Musical note label (E2, A2, D3, G3, B3, E4) */
  note: string;
  /** Frequency in Hz for the string */
  frequency: number;
  /** Y position as percentage of container height */
  yPercent: number;
  /** Visual thickness of the string band in pixels */
  thicknessPx: number;
  /** Default color */
  color: string;
  /** Color when string is active/hit */
  activeColor: string;
}

export interface GuitarOptions {
  /** String spacing scale (0.3 to 1 relative to container height) */
  stringSpacing?: number;
  /** Visual thickness of the string band in pixels */
  stringThickness?: number;
  /** Extra padding (px) around string bands for hit detection */
  hitPadding?: number;
  /** Master volume (0 to 1) */
  volume?: number;
  /** Number of frets available in the fret zone */
  fretCount?: number;
  /** Width ratio (0-1) of the fret zone on the left side */
  fretZoneWidthRatio?: number;
  /** Width ratio (0-1) of the strum zone on the right side */
  strumZoneWidthRatio?: number;
  /** Cooldown in ms between hits per string */
  cooldownMs?: number;
  /** Callback when a string is hit */
  onHit?: (stringId: string) => void;
}
