import { SegmentedControl } from '@/src/components/ui/SegmentedControl';
import { Slider } from '@/src/components/ui/Slider';
import type { DrumsControlsProps } from './types';
import type { DrumKitVariant } from '@/src/hooks/useDrumKit';
import { DRUM_HELP_TEXT, SOUND_VARIANTS } from './constants';
import styles from './page.module.css';

export function DrumsControls({
  sensitivity,
  padSize,
  volume,
  variant,
  onSensitivityChange,
  onPadSizeChange,
  onVolumeChange,
  onVariantChange,
}: DrumsControlsProps) {
  return (
    <>
      <div className={styles.sliderGroup}>
        <Slider
          label="Sensitivity"
          value={sensitivity}
          min={0}
          max={100}
          unit="%"
          onChange={onSensitivityChange}
          helpText={DRUM_HELP_TEXT.sensitivity}
        />
        <Slider
          label="Size"
          value={padSize}
          min={20}
          max={90}
          unit="%"
          onChange={onPadSizeChange}
          helpText={DRUM_HELP_TEXT.size}
        />
        <Slider
          label="Volume"
          value={volume}
          min={0}
          max={100}
          unit="%"
          onChange={onVolumeChange}
          helpText={DRUM_HELP_TEXT.volume}
        />
      </div>

      <SegmentedControl
        label="Sound Variant"
        value={variant}
        helpText={DRUM_HELP_TEXT.soundVariant}
        onChange={(value) => onVariantChange(value as DrumKitVariant)}
        options={SOUND_VARIANTS}
      />
    </>
  );
}
