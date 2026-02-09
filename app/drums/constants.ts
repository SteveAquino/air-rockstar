import type { DrumKitVariant } from '@/src/types/drumKit';

export const DRUM_HELP_TEXT = {
  combo: 'Your current streak of quick hits.',
  tempo: 'Estimated speed of your recent hits.',
  hits: 'Total hits this session.',
  sensitivity:
    'Makes hit detection more forgiving when your hands are a little off.',
  size: 'Changes how large the drum pads appear and how easy they are to reach.',
  volume: 'Controls how loud the drum hits sound.',
  soundVariant: 'Switch between electronic and acoustic drum sounds.',
  kitPieces: 'Toggle individual drums and cymbals on or off.',
  fullScreen: 'Expand the drum view to fill your screen. Press again to exit.',
  stopCamera: 'Turn off the camera and stop tracking.',
};

export const SOUND_VARIANTS: { value: DrumKitVariant; label: string }[] = [
  { value: 'synth', label: 'Synth' },
  { value: 'acoustic', label: 'Acoustic' },
];

export const DRUM_KIT_PIECES = [
  { id: 'hihat', label: 'Hi-Hat' },
  { id: 'crash', label: 'Crash' },
  { id: 'tomHigh', label: 'High Tom' },
  { id: 'snare', label: 'Snare' },
  { id: 'tomLow', label: 'Low Tom' },
  { id: 'kick', label: 'Kick' },
];

export const DEFAULT_DRUM_KIT_IDS = DRUM_KIT_PIECES.map((piece) => piece.id);
