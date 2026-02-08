import type { DrumKitVariant } from '@/src/hooks/useDrumKit';

export const DRUM_HELP_TEXT = {
  combo: 'Your current streak of quick hits.',
  tempo: 'Estimated speed of your recent hits.',
  hits: 'Total hits this session.',
  sensitivity:
    'Makes hit detection more forgiving when your hands are a little off.',
  size: 'Changes how large the drum pads appear and how easy they are to reach.',
  volume: 'Controls how loud the drum hits sound.',
  soundVariant: 'Switch between electronic and acoustic drum sounds.',
  fullScreen: 'Expand the drum view to fill your screen. Press again to exit.',
  stopCamera: 'Turn off the camera and stop tracking.',
};

export const SOUND_VARIANTS: { value: DrumKitVariant; label: string }[] = [
  { value: 'synth', label: 'Synth' },
  { value: 'acoustic', label: 'Acoustic' },
];
